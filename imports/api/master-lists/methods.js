import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import MasterLists, { MasterListSchema, MasterListCreationSchema } from './master-lists'
import Contacts from '../contacts/contacts'
import Medialists from '../medialists/medialists'
import findUniqueSlug from '/imports/lib/slug'

export const create = new ValidatedMethod({
  name: 'MasterLists/create',
  validate: MasterListCreationSchema.validator(),
  run ({ type, name }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const lists = MasterLists.find(
      {type: type},
      {sort: {order: -1}, limit: 1}
    ).fetch()
    const order = lists.reduce((p, doc) => {
      return doc.order + 1
    }, 0)
    const doc = {type, name, order, items: []}
    doc.slug = findUniqueSlug(doc.name, MasterLists)
    check(doc, MasterListSchema)
    return MasterLists.insert(doc)
  }
})

export const del = new ValidatedMethod({
  name: 'MasterLists/delete',
  validate: (masterListId) => check(masterListId, SimpleSchema.RegEx.Id),
  run (masterListId) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const res = MasterLists.update({ _id: masterListId, deleted: null }, { $set: { deleted: new Date() } })
    if (!res) throw new Meteor.Error('MasterList not found')
    const removeArgs = [{ 'masterLists._id': masterListId }, { $pull: { masterLists: { _id: masterListId } } }, { multi: true }]
    Contacts.update(...removeArgs)
    Medialists.update(...removeArgs)
    return true
  }
})

export const itemCount = new ValidatedMethod({
  name: 'MasterLists/itemCount',
  validate: (masterListId) => check(masterListId, SimpleSchema.RegEx.Id),
  run (masterListId) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const masterList = MasterLists.findOne({ _id: masterListId, deleted: null })
    if (!masterList) throw new Meteor.Error('MasterList not found')
    return masterList.items.length
  }
})

export const typeCount = new ValidatedMethod({
  name: 'MasterLists/typeCount',
  validate: null,
  run () {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const rawMasterLists = MasterLists.rawCollection()
    rawMasterLists.aggregateSync = Meteor.wrapAsync(rawMasterLists.aggregate)
    return rawMasterLists.aggregateSync([
      { $match: { deleted: null } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  }
})
