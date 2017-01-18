import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

const Orgs = new Mongo.Collection('orgs')

Orgs.allow(nothing)

export default Orgs

export const OrgSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
