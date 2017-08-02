import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { StatusValues } from '/imports/api/contacts/status'
import { checkAllSlugsExist } from '/imports/lib/slug'
import findUrl from '/imports/lib/find-url'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import { updatePostSchema } from '/imports/api/posts/schema'

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
  validate: updatePostSchema.validator(),
  run ({ _id, message, status, contact, campaign }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const post = Posts.findOne({ _id })

    if (!post) {
      throw new Meteor.Error('Can\'t find post')
    }

    if (this.userId !== post.createdBy._id) {
      throw new Meteor.Error('You can only edit posts you created')
    }

    const userRef = findOneUserRef(this.userId)
    const updatedAt = new Date()

    const $set = {
      updatedBy: userRef,
      updatedAt
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

    if (status) $set.status = status
    if (contact) $set.contacts = [contact]
    if (campaign) $set.campaigns = [campaign]

    Posts.update({
      _id
    }, {
      $set: $set
    })

    if (post.type === 'NeedToKnowPost') {
      post.contacts.forEach((contact) => {
        Contacts.update({
          _id: contact._id
        }, {
          $set: {
            updatedBy: userRef,
            updatedAt
          }
        })
      })
    }

    if (status !== post.status) {
      post.campaigns.forEach((campaign) => {
        Campaigns.update({
          _id: campaign._id
        }, {
          $set: {
            [`contacts.${post.contacts[0].slug}`]: status,
            updatedBy: userRef,
            updatedAt
          }
        })
      })
    }

    if (contact) {
      post.contacts.forEach((postContact) => {
        if (postContact._id !== contact._id) {
          Contacts.update({
            _id: {$in: [contact._id, postContact._id]}
          }, {
            $set: {
              updatedBy: userRef,
              updatedAt
            }
          })
        }
      })
    }

    if (campaign) {
      post.campaigns.forEach((postCampaign) => {
        if (postCampaign._id !== campaign._id) {
          Campaigns.update({
            _id: campaign._id
          }, {
            $set: {
              [`contacts.${post.contacts[0].slug}`]: status,
              updatedBy: userRef,
              updatedAt
            }
          })
        }
      })
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
