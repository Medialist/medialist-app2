import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { OrgSchema } from '/imports/api/orgs/schema'

const Orgs = new Mongo.Collection('orgs')
Orgs.attachSchema(OrgSchema)
Orgs.allow(nothing)

export default Orgs
