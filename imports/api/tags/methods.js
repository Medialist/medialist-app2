import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TypeSchema } from '/imports/lib/schema'
import Tags from './tags'
import Contacts from '../contacts/contacts'
import Campaigns from '../campaigns/campaigns'
import { checkAllSlugsExist, cleanSlug } from '/imports/lib/slug'

const createTagsWhereNecessary = (names) => {
  const tags = names.map((n) => ({
    name: n,
    slug: cleanSlug(n)
  }))

  const tagSlugs = tags.map((t) => t.slug)

  // find all existing tags
  const existingTags = Tags.find({
    slug: {
      $in: tagSlugs
    }
  }).fetch()

  // find any new tags
  const newTags = tags
    .filter((t1) => !existingTags.find((t2) => t2.slug === t1.slug))
    .map((t) => (
      Object.assign(t, {
        contactsCount: 0,
        campaignsCount: 0,
        users: {}
      })
    ))

  // insert missing tags
  newTags
    .forEach((t) => Tags.insert(t))

  return existingTags.concat(newTags)
}

const updateTaggedItems = (userId, Collection, countField, slugs, t) => {
  const now = new Date()

  const tag = {
    name: t.name,
    slug: t.slug,
    count: t[countField]
  }

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
    },
    $set: {
      updatedAt: now
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

  // Update counts and users on tags
  Tags.update({
    slug: t.slug
  }, {
    $inc: {
      [countField]: added,
      [`users.${userId}`]: 1
    }
  }, {
    multi: true
  })
}

const setTaggedItems = (userId, _id, tags, Collection, countField) => {
  Collection.update({
    _id: _id
  }, {
    $set: {
      tags: tags,
      updatedAt: new Date()
    }
  })

  tags.forEach(tag => {
    const count = Collection.find({
      'tags.slug': tag.slug
    }).count()

    // Update counts
    Collection.update({
      'tags.slug': tag.slug
    }, {
      $inc: {
        'tags.$.count': count
      }
    }, {
      multi: true
    })

    // Update counts and users on tags
    Tags.update({
      slug: tag.slug
    }, {
      $inc: {
        [countField]: count,
        [`users.${userId}`]: 1
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

    const tags = createTagsWhereNecessary(names)

    tags
      .forEach((t) => updateTaggedItems(this.userId, Collection, countField, slugs, t))
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

    setTaggedItems(this.userId, _id, createTagsWhereNecessary(tags)
      // Update Collection with tags where missing.
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        count: t[countField]
      })), Collection, countField
    )
  }
})
