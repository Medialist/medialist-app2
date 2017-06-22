import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import escapeRegExp from 'lodash.escaperegexp'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CampaignRefSchema } from '/imports/api/campaigns/schema'
import { ContactRefSchema } from '/imports/api/contacts/schema'
import { IdSchema } from '/imports/lib/schema'

const DEFAULT_LIMIT = 50

Meteor.publish(null, function () {
  if (!this.userId) {
    return this.ready()
  }

  return Meteor.users.find({
    _id: this.userId
  }, {
    fields: {
      myCampaigns: 1,
      myContacts: 1,
      onCampaigns: 1,
      emails: 1
    }
  })
})

Meteor.publish('users', function (opts = {}) {
  if (!this.userId) return this.ready()

  check(opts, {
    term: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  let query = {
    _id: {
      $ne: this.userId
    }
  }

  const options = {
    fields: {
      'profile.name': 1,
      'profile.avatar': 1,
      'onCampaigns': 1,
      'emails': 1
    },
    sort: { createdAt: -1 },
    limit: opts.limit || DEFAULT_LIMIT
  }

  if (opts.term) {
    const regex = new RegExp(`${escapeRegExp(opts.term)}`, 'gi')

    query = {
      $or: [{
        'profile.name': regex
      }, {
        'services.twitter.screenName': regex
      }, {
        'emails.address': regex
      }]
    }
  }

  return Meteor.users.find(query, options)
})

Meteor.publish('users-by-id', function (opts = {}) {
  if (!this.userId) {
    return this.ready()
  }

  check(opts, {
    userIds: Array,
    limit: Match.Optional(Number)
  })

  const query = {
    _id: {
      $in: opts.userIds
    }
  }

  const options = {
    fields: {
      'profile.name': 1,
      myContacts: 1,
      myCampaigns: 1,
      emails: 1
    },
    sort: {
      createdAt: -1
    },
    limit: opts.limit || DEFAULT_LIMIT
  }
  return Meteor.users.find(query, options)
})

export const UserProfileSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
})

export const UserSchema = new SimpleSchema([
  IdSchema, {
    username: {
      type: String,
      optional: true
    },
    emails: {
      type: Array,
      optional: true
    },
    'emails.$': {
      type: Object
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
      type: Boolean,
      optional: true
    },
    registered_emails: {
      type: Array,
      optional: true
    },
    'registered_emails.$': {
      type: Object,
      blackbox: true
    },
    createdAt: {
      type: Date,
      denyUpdate: true,
      autoValue: function () {
        if (this.isInsert) {
          return new Date()
        }

        this.unset()
      }
    },
    profile: {
      type: UserProfileSchema,
      optional: true
    },
    services: {
      type: Object,
      optional: true,
      blackbox: true
    },
    heartbeat: {
      type: Date,
      optional: true
    },
    myContacts: {
      type: [ContactRefSchema],
      defaultValue: []
    },
    myCampaigns: {
      type: [CampaignRefSchema],
      defaultValue: []
    },
    onCampaigns: {
      type: Number,
      min: 0,
      defaultValue: 0
    }
  }
])

Meteor.users.attachSchema(UserSchema)

export const createUser = (details) => {
  return Meteor.users.insert(details)
}
