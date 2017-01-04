import { Mongo } from 'meteor/mongo'

const nope = () => false

const nothing = {
  insert: nope,
  update: nope,
  remove: nope
}

CampaignLists = new Mongo.Collection('CampaignLists')

CampaignLists.allow(nothing)

ContactLists = new Mongo.Collection('ContactLists')

ContactLists.allow(nothing)

// Schema is the same for both
Schemas.MasterList = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  items: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id
  }
})
