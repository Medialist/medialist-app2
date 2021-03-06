import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Tags from '/imports/api/tags/tags'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { checkAllSlugsExist, cleanSlug } from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import { ContactSlugsOrSearchSchema } from '/imports/api/contacts/schema'
import { findOrValidateContactSlugs } from '/imports/api/contacts/queries'
import { findOrValidateCampaignSlugs } from '/imports/api/campaigns/queries'
import { CampaignSlugsOrSearchSchema } from '/imports/api/campaigns/schema'

const createTagsWhereNecessary = (userId, names, type) => {
  const tags = names.map((n) => ({
    name: n,
    slug: cleanSlug(n)
  }))

  const tagSlugs = tags.map((t) => t.slug)

  // find all existing tags
  const existingTags = Tags[`findRefsFor${type}`]({tagSlugs})

  // insert missing tags
  tags
    .filter((t1) => !existingTags.find((t2) => t2.slug === t1.slug))
    .map((tag) => (
      Object.assign(tag, {
        contactsCount: 0,
        campaignsCount: 0,
        createdBy: findOneUserRef(userId),
        createdAt: new Date()
      })
    ))
    .map((tag) => Tags.insert(tag))

  return Tags[`findRefsFor${type}`]({tagSlugs})
}

const updateTaggedItems = (userId, Collection, countField, slugs, tag) => {
  // Add tags to contacts / campaigns.
  // Returns number of contacts modfied.
  const added = Collection.update({
    slug: {
      $in: slugs
    },
    'tags.slug': {
      $ne: tag.slug
    }
  }, {
    $push: {
      tags: tag
    }
  }, {
    multi: true
  })

  // Update counts
  Collection.update({
    'tags.slug': tag.slug
  }, {
    $inc: {
      'tags.$.count': added
    }
  }, {
    multi: true
  })

  // Update counts on tags
  Tags.update({
    slug: tag.slug
  }, {
    $inc: {
      [countField]: added
    }
  }, {
    multi: true
  })
}

const setTaggedItems = (userId, item, tags, Collection, countField) => {
  const existingTags = item.tags

  Collection.update({
    _id: item._id
  }, {
    $set: {
      tags: tags
    }
  })

  const removedTags = existingTags
    .filter(t1 => !tags.find(t2 => t1.slug === t2.slug))
  const addedTags = tags
    .filter(t1 => !existingTags.find(t2 => t1.slug === t2.slug))

  removedTags
  .forEach(tag => {
    // Update counts on contacts/campaigns
    Collection.update({
      'tags.slug': tag.slug
    }, {
      $inc: {
        'tags.$.count': -1
      }
    }, {
      multi: true
    })

    // Update counts on tags
    Tags.update({
      slug: tag.slug
    }, {
      $inc: {
        [countField]: -1
      }
    }, {
      multi: true
    })
  })

  addedTags
    .forEach(tag => {
      // Update counts on contacts/campaigns
      Collection.update({
        'tags.slug': tag.slug
      }, {
        $inc: {
          'tags.$.count': 1
        }
      }, {
        multi: true
      })

      // Update counts on tags
      Tags.update({
        slug: tag.slug
      }, {
        $inc: {
          [countField]: 1
        }
      }, {
        multi: true
      })
    })
}

/*
 * Add tags to a batch of entities.
 * Create new tags for ones that don't exist.
 */
export const batchAddTags = new ValidatedMethod({
  name: 'batchAddTags',

  validate: new SimpleSchema({
    type: {
      type: String,
      allowedValues: ['Contacts', 'Campaigns']
    },
    // Contact or Campaign slugs depending on type.
    slugs: {
      type: Array,
      min: 1
    },
    'slugs.$': {
      type: String
    },
    // Tag names, may be new or existing
    names: {
      type: Array,
      min: 1
    },
    'names.$': {
      type: String
    }
  }).validator(),

  run ({ type, slugs, names }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const countField = `${type.toLowerCase()}Count`
    const Collection = type === 'Contacts' ? Contacts : Campaigns

    checkAllSlugsExist(slugs, Collection)

    const tags = createTagsWhereNecessary(this.userId, names, type)

    tags
      .forEach((tag) => updateTaggedItems(this.userId, Collection, countField, slugs, tag))

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: type === 'Campaigns' ? slugs : [],
      contactSlugs: type === 'Contacts' ? slugs : []
    })

    return { slugCount: slugs.length, tagCount: tags.length }
  }
})

export const batchAddTagsToContacts = new ValidatedMethod({
  name: 'batchAddTagsToContacts',

  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    names: {
      type: Array,
      min: 1
    },
    'names.$': {
      type: String
    }
  }).extend(ContactSlugsOrSearchSchema).validator(),

  run ({names, ...searchOrSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateContactSlugs(searchOrSlugs)

    return batchAddTags.run.call(this, {
      type: 'Contacts',
      slugs,
      names
    })
  }
})

export const batchAddTagsToCampaigns = new ValidatedMethod({
  name: 'batchAddTagsToCampaigns',

  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    names: {
      type: Array,
      min: 1
    },
    'names.$': {
      type: String
    }
  }).extend(CampaignSlugsOrSearchSchema).validator(),

  run ({names, ...searchOrSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateCampaignSlugs(searchOrSlugs)

    return batchAddTags.run.call(this, {
      type: 'Campaigns',
      slugs,
      names
    })
  }
})

export const setTags = new ValidatedMethod({
  name: 'Tags/set',

  validate: new SimpleSchema({
    type: {
      type: String,
      allowedValues: ['Contacts', 'Campaigns']
    },
    // Contact or Campaign slugs depending on type.
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    // Tag names, may be new or existing
    tags: {
      type: Array,
      min: 1
    },
    'tags.$': {
      type: String
    }
  }).validator(),

  run ({ type, _id, tags }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const countField = `${type.toLowerCase()}Count`
    const Collection = type === 'Contacts' ? Contacts : Campaigns

    const item = Collection.findOne({_id: _id}, {tags: 1})

    if (!item) {
      return
    }

    setTaggedItems(this.userId, item, createTagsWhereNecessary(this.userId, tags, type), Collection, countField)

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: type === 'Campaigns' ? [item.slug] : [],
      contactSlugs: type === 'Contacts' ? [item.slug] : []
    })
  }
})
