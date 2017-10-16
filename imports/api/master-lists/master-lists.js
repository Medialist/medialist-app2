import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import union from 'lodash.union'
import everything from '/imports/lib/everything'

const MasterLists = new Mongo.Collection('MasterLists')
MasterLists.deny(everything)

if (Meteor.isServer) {
  MasterLists._ensureIndex({slug: 1})
}

export default MasterLists

MasterLists.findRefs = (ids) => {
  return MasterLists
    .find({
      _id: {
        $in: ids
      }
    }, {
      fields: {
        _id: 1,
        name: 1,
        slug: 1
      }
    })
    .fetch()
}

MasterLists.replaceContact = (incoming, outgoing) => {
  MasterLists.update({
    'items': outgoing._id
  }, {
    $addToSet: {
      'items': incoming._id
    }
  })

  MasterLists.update({
    'items': outgoing._id
  }, {
    $pull: {
      'items': outgoing._id
    }
  })

  const mergedMasterListIds = union(
    incoming.masterLists.map(m => m._id),
    outgoing.masterLists.map(m => m._id)
  )

  return MasterLists.findRefs(mergedMasterListIds)
}
