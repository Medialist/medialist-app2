import { Mongo } from 'meteor/mongo'

Clients = new Mongo.Collection('clients')

Clients.allow({
  insert: function () {
    return false
  },

  update: function () {
    return false
  },

  remove: function () {
    return false
  }
})

Schemas.Clients = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})

export default Clients
