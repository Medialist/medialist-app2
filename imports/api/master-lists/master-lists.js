import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'

const MasterLists = new Mongo.Collection('MasterLists')
MasterLists.allow(nothing)

if (Meteor.isServer) {
  MasterLists._ensureIndex({slug: 1})
}

export default MasterLists
