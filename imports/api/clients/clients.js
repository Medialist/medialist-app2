import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

export const ClientSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})

const Clients = new Mongo.Collection('clients')
Clients.attachSchema(ClientSchema)
Clients.allow(nothing)

export default Clients
