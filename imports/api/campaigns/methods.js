import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import createUniqueSlug, { checkAllSlugsExist } from '/imports/lib/slug'
import Campaigns, { MedialistSchema, MedialistUpdateSchema, MedialistCreateSchema, MedialistRemoveSchema, MedialistAddTeamMatesSchema, MedialistRemoveTeamMateSchema } from './campaigns'
import Clients from '/imports/api/clients/clients'
import Uploadcare from '/imports/lib/uploadcare'
import Posts from '/imports/api/posts/posts'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import getAvatar from '/imports/lib/get-avatar'
import MasterLists from '/imports/api/master-lists/master-lists'
import Contacts from '/imports/api/contacts/contacts'

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
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(campaignSlugs, Campaigns)
    addToMyFavourites({userId: this.userId, campaignSlugs})
  }
})

export const update = new ValidatedMethod({
  name: 'Campaigns/update',
  validate: MedialistUpdateSchema.validator(),
  run (data) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

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

    const result = Campaigns.update({ _id }, { $set: data })

    if (Meteor.isServer) {
      Uploadcare.store(data.avatar)
    }

    // Add this user to the updated campaign's team if required
    Campaigns.update({ _id, 'team._id': { $ne: this.userId } }, { $push: { team: data.updatedBy } })

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
    if (!this.userId) throw new Meteor.Error('You must be logged in')
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

    addToMyFavourites({userId: this.userId, campaignSlugs: [slug], updatedAt: createdAt})

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
      const slug = Campaigns.findOne({
        _id: _id
      }, {
        fields: {
          'slug': 1
        }
      })
      .slug

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
          'campaigns': slug
        }
      }, {
        multi: true
      })

      // remove campaign from posts
      Posts.update({
        campaigns: {
          _id: _id
        }
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

export const addTeamMates = new ValidatedMethod({
  name: 'Campaigns/addTeamMates',
  validate: MedialistAddTeamMatesSchema.validator(),
  run ({ _id, userIds }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const campaign = Campaigns.findOne(_id)
    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    const $set = {
      updatedAt: now,
      updatedBy: findOneUserRef(user._id)
    }
    const pushIds = userIds.filter((_id) => !campaign.team.some((t) => t._id === _id))
    const $push = {
      team: { $each: Meteor.users.find({ _id: { $in: pushIds } }, { fields: { 'services.twitter.profile_image_url_https': 1, 'profile.name': 1 } })
        .fetch()
        .map((u) => ({ _id: u._id, name: u.profile.name, avatar: getAvatar(u) }))
      }
    }

    const result = Campaigns.update(campaign._id, { $set, $push })

    // Add this campaign to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myCampaigns._id': { $ne: campaign._id }
    }, {
      $push: { myCampaigns: {
        name: campaign.name,
        slug: campaign.slug,
        avatar: campaign.avatar,
        clientName: campaign.client
          ? campaign.client.name
          : null,
        updatedAt: now
      } }
    })

    return result
  }
})

export const removeTeamMate = new ValidatedMethod({
  name: 'Campaigns/removeTeamMate',
  validate: MedialistRemoveTeamMateSchema.validator(),
  run ({ _id, userId }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const campaign = Campaigns.findOne(_id)
    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    const $set = {
      updatedAt: now,
      updatedBy: findOneUserRef(user._id)
    }
    const $pull = { team: { _id: userId } }

    const result = Campaigns.update(campaign._id, { $set, $pull })

    // Add this campaign to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myCampaigns._id': { $ne: campaign._id }
    }, {
      $push: { myCampaigns: {
        name: campaign.name,
        slug: campaign.slug,
        avatar: campaign.avatar,
        clientName: campaign.client
          ? campaign.client.name
          : null,
        updatedAt: now
      } }
    })

    return result
  }
})

export const setTeamMates = new ValidatedMethod({
  name: 'Campaigns/setTeamMates',
  validate: MedialistAddTeamMatesSchema.validator(),
  run ({ _id, userIds }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const campaign = Campaigns.findOne(_id)

    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    const $set = {
      updatedAt: now,
      updatedBy: findOneUserRef(user._id),
      team: Meteor.users.find({
        _id: {
          $in: userIds
        }
      }, {
        fields: {
          'profile': 1
        }
      })
        .fetch()
        .map((u) => ({
          _id: u._id,
          name: u.profile.name,
          avatar: u.profile.avatar
        }))
    }

    const result = Campaigns.update(campaign._id, { $set })

    // Add this campaign to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myCampaigns._id': { $ne: campaign._id }
    }, {
      $push: { myCampaigns: {
        name: campaign.name,
        slug: campaign.slug,
        avatar: campaign.avatar,
        clientName: campaign.client
          ? campaign.client.name
          : null,
        updatedAt: now
      } }
    })

    return result
  }
})
