import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'

const Clients = new Mongo.Collection('clients')
Clients.allow(nothing)

export default Clients
