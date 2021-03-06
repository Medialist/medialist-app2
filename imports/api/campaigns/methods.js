import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import babyparse from 'babyparse'
import moment from 'moment'
import createUniqueSlug from '/imports/lib/slug'
import Campaigns from './campaigns'
import Clients from '/imports/api/clients/clients'
import Uploadcare from '/imports/lib/uploadcare'
import Posts from '/imports/api/posts/posts'
import { addToMyFavourites, findOneUserRef, findUserRefs } from '/imports/api/users/users'
import MasterLists from '/imports/api/master-lists/master-lists'
import Contacts from '/imports/api/contacts/contacts'
import toUserRef from '/imports/lib/to-user-ref'
import { LinkSchema } from '/imports/lib/schema'
import trackEvent from '/imports/ui/integrations/track-event'
import { CampaignSlugsOrSearchSchema } from '/imports/api/campaigns/schema'
import { findOrValidateCampaignSlugs } from '/imports/api/campaigns/queries'

let sendCampaignLink = () => ([])
let createInvitationLink = () => ([])
let findOrCreateUser = () => {}
let createUsers = () => {}

if (Meteor.isServer) {
  sendCampaignLink = require('./server/send-campaign-link').default
  createInvitationLink = require('./server/send-campaign-link').createInvitationLink
  findOrCreateUser = require('../users/server/find-or-create-user').default
  createUsers = require('./server/create-users').default
}

function findOrCreateClientRef (name) {
  if (!name) {
    return null
  }

  const nameRegex = new RegExp('^' + escapeRegExp(name) + '$', 'i')
  const client = Clients.findOne({ name: nameRegex })

  if (client) {
    return {
      _id: client._id,
      name: client.name
    }
  }

  const _id = Clients.insert({ name })

  return {_id, name}
}

// Add all campaigns to myCampaigns
// Update existing favs with new updatedAt
export const batchFavouriteCampaigns = new ValidatedMethod({
  name: 'batchFavouriteCampaigns',

  // don't use the clients guess of how many were fav'd
  applyOptions: {
    returnStubValue: false
  },

  validate: CampaignSlugsOrSearchSchema.validator(),

  run (slugsOrSearch) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const campaignSlugs = findOrValidateCampaignSlugs(slugsOrSearch)

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs
    })

    return { slugCount: campaignSlugs.length }
  }
})

export const updateCampaign = new ValidatedMethod({
  name: 'Campaigns/update',
  validate: new SimpleSchema({
    '_id': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    name: {
      type: String,
      optional: true
    },
    clientName: {
      type: String,
      optional: true
    },
    purpose: {
      type: String,
      optional: true
    },
    links: {
      type: Array
    },
    'links.$': {
      type: LinkSchema
    },
    avatar: {
      type: String,
      optional: true
    }
  }).validator(),
  run (data) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const { _id } = data
    delete data._id

    if (!Object.keys(data).length) {
      throw new Error('Missing fields to update')
    }

    const oldCampaign = Campaigns.findOne({ _id }, {fields: {team: 1}})

    if (!oldCampaign) {
      throw new Meteor.Error('Medialist not found')
    }

    data.client = findOrCreateClientRef(data.clientName)
    delete data.clientName

    const userRef = findOneUserRef(this.userId)

    data.updatedBy = userRef
    data.updatedAt = new Date()

    const update = {
      $set: data,
      $push: {
        team: userRef
      }
    }

    // UserRef objects in the team array should be unique.
    if (oldCampaign.team.some(t => t._id === userRef._id)) {
      delete update.$push
    }

    const result = Campaigns.update({_id}, update)

    if (Meteor.isServer) {
      Uploadcare.store(data.avatar)
    }

    const updatedCampaign = Campaigns.findOne({ _id })

    // Update existing users' favourite campaigns with new denormalised data
    Meteor.users.update({
      'myCampaigns._id': _id
    }, {
      $set: {
        'myCampaigns.$.name': updatedCampaign.name,
        'myCampaigns.$.slug': updatedCampaign.slug,
        'myCampaigns.$.avatar': updatedCampaign.avatar,
        'myCampaigns.$.clientName': updatedCampaign.client
          ? updatedCampaign.client.name
          : null,
        'myCampaigns.$.updatedAt': updatedCampaign.updatedAt
      }
    }, {
      multi: true
    })

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: [updatedCampaign.slug]
    })

    return result
  }
})

