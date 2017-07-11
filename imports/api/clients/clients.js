import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import nothing from '/imports/lib/nothing'
import { IdSchema } from '/imports/lib/schema'

export const ClientSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
ClientSchema.extend(IdSchema)

const Clients = new Mongo.Collection('clients')
Clients.allow(nothing)

export default Clients
