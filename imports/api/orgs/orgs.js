import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

export const OrgSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})

const Orgs = new Mongo.Collection('orgs')
Orgs.attachSchema(OrgSchema)
Orgs.allow(nothing)

export default Orgs
