import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import escapeRegExp from 'lodash.escaperegexp'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Contacts from '/imports/api/contacts/contacts'
import { ContactCreateSchema } from '/imports/api/contacts/schema'
import MasterLists from '/imports/api/master-lists/master-lists'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'

// Add all contacts to myContacts.
// Update existing favs with new updatedAt
export const batchFavouriteContacts = new ValidatedMethod({
  name: 'batchFavouriteContacts',

  validate: new SimpleSchema({
    contactSlugs: {
      type: Array
    },
    'contactSlugs.$': {
      type: String
    }
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
        $pull: {
          contacts: slug
        }
      }, {
        multi: true
      })

      // Remove contacts from campaigns
      CampaignContacts.remove({
        slug: slug
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
    details: {
      type: ContactCreateSchema
    }
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
      campaigns: [],
      masterLists: [],
      tags: [],
      imports: [],
      createdBy,
      createdAt,
      updatedBy: createdBy,
      updatedAt: createdAt
    })

    // filter any empty addresses
    contact.addresses = (contact.addresses || []).filter(address => {
      let allEmpty = true

      for (var key in address) {
        if (address[key]) {
          allEmpty = false
        }
      }

      return !allEmpty
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
    contactId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    details: {
      type: ContactCreateSchema
    }
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
    term: {
      type: String
    },
    field: {
      type: String
    }
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
      .map((outlet) => outlet[field] || '')
      .filter((s) => s.match(termRegExp))

    return suggestions
  }
})
