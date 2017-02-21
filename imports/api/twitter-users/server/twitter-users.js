import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import Contacts from '/imports/api/contacts/server/contacts'

const TwitterUsers = new Mongo.Collection('twitter_users')

TwitterUsers.allow(nothing)

export default TwitterUsers

TwitterUsers.find({}).observeChanges({
  changed: updateContact
})

// Update contact info when twitter info changes.
function updateContact (id, fields) {
  var query = {}
  if (fields.profile_image_url_https) query.avatar = fields.profile_image_url_https
  if (fields.screen_name) query['socials.$.value'] = fields.screen_name
  if (Object.keys(query).length < 1) return
  Contacts.update({ 'socials.twitterId': id }, { $set: query })
}
