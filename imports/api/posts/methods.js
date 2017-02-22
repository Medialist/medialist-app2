import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { StatusSchema } from '/imports/lib/schema'
import { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from './posts'

function postFeedbackOrCoverage ({type, userId, contactSlug, campaignSlug, message, status}) {
  const createdBy = findOneUserRef(userId)
  const createdAt = new Date()
  const post = {
    contacts: Contacts.findContactRefs({contactSlugs: [contactSlug]}),
    campaigns: Campaigns.findCampaignRefs({campaignSlugs: [campaignSlug]}),
    type,
    status,
    message,
    createdBy,
    createdAt
  }
  Posts.insert(post)

  Campaigns.update(
    { slug: campaignSlug },
    {
      $set: {
        [`contacts.${contactSlug}`]: status,
        updatedAt: createdAt,
        updatedBy: createdBy
      }
    }
  )

  Contacts.update(
    { slug: contactSlug },
    {
      $set: {
        updatedAt: createdAt,
        updatedBy: createdBy
      },
      $addToSet: {
        campaigns: campaignSlug
      }
    }
  )

  addToMyFavourites({
    userId,
    contactSlugs: [contactSlug],
    campaignSlugs: [campaignSlug]
  })
}

const FeedbackOrCoverageSchema = new SimpleSchema([
  {
    contactSlug: { type: String },
    campaignSlug: { type: String },
    message: { type: String }
  },
  StatusSchema
])

export const createFeedbackPost = new ValidatedMethod({
  name: 'createFeedbackPost',

  validate: FeedbackOrCoverageSchema.validator(),

  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
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

export const createCoveragePost = new ValidatedMethod({
  name: 'createCoveragePost',

  validate: FeedbackOrCoverageSchema.validator(),

  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
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
    contactSlug: { type: String },
    message: { type: String }
  }).validator(),

  run ({ contactSlug, message }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist([contactSlug], Contacts)

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const post = {
      type: 'NeedToKnowPost',
      contacts: Contacts.findContactRefs({contactSlugs: [contactSlug]}),
      campaigns: [],
      message,
      createdBy,
      createdAt
    }
    Posts.insert(post)

    Contacts.update(
      { slug: contactSlug },
      {
        $set: {
          updatedAt: createdAt,
          updatedBy: createdBy
        }
      }
    )

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [contactSlug]
    })
  }
})
