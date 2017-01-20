import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import createUniqueSlug from '/imports/lib/slug'
import Medialists, { MedialistSchema, MedialistUpdateSchema, MedialistCreateSchema, MedialistAddTeamMatesSchema, MedialistRemoveTeamMateSchema } from './medialists'
import Clients from '/imports/api/clients/clients'
import Uploadcare from '/imports/lib/uploadcare'
import Posts from '/imports/api/posts/posts'
import getAvatar from '/imports/lib/get-avatar'

function findOrCreateClientRef (name) {
  const nameRegex = new RegExp('^' + escapeRegExp(name) + '$', 'i')
  const client = Clients.findOne({ name: nameRegex })
  if (client) {
    return {_id: client._id, name: client.name}
  }
  const _id = Clients.insert({ name })
  return {_id, name}
}

export const update = new ValidatedMethod({
  name: 'Medialists/update',
  validate: MedialistUpdateSchema.validator(),
  run (data) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const { _id } = data
    delete data._id

    if (!Object.keys(data).length) {
      throw new Error('Missing fields to update')
    }

    if (!Medialists.find({ _id }).count()) {
      throw new Meteor.Error('Medialist not found')
    }

    data.client = findOrCreateClientRef(data.clientName)
    delete data.clientName

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    data.updatedAt = now
    data.updatedBy = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    }

    const result = Medialists.update({ _id }, { $set: data })

    if (Meteor.isServer) {
      Uploadcare.store(data.avatar)
    }

    // Add this user to the updated campaign's team if required
    Medialists.update({ _id, 'team._id': { $ne: this.userId } }, { $push: { team: data.updatedBy } })

    const updatedMedialist = Medialists.findOne({ _id })

    // Update existing users' favourite medialists with new denormalised data
    Meteor.users.update({
      'myMedialists._id': _id
    }, {
      $set: {
        'myMedialists.$.name': updatedMedialist.name,
        'myMedialists.$.slug': updatedMedialist.slug,
        'myMedialists.$.avatar': updatedMedialist.avatar,
        'myMedialists.$.clientName': updatedMedialist.client
          ? updatedMedialist.client.name
          : null,
        'myMedialists.$.updatedAt': now
      }
    }, {
      multi: true
    })

    // Add this medialist to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myMedialists._id': { $ne: _id }
    }, {
      $push: { myMedialists: {
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
  name: 'Medialists/create',
  validate: MedialistCreateSchema.validator(),
  run ({ name, clientName, avatar, purpose, links }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const slug = createUniqueSlug(name, Medialists)
    const client = findOrCreateClientRef(clientName)
    const user = Meteor.users.findOne(this.userId)
    const createdAt = new Date()
    const createdBy = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    }
    const doc = {
      name,
      slug,
      client,
      avatar,
      purpose,
      links,
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy,
      contacts: {},
      team: [createdBy],
      masterLists: []
    }

    check(doc, MedialistSchema)
    const _id = Medialists.insert(doc)

    if (Meteor.isServer) {
      Uploadcare.store(doc.avatar)
    }

    const myMedialists = {
      _id,
      name: name,
      slug: slug,
      avatar: avatar,
      clientName: client.name,
      updatedAt: createdAt
    }
    Meteor.users.update(
      { _id: user._id },
      { $push: { myMedialists }
      })

    Posts.createCampaignCreated({ campaign: doc, author: user })

    return slug
  }
})

export const addTeamMates = new ValidatedMethod({
  name: 'Medialists/addTeamMates',
  validate: MedialistAddTeamMatesSchema.validator(),
  run ({ _id, userIds }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const campaign = Medialists.findOne(_id)
    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    const $set = {
      updatedAt: now,
      updatedBy: {
        _id: user._id,
        name: user.profile.name,
        avatar: user.services.twitter.profile_image_url_https
      }
    }
    const pushIds = userIds.filter((_id) => !campaign.team.some((t) => t._id === _id))
    const $push = {
      team: { $each: Meteor.users.find({ _id: { $in: pushIds } }, { fields: { 'services.twitter.profile_image_url_https': 1, 'profile.name': 1 } })
        .fetch()
        .map((u) => ({ _id: u._id, name: u.profile.name, avatar: getAvatar(u) }))
      }
    }

    const result = Medialists.update(campaign._id, { $set, $push })

    // Add this medialist to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myMedialists._id': { $ne: campaign._id }
    }, {
      $push: { myMedialists: {
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
  name: 'Medialists/removeTeamMate',
  validate: MedialistRemoveTeamMateSchema.validator(),
  run ({ _id, userId }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const campaign = Medialists.findOne(_id)
    if (!campaign) {
      throw new Meteor.Error('Medialist not found')
    }

    const user = Meteor.users.findOne({ _id: this.userId })
    const now = new Date()

    const $set = {
      updatedAt: now,
      updatedBy: {
        _id: user._id,
        name: user.profile.name,
        avatar: user.services.twitter.profile_image_url_https
      }
    }
    const $pull = { team: { _id: userId } }

    const result = Medialists.update(campaign._id, { $set, $pull })

    // Add this medialist to the updating user's favourites if required
    Meteor.users.update({
      _id: this.userId,
      'myMedialists._id': { $ne: campaign._id }
    }, {
      $push: { myMedialists: {
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
