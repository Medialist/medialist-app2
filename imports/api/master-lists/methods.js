import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import MasterLists, { MasterListSchema, MasterListCreationSchema } from './master-lists'
import findUniqueSlug from '/imports/lib/slug'

export const create = new ValidatedMethod({
  name: 'MasterLists/create',
  validate: MasterListCreationSchema.validator(),
  run ({ type, name }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const lists = MasterLists.find(
      {type: type},
      {sort: {priority: -1}, limit: 1}
    ).fetch()
    const order = lists.reduce((p, doc) => {
      return doc.order + 1
    }, 1)
    const doc = {type, name, order, items: []}
    doc.slug = findUniqueSlug(doc.name, MasterLists)
    check(doc, MasterListSchema)
    return MasterLists.insert(doc)
  }
})
