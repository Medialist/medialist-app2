import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'

const Clients = new Mongo.Collection('clients')
Clients.deny(everything)

export default Clients
