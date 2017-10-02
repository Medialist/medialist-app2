import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'

const MasterLists = new Mongo.Collection('MasterLists')
MasterLists.deny(everything)

if (Meteor.isServer) {
  MasterLists._ensureIndex({slug: 1})
}

export default MasterLists
