import { Meteor } from 'meteor/meteor'
import MasterLists from './master-lists'

// Gotta function as meteor needs to noodle with `this`
Meteor.publish('master-lists', function () {
  if (!this.userId) return this.ready()
  return MasterLists.find({})
})
