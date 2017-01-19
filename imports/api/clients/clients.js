import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

const Clients = new Mongo.Collection('clients')
export default Clients

Clients.allow(nothing)

export const ClientSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
