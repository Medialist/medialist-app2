import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'

const Embeds = new Mongo.Collection('embeds')

Embeds.allow(nothing)

export default Embeds

if (Meteor.isServer) {
  Embeds._ensureIndex({ url: 1 })
}
