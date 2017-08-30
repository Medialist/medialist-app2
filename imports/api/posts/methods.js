import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import StatusMap, { StatusValues } from '/imports/api/contacts/status'
import { checkAllSlugsExist } from '/imports/lib/slug'
import findUrl from '/imports/lib/find-url'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import { IdSchema } from '/imports/lib/schema'
import values from 'lodash.values'
import moment from 'moment'

let createEmbed = {
  run: () => {}
}

if (Meteor.isServer) {
  createEmbed = require('/imports/api/embeds/server/methods').createEmbed
}

function postFeedbackOrCoverage ({type, userId, contactSlug, campaignSlug, message, status}) {
  checkAllSlugsExist([contactSlug], Contacts)

  let campaign

  if (campaignSlug) {
    checkAllSlugsExist([campaignSlug], Campaigns)

    campaign = Campaigns.findOne({
      slug: campaignSlug,
      'contacts.slug': contactSlug
    })

    if (!campaign) {
      return
    }

    const contact = campaign.contacts.find((c) => c.slug === contactSlug)

    if (contact.status === status && !message) {
      return
    }
  }

  const createdBy = findOneUserRef(userId)
  const createdAt = new Date()
  const embed = createEmbed.run.call({
    userId
  }, {
    url: findUrl(message)
  })

  const postId = Posts.create({
    // Feedback without a message is rendered as a different post type.
    type: message ? type : 'StatusUpdate',
    contactSlugs: [contactSlug],
    campaignSlugs: campaignSlug ? [campaignSlug] : [],
    embeds: embed ? [embed] : [],
    status,
    message,
    createdBy,
    createdAt
  })

  const contactUpdates = {
    updatedBy: createdBy,
    updatedAt: createdAt
  }

  if (campaignSlug) {
    Campaigns.update({
      slug: campaignSlug,
      'contacts.slug': contactSlug
    }, {
      $set: {
        [`contacts.$.status`]: status,
        [`contacts.$.updatedAt`]: createdAt,
        [`contacts.$.updatedBy`]: createdBy,
        updatedBy: createdBy,
        updatedAt: createdAt
      }
    })
  }

  Contacts.update({
    slug: contactSlug
  }, {
    $set: contactUpdates
  })

  addToMyFavourites({
    userId,
    contactSlugs: [contactSlug],
    campaignSlugs: campaignSlug ? [campaignSlug] : []
  })

  return postId
}

const FeedbackOrCoverageSchema = new SimpleSchema({
  contactSlug: {
    type: String
  },
  campaignSlug: {
    type: String
  },
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: StatusValues
  }
})

export const createFeedbackPost = new ValidatedMethod({
  name: 'createFeedbackPost',
  validate: FeedbackOrCoverageSchema.validator(),
  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    return postFeedbackOrCoverage({
      type: 'FeedbackPost',
      userId: this.userId,
      contactSlug,
      campaignSlug,
      message,
      status
    })
  }
})

