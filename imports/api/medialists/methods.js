import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import createUniqueSlug from '/imports/lib/slug'
import Medialists, { MedialistSchema, MedialistUpdateSchema, MedialistCreateSchema } from './medialists'
import Clients from '/imports/api/clients/clients'
import Uploadcare from '/imports/lib/uploadcare'
import Posts from '/imports/api/posts/posts'

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

    const updatedMedialist = Medialists.findOne({ _id })

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
