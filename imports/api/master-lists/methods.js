import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import MasterLists, {
  MasterListSchema,
  MasterListCreationSchema,
  MasterListUpdateSchema,
  MasterListAddItemsSchema,
  MasterListRemoveItemSchema,
  MasterListDelSchema,
  MasterListsSetMasterLists
} from './master-lists'
import Contacts from '../contacts/contacts'
import Campaigns from '../campaigns/campaigns'
import findUniqueSlug from '/imports/lib/slug'
import { TypeSchema } from '/imports/lib/schema'

/*
 * Add an array of Campaigns/Contacts to an array of master lists.
 * If any of the entities are already in a given master list, it will remain so.
 */
export const batchAddToMasterLists = new ValidatedMethod({
  name: 'batchAddToMasterLists',
  validate: new SimpleSchema([
    TypeSchema,
    {
      slugs: { type: [String] },
      masterListIds: { type: [String], regEx: SimpleSchema.RegEx.Id }
    }
  ]).validator(),

  run ({type, slugs, masterListIds}) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const Collection = (type === 'Contacts') ? Contacts : Campaigns

    const itemIds = Collection
      .find(
        { slug: { $in: slugs } },
        { fields: { _id: 1 } }
      )
      .map((d) => d._id)

    const masterListRefs = MasterLists
      .find(
        { _id: { $in: masterListIds } },
        { fields: { _id: 1, name: 1, slug: 1 } }
      ).fetch()

    MasterLists.update(
      { _id: { $in: masterListIds } },
      { $addToSet: { items: { $each: itemIds } } },
      { multi: true }
    )

    Collection.update(
      { _id: { $in: itemIds } },
      {
        $addToSet: { masterLists: { $each: masterListRefs } },
        $set: { updatedAt: new Date() }
      },
      { multi: true }
    )
  }
})

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
  validate: MasterListDelSchema.validator(),
  run ({_ids}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    _ids.forEach(_id => {
      const masterList = MasterLists.findOne({
        _id: _id
      })

      if (!masterList) {
        return
      }

      MasterLists.remove({
        _id: _id
      })

      const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
      refCollection.update({
        'masterLists._id': _id
      }, {
        $pull: {
          masterLists: { _id: _id }
        }
      }, {
        multi: true
      })
    })
  }
})

export const update = new ValidatedMethod({
  name: 'MasterLists/update',
  validate: MasterListUpdateSchema.validator(),
  run ({ _id, name }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const masterList = MasterLists.findOne({ _id, deleted: null })
    if (!masterList) throw new Meteor.Error('MasterList not found')

    MasterLists.update({ _id }, { $set: { name } })

    const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
    return refCollection.update({
      'masterLists._id': _id
    }, {
      $set: {
        'masterLists.$.name': name
      }
    }, { multi: true })
  }
})

export const addItems = new ValidatedMethod({
  name: 'MasterLists/addItems',
  validate: MasterListAddItemsSchema.validator(),
  run ({ _id, items }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const masterList = MasterLists.findOne({ _id, deleted: null })
    if (!masterList) throw new Meteor.Error('MasterList not found')

    const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
    if (refCollection.find({ _id: { $in: items } }).count() !== items.length) {
      throw new Meteor.Error('One or more items does not exist in the correct collection for this masterlist')
    }
    MasterLists.update({ _id }, { $addToSet: { items: { $each: items } } })
    return refCollection.update({
      _id: { $in: items }
    }, {
      $addToSet: {
        masterLists: {
          _id: masterList._id,
          name: masterList.name,
          slug: masterList.slug
        }
      }
    }, { multi: true })
  }
})

export const setMasterLists = new ValidatedMethod({
  name: 'MasterLists/setMasterLists',
  validate: MasterListsSetMasterLists.validator(),
  run ({type, item, masterLists}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const refCollection = (type === 'Contacts') ? Contacts : Campaigns
    const itemDocument = refCollection.findOne({_id: item})

    if (!itemDocument) {
      throw new Meteor.Error(`${type.substring(0, type.length - 1)} not found`)
    }

    MasterLists.update({
      _id: {
        $in: masterLists
      }
    }, {
      $addToSet: {
        items: item
      }
    }, {
      multi: true
    })

    const removeItemsFromMasterListsIds = itemDocument.masterLists
      .map(list => list._id)
      .filter((oldListItem) => masterLists.indexOf(oldListItem) === -1)

    MasterLists.update({
      _id: {
        $in: removeItemsFromMasterListsIds
      }
    }, {
      $pull: {
        items: item
      }
    }, {
      multi: true
    })

    const masterListRefs = MasterLists
      .find({
        _id: {
          $in: masterLists
        }
      }, {
        fields: {
          _id: 1,
          name: 1,
          slug: 1
        }
      })
      .fetch()

    refCollection.update({
      _id: item
    }, {
      $set: {
        masterLists: masterListRefs
      }
    })
  }
})

export const removeItem = new ValidatedMethod({
  name: 'MasterLists/removeItem',
  validate: MasterListRemoveItemSchema.validator(),
  run ({ _id, item }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const masterList = MasterLists.findOne({
      _id,
      items: item,
      deleted: null
    })
    if (!masterList) throw new Meteor.Error('MasterList not found')

    const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
    MasterLists.update({ _id }, { $pull: { items: item } })
    return refCollection.update({
      _id: item
    }, {
      $pull: {
        masterLists: {
          _id: masterList._id
        }
      }
    })
  }
})

export const itemCount = new ValidatedMethod({
  name: 'MasterLists/itemCounts',
  validate: (masterListIds) => check(masterListIds, [SimpleSchema.RegEx.Id]),
  run (masterListIds) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    return MasterLists.find({ _id: { $in: masterListIds }, deleted: null }).fetch().reduce((memo, ml) => {
      memo[ml._id] = ml.items.length
      return memo
    }, {})
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
