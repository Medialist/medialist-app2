import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'

const Orgs = new Mongo.Collection('orgs')
Orgs.allow(nothing)

export default Orgs
