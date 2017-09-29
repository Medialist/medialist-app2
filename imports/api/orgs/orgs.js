import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'

const Orgs = new Mongo.Collection('orgs')
Orgs.deny(everything)

export default Orgs
