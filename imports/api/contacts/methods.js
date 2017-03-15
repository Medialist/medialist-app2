import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Campaigns from '../campaigns/campaigns'
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

    const updatedBy = findOneUserRef(this.userId)
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
          campaigns: campaignSlug
        },
        $set: {
          updatedAt,
          updatedBy
        }
      },
      { multi: true }
    )

    // Add an entry to the activity feed
    Posts.create({
      type: 'AddContactsToCampaign',
      contactSlugs,
      campaignSlugs: [campaignSlug],
      createdAt: updatedAt,
      createdBy: updatedBy
    })

    // Add the things to the users my<Contact|Campaigns> list
    addToMyFavourites({
      userId: this.userId,
      contactSlugs,
      campaignSlugs: [campaignSlug],
      updatedAt
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

    const updatedBy = findOneUserRef(this.userId)
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
      { $pull: { campaigns: campaignSlug } },
      { multi: true }
    )

    Posts.create({
      type: 'RemoveContactsFromCampaign',
      contactSlugs,
      campaignSlugs: [campaignSlug],
      createdAt: updatedAt,
      createdBy: updatedBy
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

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const slug = slugify(details.name, Contacts)

    // Merge the provided details with any missing values
    const contact = Object.assign({}, details, {
      slug,
      campaigns: [],
      masterLists: [],
      tags: [],
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy
    })

    // Save the contact
    check(contact, ContactSchema)
    const contactId = Contacts.insert(contact)

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [slug],
      updatedAt: createdAt
    })

    return contactId
  }
})

/*
 * Update a contact.
 * Add to the users `myContacts` array.
 */
export const updateContact = new ValidatedMethod({
  name: 'updateContact',

  validate: new SimpleSchema({
    contactId: { type: String, regEx: SimpleSchema.RegEx.Id },
    details: { type: ContactCreateSchema }
  }).validator(),

  run ({contactId, details}) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const existingContact = Contacts.findOne({ _id: contactId })
    if (!existingContact) throw new Meteor.Error('updateContact.nosuchcontact', `Could not find a contact ${contactId}`)

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    // Merge the provided details with any missing values
    const $set = Object.assign(details, {
      updatedBy,
      updatedAt
    })

    Contacts.update({_id: contactId}, {$set})

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [existingContact.slug],
      updatedAt
    })

    // TODO: if any props are in the contact ref, update all refs...

    return contactId
  }
})

export const searchOutlets = new ValidatedMethod({
  name: 'searchOutlets',

  validate: new SimpleSchema({
    term: { type: String },
    field: { type: String }
  }).validator(),

  run ({term, field}) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const termRegExp = new RegExp('^' + term, 'i')
    const suggestions = Contacts
      .find(
        {[`outlets.${field}`]: termRegExp},
        {fields: {outlets: 1}, limit: 10}
      )
      .map((contact) => contact.outlets)
      .reduce((res, arr) => res.concat(arr), [])
      .map((outlet) => outlet[field])
      .filter((s) => s.match(termRegExp))
    return suggestions
  }
})
