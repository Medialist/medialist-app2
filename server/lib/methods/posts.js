Meteor.methods({
  'posts/create': function (opts) {
    check(opts, {
      contactSlug: String,
      medialistSlug: String,
      message: Match.Optional(String),
      status: Match.OneOf.apply(null, _.values(Contacts.status))
    })
    if (!this.userId) throw new Meteor.Error('Only a logged in user can post feedback')
    if (!Medialists.find({slug: opts.medialistSlug}).count()) throw new Meteor.Error('Cannot find medialist #' + opts.medialistSlug)
    if (!Contacts.find({slug: opts.contactSlug}).count()) throw new Meteor.Error('Cannot find contact @' + opts.contactSlug)

    var thisUser = Meteor.users.findOne(this.userId)
    var extraMedialists = _.filter(findHashtags(opts.message), function (hashtag) {
      return Medialists.find({slug: hashtag}).count()
    })
    var medialists = _.uniq(extraMedialists.concat(opts.medialistSlug))
    var extraContacts = _.filter(findHandles(opts.message), function (handle) {
      return Contacts.find({slug: handle}).count()
    })
    var contacts = _.uniq(extraContacts.concat(opts.contactSlug))

    var post = {
      createdBy: {
        _id: this.userId,
        name: thisUser.profile.name,
        avatar: thisUser.services.twitter.profile_image_url_https
      },
      createdAt: new Date(),
      contacts: _.map(contacts, function (contactSlug) {
        var contact = Contacts.findOne({ slug: contactSlug })
        return {
          slug: contactSlug,
          name: contact.name,
          avatar: contact.avatar
        }
      }),
      medialists: medialists,
      status: opts.status,
      type: 'feedback'
    }
    // TODO: Do we need this? There is a missing sanitizeHtml dep from cleanFeedback, that needs review.
    // if (opts.message) post.message = App.cleanFeedback(opts.message)
    if (opts.message) post.message = opts.message
    check(post, Schemas.Posts)

    var medialistUpdate = {}
    medialistUpdate['contacts.' + opts.contactSlug] = opts.status
    _.each(medialists, function (thisMedialistSlug) {
      App.medialistUpdated(thisMedialistSlug, thisUser._id)
    })
    Medialists.update({ slug: opts.medialistSlug }, { $set: medialistUpdate })
    App.contactUpdated(opts.contactSlug, thisUser._id)
    return Posts.insert(post)
  },

  'posts/createNeedToKnow': function (opts) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can post feedback')
    check(opts, {
      contactSlug: String,
      message: String,
    })
    var contact = Contacts.findOne({ slug: opts.contactSlug })
    if (!contact) throw new Meteor.Error('Cannot find contact @' + opts.contactSlug)

    var thisUser = Meteor.users.findOne(this.userId)
    var post = {
      createdBy: {
        _id: this.userId,
        name: thisUser.profile.name,
        avatar: thisUser.services.twitter.profile_image_url_https

      },
      createdAt: new Date(),
      contacts: [{
        slug: contact.slug,
        name: contact.name,
        avatar: contact.avatar
      }],
      message: opts.message,
      medialists: [],
      type: 'need to know'
    }
    check(post, Schemas.Posts)

    return Posts.insert(post)
  }
})

function findHashtags (message) {
  var hashtagRegex = /(?:#)(\S+)/ig
  var match
  var matches = []
  while ((match = hashtagRegex.exec(message)) !== null) {
    matches.push(match[1])
  }
  return matches
}

function findHandles (message) {
  var handleRegex = /(?:@)(\S+)/ig
  var match
  var matches = []
  while ((match = handleRegex.exec(message)) !== null) {
    matches.push(match[1])
  }
  return matches
}
