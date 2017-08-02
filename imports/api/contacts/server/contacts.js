import { Meteor } from 'meteor/meteor'
import Contacts from '/imports/api/contacts/contacts'
import TwitterClient from '/imports/api/twitter-users/server/twitter-client'

if (Meteor.settings.updateContactsFromTwitter) {
  Contacts.find({}).observeChanges({
    changed (id, fields) {
      checkScreenNameUpdate(id, fields)
    },
    added (id, fields) {
      checkScreenNameUpdate(id, fields)
    }
  })
} else {
  console.info('Not watching twitter accounts of contacts for changes')
}

function checkScreenNameUpdate (id, fields) {
  var social = fields.socials && fields.socials[0]
  if (social && social.label === 'Twitter' && social.value) {
    changeScreenName(id, social.value)
  }
}

function changeScreenName (id, screenName) {
  return new Promise((resolve, reject) => {
    TwitterClient.grabUserByScreenName(screenName, (err, user) => {
      if (err) return reject(err)
      if (!user) return reject('Failed to get twitter info for contact', id)
      resolve(updateWithTwitterInfo(id, user))
    })
  })
}

function updateWithTwitterInfo (id, twitterUser) {
  const $set = {
    bio: twitterUser.description,
    'socials.$.twitterId': twitterUser.id_str,
    'socials.$.value': twitterUser.screen_name
  }
  const contact = Contacts.findOne({ _id: id }, {fields: { avatar: 1 }})
  // only update their avatar if it came from twitter previously.
  if (contact.avatar && contact.avatar.match(/twimg/)) {
    const url = twitterUser.profile_image_url_https
    // https://dev.twitter.com/basics/user-profile-images-and-banners#alternative-image-sizes-for-user-profile-images
    $set.avatar = url.replace('_normal.', '_bigger.')
  }
  return Contacts.update({ _id: id, 'socials.label': 'Twitter' }, {$set})
}

export default Contacts