export const updatePost = new ValidatedMethod({
  name: 'updatePost',

  validate: new SimpleSchema({
    message: {
      type: String,
      optional: true
    },
    status: {
      type: String,
      allowedValues: values(Contacts.status),
      optional: true
    },
    contactSlug: {
      type: String,
      optional: true
    },
    campaignSlug: {
      type: String,
      optional: true
    }
  }).extend(IdSchema).validator(),

  run ({ _id, message, status, contactSlug, campaignSlug }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const oldPost = Posts.findOne({ _id })

    if (!oldPost) {
      throw new Meteor.Error('Can\'t find Post')
    }

    if (this.userId !== oldPost.createdBy._id) {
      throw new Meteor.Error('You can only edit Posts you created')
    }

    const userRef = findOneUserRef(this.userId)
    const updatedAt = new Date()

    const $set = {
      updatedAt,
      updatedBy: userRef
    }

    if (message) {
      $set.message = message

      const embed = createEmbed.run.call({
        userId: this.userId
      }, {
        url: findUrl(message)
      })

      $set.embeds = embed ? [embed] : []
    }

    if (status && oldPost.status !== status) $set.status = status
    if (contactSlug && oldPost.contacts[0].slug !== contactSlug) $set.contacts = [Contacts.findOneRef(contactSlug)]
    if (campaignSlug && oldPost.campaigns[0].slug !== campaignSlug) $set.campaigns = [Campaigns.findOneRef(campaignSlug)]

    if (!Object.keys($set)) return

    Posts.update({
      _id
    }, {
      $set: $set
    })

    // do the work to update our denormalized references
    if ($set.status || $set.contacts || $set.campaigns) {
      const newPost = Posts.findOne({ _id })

      const moreRecentPost = Posts.findOne({
        _id: {$nin: [newPost._id]},
        type: {$in: ['FeedbackPost', 'CoveragePost', 'StatusUpdate']},
        'contacts.slug': newPost.contacts[0].slug,
        'campaigns.slug': newPost.campaigns[0].slug,
        'createdAt': {$gt: newPost.createdAt}
      }, {
        sort: {createdAt: -1},
        limit: 1
      })

      if (!moreRecentPost) {
        Campaigns.update({
          _id: newPost.campaigns[0]._id,
          'contacts.slug': newPost.contacts[0].slug
        }, {
          $set: {
            'contacts.$': {
              slug: newPost.contacts[0].slug,
              status: newPost.status,
              updatedAt: newPost.createdAt,
              updatedBy: newPost.createdBy
            }
          }
        })
      }

      // if only the status needs updating stop here
      if (!$set.contacts && !$set.campaigns) return

      // these changes will roll back changes for a replaced contact
      const mostRecentPreviousPost = Posts.findOne({
        _id: {$nin: [_id]},
        type: {$in: ['FeedbackPost', 'CoveragePost', 'StatusUpdate']},
        'contacts.slug': oldPost.contacts[0].slug,
        'campaigns.slug': oldPost.campaigns[0].slug
      }, {
        sort: {createdAt: -1}
      })

      if (!mostRecentPreviousPost) {
        Campaigns.update({
          _id: oldPost.campaigns[0]._id,
          'contacts.slug': oldPost.contacts[0].slug
        }, {
          $set: {
            'contacts.$': {
              slug: oldPost.contacts[0].slug,
              status: StatusMap.toContact,
              updatedAt: oldPost.createdAt,
              updatedBy: oldPost.createdBy
            }
          }
        })
      } else if (moment(mostRecentPreviousPost.createdAt).isBefore(oldPost.createdAt)) {
        Campaigns.update({
          _id: oldPost.campaigns[0]._id,
          'contacts.slug': oldPost.contacts[0].slug
        }, {
          $set: {
            'contacts.$': {
              slug: oldPost.contacts[0].slug,
              status: mostRecentPreviousPost.status,
              updatedAt: oldPost.createdAt,
              updatedBy: oldPost.createdBy
            }
          }
        })
      }
    }
  }
})

export const createCoveragePost = new ValidatedMethod({
  name: 'createCoveragePost',
  validate: FeedbackOrCoverageSchema.validator(),
  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    return postFeedbackOrCoverage({
      type: 'CoveragePost',
      userId: this.userId,
      contactSlug,
      campaignSlug,
      message,
      status
    })
  }
})

export const createNeedToKnowPost = new ValidatedMethod({
  name: 'createNeedToKnowPost',
  validate: new SimpleSchema({
    contactSlug: {
      type: String
    },
    message: {
      type: String
    }
  }).validator(),
  run ({ contactSlug, message }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    return postFeedbackOrCoverage({
      type: 'NeedToKnowPost',
      userId: this.userId,
      contactSlug,
      message
    })
  }
})

export const removePost = new ValidatedMethod({
  name: 'deletePost',
  validate: new SimpleSchema({
    _ids: {
      type: Array
    },
    '_ids.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run ({ _ids }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    Posts.remove({
      _id: {
        $in: _ids
      }
    })
  }
})
