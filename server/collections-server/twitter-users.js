TwitterUsers = new Mongo.Collection('twitter_users')

TwitterUsers.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
})

TwitterUsers.find({}).observeChanges({
  changed: updateContact
})

// Update contact info when twitter info changes.
function updateContact (id, fields) {
  var query = {}
  if (fields.profile_image_url_https) query.avatar = fields.profile_image_url_https
  if (fields.description) query.bio = fields.description
  if (fields.screen_name) query['socials.$.value'] = fields.screen_name
  if (Object.keys(query).length < 1) return
  Contacts.update({ 'socials.twitterId': id }, { $set: query })
}
