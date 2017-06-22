import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { MasterListSchema } from '/imports/api/master-lists/schema'

const MasterLists = new Mongo.Collection('MasterLists')
MasterLists.attachSchema(MasterListSchema)
MasterLists.allow(nothing)

if (Meteor.isServer) {
  MasterLists._ensureIndex({slug: 1})
}

export default MasterLists
