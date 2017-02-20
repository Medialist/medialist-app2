import Contacts from '../contacts'
import TwitterClient from '/imports/api/twitter-users/server/twitter-client'

Contacts._ensureIndex({'slug': 1})

Contacts.find({}).observeChanges({
  changed (id, fields) {
    checkScreenNameUpdate(id, fields)
  },
  added (id, fields) {
    checkScreenNameUpdate(id, fields)
  }
})

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
  return Contacts.update({ _id: id, 'socials.label': 'Twitter' }, {
    $set: {
      avatar: twitterUser.profile_image_url_https,
      bio: twitterUser.description,
      'socials.$.twitterId': twitterUser.id_str,
      'socials.$.value': twitterUser.screen_name
    }
  })
}

export default Contacts
