import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import Campaigns from '../medialists/medialists'
import Contacts, { ContactSchema, ContactCreateSchema } from './contacts'

// TODO: Should batch options update My contacts / campaigns timestamp?
// TODO: Should batch options update updatedAt timestamps?
// TODO: Should batch options raise a batch specific post?
export const batchAddContactsToCampaigns = new ValidatedMethod({
  name: 'batchAddContactsToCampaigns',

  validate: new SimpleSchema({
    contactSlugs: { type: [String] },
    campaignSlugs: { type: [String] }
  }).validator(),

  run ({ contactSlugs, campaignSlugs }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist(campaignSlugs, Campaigns)

    // Set all new contacts on campaigns
    // Create the { slug: status } map for new contcts
    // For each campaign, merge it with the existing map, and save the result.
    if (!this.isSimulation) {
      const campaigns = Campaigns.find(
        {slug: {$in: campaignSlugs}},
        {_id: 1, contacts: 1}
      )
      const newContacts = contactSlugs.reduce((ref, slug) => {
        ref[slug] = Contacts.status.toContact
        return ref
      }, {})
      const bulkCampaigns = Campaigns.rawCollection().initializeUnorderedBulkOp()
      bulkCampaigns.executeSync = Meteor.wrapAsync(bulkCampaigns.execute)
      campaigns.forEach(({_id, contacts}) => {
        bulkCampaigns.find({_id}).update({
          $set: {
            contacts: Object.assign({}, newContacts, contacts)
          }
        })
      })
      bulkCampaigns.executeSync()
    }

    // Set all new campaigns on contacts
    Contacts.update(
      { slug: { $in: contactSlugs } },
      { $addToSet: { medialists: { $each: campaignSlugs } } },
      { multi: true }
    )
  }
})

export const removeContactsFromCampaign = new ValidatedMethod({
  name: 'removeContactsFromCampaigns',

  validate: new SimpleSchema({
    contactSlugs: { type: [String], min: 1 },
    campaignSlug: { type: String }
  }).validator(),

  run ({ contactSlugs, campaignSlug }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    // a map of contacts.<slug> properties to delete from the campaign
    const $unset = contactSlugs.reduce(($unset, slug) => {
      $unset[`contacts.${slug}`] = ''
      return $unset
    }, {})

    Campaigns.update(
      { slug: campaignSlug },
      { $unset }
    )

    Contacts.update(
      { slug: { $in: contactSlugs } },
      { $pull: { medialists: campaignSlug } },
      { multi: true }
    )
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
    const user = Meteor.users.findOne({_id: this.userId})
    const now = new Date()

    // transform contacts into contact refs for user.myContacts array.
    const newFavs = Contacts.find(
      { slug: { $in: contactSlugs } },
      { fields: { avatar: 1, slug: 1, name: 1, outlets: 1 } }
    ).map((contact) => ({
      _id: contact._id,
      name: contact.name,
      slug: contact.slug,
      avatar: contact.avatar,
      outlets: contact.outlets,
      updatedAt: now
    }))

    // Preserve other favs.
    const existingFavs = user.myContacts.filter((c) => !contactSlugs.includes(c.slug))

    return Meteor.users.update(
      this.userId,
      { $set: { myContacts: existingFavs.concat(newFavs) } }
    )
  }
})

/*
 * Remove an array of contacts by id
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
