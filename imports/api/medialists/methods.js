import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import escapeRegExp from 'lodash.escaperegexp'
import createUniqueSlug from '/imports/lib/slug'
import Medialists, { MedialistSchema, MedialistUpdateSchema, MedialistCreateSchema } from './medialists'
import Clients from '/imports/api/clients/clients'

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

    return Medialists.update({ _id }, { $set: data })
  }
})

export const create = new ValidatedMethod({
  name: 'Medialists/create',
  validate: MedialistCreateSchema.validator(),
  run ({ name, clientName, avatar, purpose, website }) {
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
      website,
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy,
      contacts: {},
      masterLists: []
    }

    check(doc, MedialistSchema)
    const _id = Medialists.insert(doc)

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

    return slug
  }
})
