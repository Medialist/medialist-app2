Posts = new Mongo.Collection('posts')

Posts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

Schemas.PostContacts = new SimpleSchema({
  'slug': {
    type: String
  },
  'name': {
    type: String
  },
  'avatar': {
    type: String,
    optional: true
  }
})

Schemas.Posts = new SimpleSchema({
  'createdBy._id': {
    type: String,
  },
  'createdBy.name': {
    type: String,
  },
  'createdBy.avatar': {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
  },
  message: {
    type: String,
    optional: true
  },
  contacts: {
    type: [Schemas.PostContacts],
    minCount: 0
  },
  medialists: {
    type: [String],
    minCount: 0
  },
  status: {
    type: String,
    allowedValues: _.values(Contacts.status),
    optional: true
  },
  type: {
    type: String,
    allowedValues: [
      'feedback',
      'need to know',
      'details changed',
      'medialists changed'
    ],
    optional: true
  },
  details: {
    type: Object,
    blackbox: true,
    optional: true
  }
})

Posts.createMedialistChange = function (details) {
  var userId = Meteor.userId()
  if (!userId) throw new Meteor.Error('Only a logged in user can create a change-of-medialist post')
  var user = Meteor.users.findOne(userId)

  if (typeof details.contact === 'string') details.contact = Contacts.findOne({ slug: details.contact })
  if (!details.contact) return

  var post = {
    createdBy: {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    },
    createdAt: new Date(),
    message: `${details.action} ${App.firstName(details.contact.name)} ${(details.action === 'added') ? 'to' : 'from'} #${details.medialistSlug}`,
    contacts: [{
      slug: details.contact.slug,
      name: details.contact.name,
      avatar: details.contact.avatar
    }],
    medialists: [details.medialistSlug],
    type: 'medialists changed',
    details: {
      action: details.action
    }
  }

  return Posts.insert(post)
}

Posts.feedLimit = {
  initial: 20,
  increment: 5
}
