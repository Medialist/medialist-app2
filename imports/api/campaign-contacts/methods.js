import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import difference from 'lodash.difference'
import intersection from 'lodash.intersection'
import { checkAllSlugsExist } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import Campaigns from '/imports/api/campaigns/campaigns'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'
import Posts from '/imports/api/posts/posts'
import Contacts from '/imports/api/contacts/contacts'
import { StatusValues } from '/imports/api/contacts/status'

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
    contactSlugs: {
      type: Array
    },
    'contactSlugs.$': {
      type: String
    },
    campaignSlug: {
      type: String
    }
  }).validator(),

  run ({ contactSlugs, campaignSlug }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist(contactSlugs, Contacts)
    checkAllSlugsExist([campaignSlug], Campaigns)

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    }, {
      contacts: 1
    })

    // Add the things to the users my<Contact|Campaigns> list
    addToMyFavourites({
      userId: this.userId,
      contactSlugs,
      campaignSlugs: [campaignSlug]
    })

    const newContactSlugs = difference(contactSlugs, campaign.contacts)

    if (newContactSlugs.length === 0) {
      // User hasn't changed anything, so we're done.
      return
    }

    newContactSlugs.forEach((slug) => {
      const ref = Contacts.findOneRef(slug)
      ref.campaign = campaignSlug
      ref.status = Contacts.status.toContact
      ref.updatedAt = updatedAt
      ref.updatedBy = updatedBy

      delete ref._id

      CampaignContacts.insert(ref)
    })

    // Merge incoming contacts with existing.
    // If a contact is already part of the campaign, it's status is preserved.
    Campaigns.update({
      slug: campaignSlug
    }, {
      $set: {
        contacts: Array.from(new Set([].concat(newContactSlugs).concat(campaign.contacts))),
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
      type: Array,
      min: 1
    },
    'contactSlugs.$': {
      type: String
    },
    campaignSlugs: {
      type: Array,
      min: 1
    },
    'campaignSlugs.$': {
      type: String
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

    Campaigns.update({
      slug: {
        $in: campaignSlugs
      }
    }, {
      $pullAll: {
        contacts: contactSlugs
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

    CampaignContacts.remove({
      slug: {
        $in: contactSlugs
      },
      campaign: {
        $in: campaignSlugs
      }
    })
  }
})

export const batchUpdateStatus = new ValidatedMethod({
  name: 'batchUpdateStatus',

  validate: new SimpleSchema({
    campaignSlug: {
      type: String
    },
    contactSlugs: {
      type: Array
    },
    'contactSlugs.$': {
      type: String
    },
    status: {
      type: String,
      allowedValues: StatusValues
    }
  }).validator(),

  run ({campaignSlug, contactSlugs, status}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    })

    if (!campaign) {
      throw new Meteor.Error('Can\'t find campaign')
    }

    checkAllSlugsExist(contactSlugs, Contacts)

    // only keep contacts that are on the campaign
    contactSlugs = intersection(contactSlugs, campaign.contacts)

    if (!contactSlugs.length) {
      return
    }

    const updatedBy = findOneUserRef(this.userId)
    const updatedAt = new Date()

    CampaignContacts.update({
      campaign: campaignSlug,
      slug: {
        $in: contactSlugs
      }
    }, {
      $set: {
        status,
        updatedAt,
        updatedBy
      }
    }, {
      multi: true
    })

    // update campaign contact updatedAt/updatedBy
    Campaigns.update({
      slug: campaignSlug
    }, {
      $set: {
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
