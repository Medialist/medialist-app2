import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TypeSchema } from '/imports/lib/schema'
import Tags from '/imports/api/tags/tags'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { checkAllSlugsExist, cleanSlug } from '/imports/lib/slug'
import { findOneUserRef } from '/imports/api/users/users'

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
        createdBy: findOneUserRef(userId)
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

const setTaggedItems = (userId, _id, tags, Collection, countField) => {
  const item = Collection.findOne({_id: _id}, {tags: 1})

  if (!item) {
    return
  }

  const existingTags = item.tags

  Collection.update({
    _id: _id
  }, {
    $set: {
      tags: tags,
      updatedAt: new Date()
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
  name: 'Tags/batchAddTags',

  validate: new SimpleSchema([
    TypeSchema, {
      type: {
        type: String,
        allowedValues: ['Contacts', 'Campaigns']
      },
      // Contact or Campaign slugs depending on type.
      slugs: {
        type: [String],
        min: 1
      },
      // Tag names, may be new or existing
      names: {
        type: [String],
        min: 1
      }
    }
  ]).validator(),

  run ({ type, slugs, names }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const countField = `${type.toLowerCase()}Count`
    const Collection = type === 'Contacts' ? Contacts : Campaigns

    checkAllSlugsExist(slugs, Collection)

    const tags = createTagsWhereNecessary(this.userId, names, type)

    tags
      .forEach((tag) => updateTaggedItems(this.userId, Collection, countField, slugs, tag))
  }
})

export const setTags = new ValidatedMethod({
  name: 'Tags/set',

  validate: new SimpleSchema([
    TypeSchema, {
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
        type: [String],
        min: 1
      }
    }
  ]).validator(),

  run ({ type, _id, tags }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const countField = `${type.toLowerCase()}Count`
    const Collection = type === 'Contacts' ? Contacts : Campaigns

    setTaggedItems(this.userId, _id, createTagsWhereNecessary(this.userId, tags, type), Collection, countField
    )
  }
})
