import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { StatusSchema } from '/imports/lib/schema'
import { checkAllSlugsExist } from '/imports/lib/slug'
import findUrl from '/imports/lib/find-url'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Embeds, { BaseEmbedRefSchema } from '/imports/api/embeds/embeds'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'

function postFeedbackOrCoverage ({type, userId, contactSlug, campaignSlug, message, status}) {
  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })

  if (campaign.contacts[contactSlug] === status && !message) {
    return
  }

  const createdBy = findOneUserRef(userId)
  const createdAt = new Date()
  const url = findUrl(message)
  const embed = Embeds.findOneEmbedRef(url)
  const post = {
    // Feedback without a message is rendered as a different post type.
    type: message ? type : 'StatusUpdate',
    contacts: Contacts.findRefs({contactSlugs: [contactSlug]}),
    campaigns: Campaigns.findRefs({campaignSlugs: [campaignSlug]}),
    embeds: embed ? [embed] : [],
    status,
    message,
    createdBy,
    createdAt
  }

  Posts.insert(post)

  Campaigns.update({
    slug: campaignSlug
  }, {
    $set: {
      [`contacts.${contactSlug}`]: status,
      updatedAt: createdAt,
      updatedBy: createdBy
    }
  })

  Contacts.update({
    slug: contactSlug
  }, {
    $set: {
      updatedAt: createdAt,
      updatedBy: createdBy
    },
    $addToSet: {
      campaigns: campaignSlug
    }
  })

  addToMyFavourites({
    userId,
    contactSlugs: [contactSlug],
    campaignSlugs: [campaignSlug],
    updatedAt: createdAt
  })
}

const FeedbackOrCoverageSchema = new SimpleSchema([{
  contactSlug: {
    type: String
  },
  campaignSlug: {
    type: String
  },
  message: {
    type: String,
    optional: true
  }
},
  StatusSchema
])

const UpdateFeedbackOrCoverageSchema = new SimpleSchema({
  postId: {
    type: String
  },
  'update.message': {
    type: String,
    optional: true
  },
  'update.status': {
    type: String
  },
  'update.embed': {
    type: BaseEmbedRefSchema,
    optional: true
  }
})

export const createFeedbackPost = new ValidatedMethod({
  name: 'createFeedbackPost',
  validate: FeedbackOrCoverageSchema.validator(),
  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist([contactSlug], Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    postFeedbackOrCoverage({
      type: 'FeedbackPost',
      userId: this.userId,
      contactSlug,
      campaignSlug,
      message,
      status
    })
  }
})

export const updateFeedbackPost = new ValidatedMethod({
  name: 'updateFeedbackPost',
  validate: UpdateFeedbackOrCoverageSchema.validator(),
  run ({ postId: _id, update }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const post = Posts.findOne({ _id })

    if (!post) {
      throw new Meteor.Error('Can\'t find post')
    }

    const { message, status } = update

    Posts.update({ _id }, {$set: {message, status, updatedAt: new Date()}}, {upsert: true})

    if (status !== post.status) {
      post.campaigns.forEach((campaign) => {
        Campaigns.update({
          slug: campaign.slug
        }, {
          $set: {
            [`contacts.${post.contacts[0].slug}`]: status,
            updatedAt: new Date(),
            updatedBy: post.createdBy
          }
        })
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

    checkAllSlugsExist([contactSlug], Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    postFeedbackOrCoverage({
      type: 'CoveragePost',
      userId: this.userId,
      contactSlug,
      campaignSlug,
      message,
      status
    })
  }
})

export const updateCoveragePost = new ValidatedMethod({
  name: 'updateCoveragePost',
  validate: UpdateFeedbackOrCoverageSchema.validator(),
  run ({ postId: _id, update }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const post = Posts.findOne({ _id })

    if (!post) {
      throw new Meteor.Error('Can\'t find post')
    }

    if (update.embed && Meteor.isServer) {
      const embed = Embeds.findOneById(update.embed._id)
      const embeds = [embed].concat(post.embeds)
      Posts.update({ _id }, {$set: { embeds }})
    }

    const { message = post.message, status = post.status } = update

    Posts.update({ _id }, {$set: {message, status, updatedAt: new Date()}}, {upsert: true})

    if (update.status !== post.status) {
      post.campaigns.forEach((campaign) => {
        Campaigns.update({
          slug: campaign.slug
        }, {
          $set: {
            [`contacts.${post.contacts[0].slug}`]: status,
            updatedAt: new Date(),
            updatedBy: post.createdBy
          }
        })
      })
    }
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

    checkAllSlugsExist([contactSlug], Contacts)

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const url = findUrl(message)
    const embed = Embeds.findOneEmbedRef(url)
    const post = {
      type: 'NeedToKnowPost',
      contacts: Contacts.findRefs({contactSlugs: [contactSlug]}),
      campaigns: [],
      embeds: embed ? [embed] : [],
      message,
      createdBy,
      createdAt
    }

    Posts.insert(post)

    Contacts.update({
      slug: contactSlug
    }, {
      $set: {
        updatedAt: createdAt,
        updatedBy: createdBy
      }
    })

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [contactSlug],
      updatedAt: createdAt
    })
  }
})

export const remove = new ValidatedMethod({
  name: 'deletePost',
  validate: new SimpleSchema({
    _ids: {
      type: [String],
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
