import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import escapeRegExp from 'lodash.escaperegexp'
import difference from 'lodash.difference'
import intersection from 'lodash.intersection'
import slugify, { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Contacts from '/imports/api/contacts/contacts'
import { ContactCreateSchema, ContactSlugsOrSearchSchema } from '/imports/api/contacts/schema'
import { findOrValidateContactSlugs } from '/imports/api/contacts/queries'
import { StatusValues } from '/imports/api/contacts/status'
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

  // don't use the clients guess of how many were added
  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    campaignSlug: {
      type: String
    }
  }).extend(ContactSlugsOrSearchSchema).validator(),

  run ({ campaignSlug, ...searchOrSlugs }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      // This takes way too long on the client so we just perform the initial
      // validation logic and bail here. The `returnStubValue: false` option above
      // is important as otherwise the client will assume it's simulated null
      // is the result of this method call and display incorrect info to the user.
      return
    }

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    }, {
      contacts: 1
    })
    if (!campaign) throw new Meteor.Error(`Campaign ${campaignSlug} could not be found`)

    const contactSlugs = findOrValidateContactSlugs(searchOrSlugs)
    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    // Add the things to the users my<Contact|Campaigns> list
    addToMyFavourites({
      userId: this.userId,
      contactSlugs,
      campaignSlugs: [campaignSlug]
    })

    const newContactSlugs = difference(contactSlugs, campaign.contacts.map(c => c.slug))

    if (newContactSlugs.length === 0) {
      // User hasn't changed anything, so we're done.
      return { numContactsAdded: 0 }
    }

    const newContacts = newContactSlugs.map((slug) => ({
      slug,
      status: Contacts.status.toContact,
      updatedAt,
      updatedBy
    }))

    // Merge incoming contacts with existing.
    // If a contact is already part of the campaign, it's status is preserved.
    Campaigns.update({
      slug: campaignSlug
    }, {
      $addToSet: {
        contacts: {
          $each: newContacts
        }
      },
      $set: {
        updatedBy,
        updatedAt
      }
    })

    // Add campaign to contacts that were added
    Contacts.update({
      slug: {
        $in: newContactSlugs
      }
    }, {
      $addToSet: {
        campaigns: campaignSlug
      },
      $set: {
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })

    // Add an entry to the activity feed
    Posts.create({
      type: 'AddContactsToCampaign',
      contactSlugs: newContactSlugs,
      campaignSlugs: [campaignSlug],
      createdBy: updatedBy
    })

    return { numContactsAdded: newContactSlugs.length }
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
    campaignSlugs: {
      type: Array,
      min: 1
    },
    'campaignSlugs.$': {
      type: String
    }
  }).extend(ContactSlugsOrSearchSchema).validator(),

  run ({ campaignSlugs, ...searchOrSlugs }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const contactSlugs = findOrValidateContactSlugs(searchOrSlugs)
    checkAllSlugsExist(campaignSlugs, Campaigns)

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    Campaigns.update({
      slug: {
        $in: campaignSlugs
      }
    }, {
      $pull: {
        contacts: {
          slug: {
            $in: contactSlugs
          }
        }
      },
      $set: {
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })

    Contacts.update({
      slug: {
        $in: contactSlugs
      }
    }, {
      $pullAll: {
        campaigns: campaignSlugs
      },
      $set: {
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })
  }
})

// Add all contacts to myContacts.
// Update existing favs with new updatedAt
export const batchFavouriteContacts = new ValidatedMethod({
  name: 'batchFavouriteContacts',

  validate: ContactSlugsOrSearchSchema.validator(),

  run (searchOrSlugs) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const contactSlugs = findOrValidateContactSlugs(searchOrSlugs)
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

  // don't use the clients guess of how many were removed
  applyOptions: {
    returnStubValue: false
  },

  validate: ContactSlugsOrSearchSchema.validator(),

  run (slugsOrSearch) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateContactSlugs(slugsOrSearch)

    slugs.forEach(slug => {
      const _id = Contacts.findOne({
        slug: slug
      }, {
        fields: {
          '_id': 1
        }
      })
      ._id

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
          contacts: {
            slug: slug
          }
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

    return { slugCount: slugs.length }
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

    if (Meteor.isServer) {
      const termRegExp = new RegExp('^' + escapeRegExp(term), 'i')

      const suggestions = Contacts.aggregate([
        { $match: { [`outlets.${field}`]: termRegExp } },
        { $unwind: '$outlets' },
        { $match: { [`outlets.${field}`]: termRegExp } },
        { $group: { _id: `$outlets.${field}` } },
        { $limit: 10 }
      ])

      return suggestions.map(({ _id }) => _id)
    }

    return []
  }
})

export const batchUpdateStatus = new ValidatedMethod({
  name: 'batchUpdateStatus',

  validate: new SimpleSchema({
    campaignSlug: {
      type: String
    },
    status: {
      type: String,
      allowedValues: StatusValues
    }
  }).extend(ContactSlugsOrSearchSchema).validator(),

  run ({campaignSlug, status, ...searchOrSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    })

    if (!campaign) {
      throw new Meteor.Error('Can\'t find campaign')
    }

    let contactSlugs = findOrValidateContactSlugs(searchOrSlugs)

    // only keep contacts that are on the campaign
    contactSlugs = intersection(contactSlugs, campaign.contacts.map(c => c.slug))

    if (!contactSlugs.length) {
      return
    }

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    contactSlugs.forEach((contactSlug) => {
      campaign.contacts.forEach(contact => {
        if (contact.slug === contactSlug) {
          contact.status = status
          contact.updatedBy = updatedBy
          contact.updatedAt = updatedAt
        }
      })
    })

    // update campaign contact status and updatedAt/updatedBy
    Campaigns.update({
      slug: campaignSlug
    }, {
      $set: {
        contacts: campaign.contacts,
        updatedBy,
        updatedAt
      }
    })

    // update contact updatedAt/updatedBy
    Contacts.update({
      slug: {
        $in: contactSlugs
      }
    }, {
      $set: {
        updatedBy,
        updatedAt
      }
    }, {
      multi: true
    })

    Posts.create({
      type: 'StatusUpdate',
      contactSlugs: contactSlugs,
      campaignSlugs: [campaign.slug],
      status: status,
      createdBy: updatedBy
    })
  }
})