export const createCampaign = new ValidatedMethod({
  name: 'Campaigns/create',
  validate: new SimpleSchema({
    name: {
      type: String,
      min: 1,
      label: 'campaign name'
    },
    clientName: {
      type: String,
      optional: true
    },
    purpose: {
      type: String,
      optional: true
    },
    links: {
      type: Array,
      optional: true
    },
    'links.$': {
      type: LinkSchema
    },
    avatar: {
      type: String,
      optional: true
    }
  }).validator(),
  run ({ name, clientName, avatar, purpose, links = [] }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const slug = createUniqueSlug(name, Campaigns)
    const client = findOrCreateClientRef(clientName)
    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()

    const doc = {
      name,
      slug,
      client,
      avatar,
      purpose,
      links,
      contacts: [],
      team: [createdBy],
      masterLists: [],
      tags: [],
      createdBy,
      createdAt,
      updatedBy: createdBy,
      updatedAt: createdAt
    }

    const campaignId = Campaigns.insert(doc)
    const campaign = Campaigns.findOne({_id: campaignId})

    if (Meteor.isServer) {
      Uploadcare.store(campaign.avatar)
    }

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: [campaign.slug]
    })

    // update campaign count
    Meteor.users.update({
      _id: this.userId
    }, {
      $inc: {
        onCampaigns: 1
      }
    })

    // Add an entry to the activity feed
    Posts.create({
      type: 'CreateCampaign',
      campaignSlugs: [campaign.slug],
      createdBy
    })

    trackEvent('Created Campaign', {name: campaign.name, slug: campaign.slug})

    return slug
  }
})

export const removeCampaign = new ValidatedMethod({
  name: 'Campaigns/remove',

  // don't use the clients guess of how many were removed
  applyOptions: {
    returnStubValue: false
  },

  validate: CampaignSlugsOrSearchSchema.validator(),

  run (slugsOrSearch) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateCampaignSlugs(slugsOrSearch)

    slugs.forEach(slug => {
      // get slugs from ids
      const campaign = Campaigns.findOne({
        slug: slug
      }, {
        fields: {
          _id: 1,
          team: 1
        }
      })

      const _id = campaign._id

      Campaigns.remove({
        _id: _id
      })

      // Remove campaigns from user favourites
      Meteor.users.update({
        'myCampaigns._id': _id
      }, {
        $pull: {
          'myCampaigns': {
            '_id': _id
          }
        }
      }, {
        multi: true
      })

      // update campaign counts for team members
      Meteor.users.update({
        _id: {
          $in: campaign.team.map(user => user._id)
        }
      }, {
        $inc: {
          onCampaigns: -1
        }
      }, {
        multi: true
      })

      // Remove campaigns from campaign lists
      MasterLists.update({
        type: 'Campaigns'
      }, {
        $pull: {
          items: _id
        }
      }, {
        multi: true
      })

      // Remove campaigns from contacts
      Contacts.update({}, {
        $pull: {
          campaigns: slug
        }
      }, {
        multi: true
      })

      // remove campaign from posts
      Posts.update({
        'campaigns._id': _id
      }, {
        $pull: {
          campaigns: {
            _id: _id
          }
        }
      }, {
        multi: true
      })

      // remove posts with no campaigns that are not need-to-know
      Posts.remove({
        type: {
          $nin: ['NeedToKnowPost']
        },
        campaigns: {
          $exists: true,
          $size: 0
        }
      })
    })

    return { slugCount: slugs.length }
  }
})

export const setTeamMates = new ValidatedMethod({
  name: 'Campaigns/setTeamMates',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    userIds: {
      type: Array
    },
    'userIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    emails: {
      type: Array
    },
    'emails.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validator(),
  run ({ _id, userIds = [], emails = [] }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const campaign = Campaigns.findOne(_id)

    if (!campaign) {
      throw new Meteor.Error('Campaign not found')
    }

    const user = Meteor.users.findOne({
      _id: this.userId
    })

    const newUserIds = createUsers(emails)

    // dedupe user id list
    userIds = Array.from(new Set(userIds.concat(newUserIds)))

    // who used to be on the team
    const existingUserIds = campaign.team.map(user => user._id)

    // who was removed from the team
    const removedUserIds = existingUserIds
      .filter(id => !userIds.includes(id))

    // who was added to the team
    const addedUserIds = userIds
      .filter(id => !existingUserIds.includes(id))

    // no change, so bail early.
    if (addedUserIds.length === 0 && removedUserIds.length === 0) {
      return {numberAffected: 0}
    }

    // update the team
    const result = Campaigns.update(campaign._id, {
      $set: {
        updatedBy: toUserRef(user),
        updatedAt: new Date(),
        team: findUserRefs(userIds)
      }
    })

    // update campaign counts for removed users
    Meteor.users.update({
      _id: {
        $in: removedUserIds
      }
    }, {
      $inc: {
        onCampaigns: -1
      }
    }, {
      multi: true
    })

    // update campaign counts for added users
    Meteor.users.update({
      _id: {
        $in: addedUserIds
      }
    }, {
      $inc: {
        onCampaigns: 1
      }
    }, {
      multi: true
    })

    // Add this campaign to the updating user's favourites if required
    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: [campaign.slug]
    })

    addedUserIds.forEach(userId => {
      // Add this campaign to the teammember's favourites if required
      addToMyFavourites({
        userId: userId,
        campaignSlugs: [campaign.slug]
      })

      trackEvent('Added Teammate', { user_id: userId })
    })

    if (!this.isSimulation) {
      Meteor.defer(() => {
        const ids = newUserIds
          .concat(addedUserIds)
          .filter(id => id !== this.userId)

        sendCampaignLink(ids, user, campaign)
      })
    }

    return result
  }
})

