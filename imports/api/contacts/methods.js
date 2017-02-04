import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { checkAllSlugsExist } from '/imports/lib/slug'
import Campaigns from '../medialists/medialists'
import Contacts from './contacts'

// TODO: port other contact methods to new style and test

// TODO: Should batch options update My contacts / campaigns?
// TODO: Should batch options update updatedAt timestamps?
// TODO: Should batch options raise a batch specific post?
export const batchAddContactsToCampaigns = new ValidatedMethod({
  name: 'Contacts/batchAddContactsToCampaigns',

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
      bulkCampaigns.executeAsync = Meteor.wrapAsync(bulkCampaigns.execute)
      campaigns.forEach(({_id, contacts}) => {
        bulkCampaigns.find({_id}).update({
          $set: {
            contacts: Object.assign({}, newContacts, contacts)
          }
        })
      })
      bulkCampaigns.executeAsync()
    }

    // Set all new campaigns on contacts
    Contacts.update(
      { slug: { $in: contactSlugs } },
      { $addToSet: { medialists: { $each: campaignSlugs } } },
      { multi: true }
    )
  }
})

// Add all contacts to myContacts.
// Update existing favs with new updatedAt
export const batchFavouriteContacts = new ValidatedMethod({
  name: 'Contacts/batchFavouriteContacts',

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
