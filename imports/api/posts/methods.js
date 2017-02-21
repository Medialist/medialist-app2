import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { StatusSchema } from '/imports/lib/schema'
import { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from './posts'

export const createFeedbackPost = new ValidatedMethod({
  name: 'createFeedbackPost',

  validate: new SimpleSchema({
    contactSlug: { type: String },
    campaignSlug: { type: String },
    message: { type: String },
    status: { type: StatusSchema }
  }).validator(),

  run ({ contactSlug, campaignSlug, message, status }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist([contactSlug], Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const post = {
      type: 'createFeedbackPost',
      contacts: Contacts.findContactRefs({contactSlugs: [contactSlug]}),
      campaigns: Campaigns.findCampaignRefs({campaignSlugs: [campaignSlug]}),
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
          [`contact.${contactSlug}`]: status,
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
        }
      }
    )

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [contactSlug],
      campaignSlugs: [campaignSlug]
    })
  }
})

export const createCoveragePost = new ValidatedMethod({
  name: 'createCoveragePost',

  validate: new SimpleSchema({
    contactSlug: { type: String },
    campaignSlug: { type: String },
    message: { type: String }
  }).validator(),

  run ({ contactSlug, campaignSlug, message }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist([contactSlug], Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const post = {
      type: 'createCoveragePost',
      contacts: Contacts.findContactRefs({contactSlugs: [contactSlug]}),
      campaigns: Campaigns.findCampaignRefs({campaignSlugs: [campaignSlug]}),
      message,
      createdBy,
      createdAt
    }
    Posts.insert(post)

    Campaigns.update(
      { slug: campaignSlug },
      {
        $set: {
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
        }
      }
    )

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [contactSlug],
      campaignSlugs: [campaignSlug]
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
      type: 'createNeedToKnowPost',
      contacts: Contacts.findContactRefs({contactSlugs: [contactSlug]}),
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
