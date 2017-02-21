import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findUserRefs } from '/imports/api/users/users'
import Campaigns from '../medialists/medialists'
import Posts from '/imports/api/posts/posts'
import Contacts, { ContactSchema, ContactCreateSchema } from './contacts'

/*
 * Add mulitple Contacts to 1 Campaign
 * - Push all the contacts to the Campaign.contacts map
 * - Push the campaign to all the Contact.campigns arrays
 * - Update updatedAt on the Campaign and all contacts
 * - Create a Post about it.
 * - Add Campaigns and Contacts to users favourites
 */
export const addContactsToCampaign = new ValidatedMethod({
  name: 'addContactsToCampaign',

  validate: new SimpleSchema({
    contactSlugs: { type: [String] },
    campaignSlug: { type: String }
  }).validator(),

  run ({ contactSlugs, campaignSlug }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const updatedBy = findUserRefs({userIds: [this.userId]})
    const updatedAt = new Date()

    const newContacts = contactSlugs.reduce((ref, slug) => {
      ref[slug] = Contacts.status.toContact
      return ref
    }, {})

    const campaign = Campaigns.findOne(
      { slug: campaignSlug },
      { contacts: 1 }
    )

    // Merge incoming contacts with existing.
    // If a contact is already part of the campaign, it's status is preserved.
    Campaigns.update(
      { slug: campaignSlug },
      {
        $set: {
          contacts: Object.assign({}, newContacts, campaign.contacts),
          updatedAt,
          updatedBy
        }
      }
    )

    // Add campaign to all contacts
    Contacts.update(
      { slug: { $in: contactSlugs } },
      {
        $addToSet: {
          medialists: campaignSlug
        },
        $set: {
          updatedAt,
          updatedBy
        }
      },
      { multi: true }
    )

    // Add an entry to the activity feed
    Posts.createCampaignChange({
      action: 'addContactsToCampaign',
      campaignSlug,
      contactSlugs,
      updatedAt,
      updatedBy
    })

    // Add the things to the users my<Contact|Campaigns> list
    addToMyFavourites({
      userId: this.userId,
      contactSlugs,
      campaignSlugs: [campaignSlug]
    })
  }
})

/*
 * Remove mulitple Contacts from 1 Campaign
 * - Pull all the contacts from the Campaign.contacts map
 * - Pull all campaign from all the Contact.campaings array
 * - Update updatedAt on Campaign but not Contacts.
 * - Create a Post about it.
 * - Add nothing to users favorites.
 */
export const removeContactsFromCampaign = new ValidatedMethod({
  name: 'removeContactsFromCampaign',

  validate: new SimpleSchema({
    contactSlugs: { type: [String], min: 1 },
    campaignSlug: { type: String }
  }).validator(),

  run ({ contactSlugs, campaignSlug }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const updatedBy = findUserRefs({userIds: [this.userId]})
    const updatedAt = new Date()

    // a map of contacts.<slug> properties to delete from the campaign
    const $unset = contactSlugs.reduce(($unset, slug) => {
      $unset[`contacts.${slug}`] = ''
      return $unset
    }, {})

    Campaigns.update(
      { slug: campaignSlug },
      {
        $unset,
        $set: {
          updatedAt,
          updatedBy
        }
      }
    )

    Contacts.update(
      { slug: { $in: contactSlugs } },
      { $pull: { medialists: campaignSlug } },
      { multi: true }
    )

    Posts.createCampaignChange({
      action: 'removeContactsFromCampaign',
      campaignSlug,
      contactSlugs,
      updatedAt,
      updatedBy
    })
  }
})

// Add all contacts to myContacts.
// Update existing favs with new updatedAt
export const batchFavouriteContacts = new ValidatedMethod({
  name: 'batchFavouriteContacts',

  validate: new SimpleSchema({
    contactSlugs: { type: [String] }
  }).validator(),

  run ({ contactSlugs }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(contactSlugs, Contacts)
    addToMyFavourites({userId: this.userId, contactSlugs})
  }
})

/*
 * Delete an array of contacts by id
 * Remove from all users myContacts array before deleting.
 * TODO: refactor to use a deletedAt flag instead of removing.
 */
export const batchRemoveContacts = new ValidatedMethod({
  name: 'batchRemoveContacts',

  validate: new SimpleSchema({
    contactIds: { type: [String] }
  }).validator(),

  run ({contactIds}) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    Meteor.users.update(
      { 'myContacts._id': { $in: contactIds } },
      { $pull: { myContacts: { _id: { $in: contactIds } } } },
      { multi: true }
    )
    return Contacts.remove({ _id: { $in: contactIds } })
  }
})

/*
 * Create a new contact.
 * Check for duplicates first and add to the users `myContacts` array.
 */
export const createContact = new ValidatedMethod({
  name: 'createContact',

  validate: new SimpleSchema({
    details: { type: ContactCreateSchema }
  }).validator(),

  run ({details}) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
      // return if a matching twitter handle already exists
    const existingContact = details.twitter && Contacts.findOne({ 'socials.label': 'Twitter', 'socials.value': details.twitter })
    if (existingContact) return existingContact

    const user = Meteor.users.findOne({_id: this.userId})
    const createdBy = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter && user.services.twitter.profile_image_url_https
    }
    const createdAt = new Date()

    // Merge the provided details with any missing values
    const contact = Object.assign({}, details, {
      slug: slugify(details.name, Contacts),
      medialists: [],
      masterLists: [],
      tags: [],
      languages: 'English',
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy
    })

    // Save the contact
    check(contact, ContactSchema)
    const contactId = Contacts.insert(contact)

    Meteor.users.update(
      { _id: this.userId },
      { $push: {
        'myContacts': {
          _id: contactId,
          slug: contact.slug,
          avatar: contact.avatar,
          name: contact.name,
          outlets: contact.outlets,
          updatedAt: contact.updatedAt
        }
      }}
    )

    return contactId
  }
})
