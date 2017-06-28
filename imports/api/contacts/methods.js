import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import escapeRegExp from 'lodash.escaperegexp'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Contacts from '/imports/api/contacts/contacts'
import { ContactCreateSchema } from '/imports/api/contacts/schema'
import { StatusSchema } from '/imports/lib/schema'
import MasterLists from '/imports/api/master-lists/master-lists'

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
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    const newContacts = contactSlugs.reduce((ref, slug) => {
      ref[slug] = Contacts.status.toContact
      return ref
    }, {})

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    }, {
      contacts: 1
    })

    // Merge incoming contacts with existing.
    // If a contact is already part of the campaign, it's status is preserved.
    Campaigns.update({
      slug: campaignSlug
    }, {
      $set: {
        contacts: Object.assign({}, newContacts, campaign.contacts),
        updatedBy,
        updatedAt
      }
    })

    // Add campaign to all contacts
    Contacts.update({
      slug: {
        $in: contactSlugs
      }
    }, {
      $set: {
        [`campaigns.${campaignSlug}`]: {
          updatedAt
        },
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })

    // Add an entry to the activity feed
    Posts.create({
      type: 'AddContactsToCampaign',
      contactSlugs,
      campaignSlugs: [campaignSlug],
      createdBy: updatedBy
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
 * Remove Contacts from Campaigns
 * - Pull all the contacts from the Campaign.contacts map
 * - Pull all campaign from all the Contact.campaigns array
 * - Update updatedAt on Campaign but not Contacts.
 * - Create a Post about it.
 * - Add nothing to users favorites.
 */
export const removeContactsFromCampaigns = new ValidatedMethod({
  name: 'removeContactsFromCampaign',

  validate: new SimpleSchema({
    contactSlugs: {
      type: [String],
      min: 1
    },
    campaignSlugs: {
      type: [String],
      min: 1
    }
  }).validator(),

  run ({ contactSlugs, campaignSlugs }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist(campaignSlugs, Campaigns)

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    // a map of contacts.<slug> properties to delete from the campaign
    const $unset = contactSlugs.reduce(($unset, slug) => {
      $unset[`contacts.${slug}`] = ''
      return $unset
    }, {})

    Campaigns.update({
      slug: {
        $in: campaignSlugs
      }
    }, {
      $unset,
      $set: {
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })

    campaignSlugs.forEach(campaignSlug => {
      Contacts.update({
        slug: {
          $in: contactSlugs
        }
      }, {
        $unset: {
          [`campaigns.${campaignSlug}`]: ''
        },
        $set: {
          updatedBy,
          updatedAt
        }
      }, {
        multi: true
      })
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
    addToMyFavourites({
      userId: this.userId,
      contactSlugs
    })
  }
})

/*
 * Delete an array of contacts by id
 */
export const batchRemoveContacts = new ValidatedMethod({
  name: 'batchRemoveContacts',

  validate: new SimpleSchema({
    _ids: { type: [String] }
  }).validator(),

  run ({ _ids }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    _ids.forEach(_id => {
      // get slugs from ids
      const slug = Contacts.findOne({
        _id: _id
      }, {
        fields: {
          'slug': 1
        }
      })
      .slug

      // remove contact
      Contacts.remove({
        _id: _id
      })

      // remove contacts from users favourites
      Meteor.users.update({
        'myContacts._id': _id
      }, {
        $pull: {
          myContacts: {
            _id: _id
          }
        }
      }, {
        multi: true
      })

      // Remove contacts from contact lists
      MasterLists.update({
        type: 'Contacts'
      }, {
        $pull: {
          items: _id
        }
      }, {
        multi: true
      })

      // Remove contacts from campaigns
      Campaigns.update({}, {
        $unset: {
          [`contacts.${slug}`]: ''
        }
      }, {
        multi: true
      })

      // remove contact from all posts
      Posts.update({
        'contacts._id': _id
      }, {
        $pull: {
          contacts: {
            _id: _id
          }
        }
      }, {
        multi: true
      })

      // remove contact related posts with no contacts
      Posts.remove({
        type: {
          $in: ['FeedbackPost', 'CoveragePost', 'NeedToKnowPost', 'AddContactsToCampaign', 'StatusUpdate']
        },
        contacts: {
          $exists: true,
          $size: 0
        }
      })
    })
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
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }
    // return if a matching twitter handle already exists
    const existingContact = details.twitter && Contacts.findOne({ 'socials.label': 'Twitter', 'socials.value': details.twitter })

    if (existingContact) {
      return existingContact
    }

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const slug = slugify(details.name, Contacts)

    // Merge the provided details with any missing values
    const contact = Object.assign({}, details, {
      slug,
      campaigns: {},
      masterLists: [],
      tags: [],
      imports: [],
      createdBy,
      createdAt,
      updatedBy: createdBy,
      updatedAt: createdAt
    })

    // Save the contact
    Contacts.insert(contact)

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [slug]
    })

    return slug
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

    if (!existingContact) {
      throw new Meteor.Error('updateContact.nosuchcontact', `Could not find a contact ${contactId}`)
    }

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    const $set = Object.assign(details, {
      updatedBy,
      updatedAt
    })

    Contacts.update({_id: contactId}, {
      $set
    })

    const updatedContact = Contacts.findOne({_id: contactId})

    // Update existing users' favourite contacts with new denormalised data
    Meteor.users.update({
      'myContacts._id': contactId
    }, {
      $set: {
        'myContacts.$.name': updatedContact.name,
        'myContacts.$.slug': updatedContact.slug,
        'myContacts.$.avatar': updatedContact.avatar,
        'myContacts.$.outlets': updatedContact.outlets,
        'myContacts.$.updatedAt': updatedContact.updatedAt
      }
    }, {
      multi: true
    })

    addToMyFavourites({
      userId: this.userId,
      contactSlugs: [existingContact.slug]
    })

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
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const termRegExp = new RegExp('^' + escapeRegExp(term), 'i')

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

export const batchUpdateStatus = new ValidatedMethod({
  name: 'batchUpdateStatus',

  validate: new SimpleSchema([{
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    contacts: {
      type: [String]
    }
  }, StatusSchema]).validator(),

  run ({_id, contacts, status}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const campaign = Campaigns.findOne({ _id })

    if (!campaign) {
      throw new Meteor.Error('Can\'t find campaign')
    }

    checkAllSlugsExist(contacts, Contacts)

    const campaignContactsStatus = contacts.reduce((o, slug) => {
      o[slug] = status
      return o
    }, {})

    const update = {
      $set: {
        contacts: Object.assign({}, campaign.contacts, campaignContactsStatus),
        updatedBy: findOneUserRef(this.userId),
        updatedAt: new Date()
      }
    }

    Campaigns.update({ _id }, update)

    Posts.create({
      type: 'StatusUpdate',
      contactSlugs: contacts,
      campaignSlugs: [campaign.slug],
      status: status,
      createdBy: findOneUserRef(this.userId)
    })
  }
})
