import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { StatusSchema } from '/imports/lib/schema'
import { StatusValues } from '/imports/api/contacts/status'
import { checkAllSlugsExist } from '/imports/lib/slug'
import findUrl from '/imports/lib/find-url'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Embeds, {BaseEmbedRefSchema} from '/imports/api/embeds/embeds'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'

function postFeedbackOrCoverage ({type, userId, contactSlug, campaignSlug, message, status}) {
  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })

  if (campaign.contacts[contactSlug] && campaign.contacts[contactSlug] === status && !message) {
    return
  }

  const createdBy = findOneUserRef(userId)
  const now = new Date()
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
    createdAt: now
  }

  Posts.insert(post)

  Campaigns.update({
    slug: campaignSlug
  }, {
    $set: {
      [`contacts.${contactSlug}`]: status,
      updatedAt: now,
      updatedBy: createdBy
    }
  })

  Contacts.update({
    slug: contactSlug
  }, {
    $set: {
      updatedAt: now,
      updatedBy: createdBy,
      [`campaigns.${campaignSlug}.updatedAt`]: now
    }
  })

  addToMyFavourites({
    userId,
    contactSlugs: [contactSlug],
    campaignSlugs: [campaignSlug],
    updatedAt: now
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

const UpdatePostSchema = new SimpleSchema({
  _id: {
    type: String
  },
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: StatusValues,
    optional: true
  },
  embed: {
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

export const updatePost = new ValidatedMethod({
  name: 'updatePost',
  validate: UpdatePostSchema.validator(),
  run ({ _id, message, status, embed }) {
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

    const $set = {}

    if (embed && !Meteor.isSimulation) {
      const newEmbed = Embeds.findOneById(embed._id)
      $set.embeds = [newEmbed]
    }

    if (message) $set.message = message
    if (status) $set.status = status

    Posts.update({ _id }, {$set: $set}, {upsert: true})

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

    if (post.type === 'NeedToKnowPost') {
      post.contacts.forEach((contact) => {
        Contacts.update({
          slug: contact.slug
        }, {
          $set: {
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

export const createAddContactsToCampaignPost = new ValidatedMethod({
  name: 'createAddContactsToCampaignPost',
  validate: new SimpleSchema({
    contactSlugs: {
      type: [String]
    },
    campaignSlug: {
      type: String
    }
  }).validator(),
  run ({contactSlugs, campaignSlug}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const type = 'AddContactsToCampaign'
    const contacts = Contacts.findRefs({contactSlugs})
    const campaigns = Campaigns.findRefs({campaignSlugs: [campaignSlug]})
    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()

    const post = Posts.findOne({ type, contacts, campaigns, createdBy })

    if (post) return

    Posts.insert({
      type,
      contacts,
      campaigns,
      createdAt,
      createdBy
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
