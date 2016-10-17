Contacts._ensureIndex({'slug': 1})

Contacts.find({}).observeChanges({
  changed (id, fields) {
    checkScreenNameUpdate(id, fields)
  }
})

function checkScreenNameUpdate (id, fields) {
  var social = fields.socials && fields.socials[0]
  if (social && social.label === 'Twitter' && social.value) {
    Contacts.changeScreenName(id, social.value)
  }
}

Contacts.changeScreenName = function (id, screenName) {
  TwitterClient.grabUserByScreenName(screenName, (err, user) => {
    if (err || !user) return console.log('Failed to get twitter info for contact', id, err)
    Contacts.updateWithTwitterInfo(id, user)
  })
}

Contacts.updateWithTwitterInfo = function (id, twitterUser) {
  return Contacts.update({ _id: id, 'socials.label': 'Twitter' }, {
    $set: {
      avatar: twitterUser.profile_image_url_https,
      bio: twitterUser.description,
      'socials.$.twitterId': twitterUser.id_str,
      'socials.$.value': twitterUser.screen_name
    }
  })
}
