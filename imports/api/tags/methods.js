import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TypeSchema } from '/imports/lib/schema'
import Tags from './tags'
import Contacts from '../contacts/contacts'
import Campaigns from '../medialists/medialists'
import { checkAllSlugsExist, cleanSlug } from '/imports/lib/slug'

/*
 * Add tags to a batch of entities.
 * Create new tags for ones that don't exist.
 */
export const batchAddTags = new ValidatedMethod({
  name: 'Tags/batchAddTags',

  validate: new SimpleSchema([
    TypeSchema,
    {
      // Contact or Campaign slugs depending on type.
      slugs: { type: [String], min: 1 },
      // Tag names, may be new or existing
      names: { type: [String], min: 1 }
    }
  ]).validator(),

  run ({ type, slugs, names }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const countField = `${type.toLowerCase()}Count`
    const Collection = type === 'Contacts' ? Contacts : Campaigns
    checkAllSlugsExist(slugs, Collection)

    const tags = names.map((n) => ({
      name: n,
      slug: cleanSlug(n)
    }))
    const tagSlugs = tags.map((t) => t.slug)
    const existingTags = Tags.find({ slug: { $in: tagSlugs } }).fetch()
    const newTags = tags
      .filter((t1) => !existingTags.find((t2) => t2.slug === t1.slug))
      .map((t) => (Object.assign(t, {
        contactsCount: 0,
        campaignsCount: 0,
        users: {}
      })))

    // insert missing tags
    newTags
      .forEach((t) => Tags.insert(t))

    // Update contacts with tags where missing.
    return existingTags
      .concat(newTags)
      .map((t) => {
        const tag = {
          name: t.name,
          slug: t.slug,
          count: t[countField]
        }
        // Add tags to contacts / campaigns.
        // Returns number of contacts modfied.
        const updated = Collection.update(
          {
            slug: { $in: slugs },
            'tags.slug': { $ne: t.slug }
          },
          { $push: { tags: tag } },
          { multi: true }
        )
        // Update counts
        Collection.update(
          { 'tags.slug': t.slug },
          { $inc: {
            'tags.$.count': updated
          }},
          { multi: true }
        )
        // Update counts and users on tags
        Tags.update(
          { slug: t.slug },
          {
            $inc: {
              [countField]: updated,
              [`users.${this.userId}`]: 1
            }
          },
          { multi: true }
        )
      })
  }
})

/*
 * Update tag property for a single entity.
 * Adds, removes and creates new tags to make it so.
 */
export const setTags = new ValidatedMethod({
  name: 'Tags/setTags',

  validate: new SimpleSchema([
    TypeSchema,
    {
      slugs: { type: [String], min: 1 },
      name: { type: String, min: 1 }
    }
  ]).validator(),

  run ({ name }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    throw new Meteor.Error('TODO: implement')
  }
})