export const createCampaignInvitationLink = new ValidatedMethod({
  name: 'Campaigns/createInvitationLink',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run ({email, _id}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const campaign = Campaigns.findOne({
      _id: _id
    })

    if (!campaign) {
      throw new Meteor.Error('No campaign found')
    }

    const user = findOrCreateUser(email)

    return createInvitationLink(user, campaign)
  }
})

export const exportCampaignToCsv = new ValidatedMethod({
  name: 'exportCampaignToCsv',

  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    campaignSlug: {
      type: String
    },
    contactSlugs: {
      type: Array,
      optional: true
    },
    'contactSlugs.$': {
      type: String
    }
  }).validator(),

  run ({campaignSlug, contactSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const pipeline = [{
      $match: {
        slug: campaignSlug
      }
    }, {
      $project: {
        campaign: '$slug',
        contacts: 1
      }
    }, {
      $unwind: '$contacts'
    }, {
      $lookup: {
        from: 'contacts',
        localField: 'contacts.slug',
        foreignField: 'slug',
        as: 'remote_contact'
      }
    }, {
      $unwind: {
        path: '$remote_contact'
      }
    }, {
      $project: {
        name: '$remote_contact.name',
        outlets: '$remote_contact.outlets',
        status: '$contacts.status',
        latestPost: '$contacts.latestPost',
        owners: '$contacts.owners',
        coverage: '$contacts.coverage',
        updatedAt: '$contacts.updatedAt',
        updatedBy: '$contacts.updatedBy'
      }
    }]

    // Strip out contacts that the user didn't explicitly ask for.
    if (contactSlugs && contactSlugs.length) {
      pipeline.splice(3, 0, {
        $match: {
          'contacts.slug': {
            $in: contactSlugs
          }
        }
      })
    }

    const formatCoverage = (arr) => {
      if (!arr || !arr.length) return 'No coverage yet'
      return arr
        .map(c => c.embeds)
        .reduce((a, b) => a.concat(b))
        .map(embed => embed.url)
        .join('\n\n')
    }

    const res = Campaigns.aggregate(pipeline).map(c => {
      let message = (c.latestPost && c.latestPost.message) || ''
      if (c.latestPost && c.latestPost.type === 'StatusUpdate') {
        message = 'Status updated'
      }
      // Ensure all fields appear, and the keys are human friendly for the csv header row.
      return {
        'Name': c.name,
        'Outlet': (c.outlets[0] && c.outlets[0].label) || '',
        'Title': (c.outlets[0] && c.outlets[0].value) || '',
        'Status': c.status,
        'Latest Activity': message,
        'Updated At': moment(c.updatedAt).toISOString(),
        'Updated By': c.updatedBy.name,
        'Coverage': formatCoverage(c.coverage),
        'Owner': (c.owners && c.owners[0] && c.owners[0].name) || ''
      }
    })

    const csvStr = babyparse.unparse(res)

    return {
      filename: `${campaignSlug}.csv`,
      data: csvStr
    }
  }
})

export const assignContactOwner = new ValidatedMethod({
  name: 'AssignContactOwner',

  validate: new SimpleSchema({
    campaignSlug: {
      type: String
    },
    contactSlugs: {
      type: Array
    },
    'contactSlugs.$': {
      type: String
    },
    ownerUserId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),

  run ({campaignSlug, contactSlugs, ownerUserId}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }
    const campaign = Campaigns.findOne({slug: campaignSlug})

    if (!campaign) {
      throw new Meteor.Error('Campaign not found')
    }

    const ownerUserRef = findOneUserRef(ownerUserId)

    // 1. add owner userRef as owner to each contact.
    contactSlugs.forEach(contactSlug => {
      Campaigns.update({
        slug: campaignSlug,
        'contacts.slug': contactSlug
      }, {
        $set: {
          'contacts.$.owners.0': ownerUserRef
        }
      })
    })

    // 2. add owner userRef to team if missing.
    const isInTeam = campaign.team.some(userRef => userRef._id === ownerUserId)

    if (!isInTeam) {
      Campaigns.update({
        slug: campaignSlug
      }, {
        $push: {
          team: ownerUserRef
        }
      })
    }
  }
})
