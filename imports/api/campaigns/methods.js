import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import createUniqueSlug, { checkAllSlugsExist } from '/imports/lib/slug'
import Campaigns, { MedialistSchema, MedialistUpdateSchema, MedialistCreateSchema, MedialistRemoveSchema, MedialistAddTeamMatesSchema } from './campaigns'
import Clients from '/imports/api/clients/clients'
import Uploadcare from '/imports/lib/uploadcare'
import Posts from '/imports/api/posts/posts'
import { addToMyFavourites, findOneUserRef, findUserRefs } from '/imports/api/users/users'
import MasterLists from '/imports/api/master-lists/master-lists'
import Contacts from '/imports/api/contacts/contacts'
import toUserRef from '/imports/lib/to-user-ref'

let sendCampaignLink = () => ([])
let createInvitationLink = () => ([])
let findOrCreateUser = () => {}

if (Meteor.isServer) {
  sendCampaignLink = require('./server/send-campaign-link').default
  createInvitationLink = require('./server/send-campaign-link').createInvitationLink
  findOrCreateUser = require('./server/send-campaign-link').findOrCreateUser
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

  validate: new SimpleSchema({
    campaignSlugs: { type: [String] }
  }).validator(),

  run ({ campaignSlugs }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist(campaignSlugs, Campaigns)
    addToMyFavourites({userId: this.userId, campaignSlugs})
  }
})

export const update = new ValidatedMethod({
  name: 'Campaigns/update',
  validate: MedialistUpdateSchema.validator(),
  run (data) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const { _id } = data
    delete data._id

    if (!Object.keys(data).length) {
      throw new Error('Missing fields to update')
    }

    if (!Campaigns.find({ _id }).count()) {
      throw new Meteor.Error('Medialist not found')
    }

    data.client = findOrCreateClientRef(data.clientName)
    delete data.clientName

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    data.updatedAt = now
    data.updatedBy = findOneUserRef(user._id)

    const result = Campaigns.update({
      _id
    }, {
      $set: data
    })

    if (Meteor.isServer) {
      Uploadcare.store(data.avatar)
    }

    // Add this user to the updated campaign's team if required
    Campaigns.update({
      _id,
      'team._id': {
        $ne: this.userId
      }
    }, {
      $push: {
        team: data.updatedBy
      }
    })

    const updatedMedialist = Campaigns.findOne({ _id })

    // Update existing users' favourite campaigns with new denormalised data
    Meteor.users.update({
      'myCampaigns._id': _id
    }, {
      $set: {
        'myCampaigns.$.name': updatedMedialist.name,
        'myCampaigns.$.slug': updatedMedialist.slug,
        'myCampaigns.$.avatar': updatedMedialist.avatar,
        'myCampaigns.$.clientName': updatedMedialist.client
          ? updatedMedialist.client.name
          : null,
        'myCampaigns.$.updatedAt': now
      }
    }, {
      multi: true
    })

    // Add this campaign to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myCampaigns._id': { $ne: _id }
    }, {
      $push: { myCampaigns: {
        _id: _id,
        name: updatedMedialist.name,
        slug: updatedMedialist.slug,
        avatar: updatedMedialist.avatar,
        clientName: updatedMedialist.client
          ? updatedMedialist.client.name
          : null,
        updatedAt: now
      } }
    })

    return result
  }
})

export const create = new ValidatedMethod({
  name: 'Campaigns/create',
  validate: MedialistCreateSchema.validator(),
  run ({ name, clientName, avatar, purpose, links }) {
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
      contacts: {},
      team: [createdBy],
      masterLists: [],
      tags: [],
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy
    }

    check(doc, MedialistSchema)
    Campaigns.insert(doc)

    if (Meteor.isServer) {
      Uploadcare.store(doc.avatar)
    }

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: [slug],
      updatedAt: createdAt
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
      campaignSlugs: [slug],
      createdAt,
      createdBy
    })

    return slug
  }
})

export const remove = new ValidatedMethod({
  name: 'Campaigns/remove',
  validate: MedialistRemoveSchema.validator(),
  run ({ _ids }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    _ids.forEach(_id => {
      // get slugs from ids
      const campaign = Campaigns.findOne({
        _id: _id
      }, {
        fields: {
          slug: 1,
          team: 1
        }
      })

      const slug = campaign.slug

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
        $unset: {
          [`campaigns.${slug}`]: true
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
  }
})

export const setTeamMates = new ValidatedMethod({
  name: 'Campaigns/setTeamMates',
  validate: MedialistAddTeamMatesSchema.validator(),
  run ({ _id, userIds, emails }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const campaign = Campaigns.findOne(_id)

    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({
      _id: this.userId
    })

    const newUserIds = sendCampaignLink(emails, user, campaign)

    // dedupe user id list
    userIds = Array.from(new Set(userIds.concat(newUserIds)))

    const now = new Date()

    // who used to be on the team
    const existingUserIds = campaign.team.map(user => user._id)

    // who was removed from the team
    const removedUserIds = existingUserIds
      .filter(id => !userIds.includes(id))

    // who was added to the team
    const addedUserIds = userIds
      .filter(id => !existingUserIds.includes(id))

    // update the team
    const result = Campaigns.update(campaign._id, {
      $set: {
        updatedAt: now,
        updatedBy: toUserRef(user),
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
    Meteor.users.update({
      _id: this.userId,
      'myCampaigns._id': {
        $ne: campaign._id
      }
    }, {
      $push: {
        myCampaigns: {
          name: campaign.name,
          slug: campaign.slug,
          avatar: campaign.avatar,
          clientName: campaign.client ? campaign.client.name : null,
          updatedAt: now
        }
      }
    })

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
