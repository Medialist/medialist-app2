import { Meteor } from 'meteor/meteor'

export const cleanSlug = function (name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '')
}

export const uniqueSlug = function (slug, collection) {
  let newSlug = slug
  let suffix = 1
  while (collection.find({ slug: newSlug }).count()) {
    newSlug = slug + suffix.toString()
    suffix += 1
  }
  return newSlug
}

/*
 * Create a machine friendly slug from a name.
 * Ensure it's unique in a given collection.
 * Add a number on the end until it is unique.
 */
export default function (name, collection) {
  const slug = cleanSlug(name)
  return uniqueSlug(slug, collection)
}

export function checkAllSlugsExist (slugs, Collection) {
  const count = Collection.find({deleted: null, slug: {$in: slugs}}).count()

  if (count === slugs.length) {
    return
  }

  // Figure out which for better error reporting.
  const foundSlugs = Collection
    .find({deleted: null, slug: {$in: slugs}})
    .map((i) => i.slug)

  const missingSlugs = slugs.filter((s) => foundSlugs.indexOf(s) < 0)

  throw new Meteor.Error(`${Collection._name} ${missingSlugs.join(', ')} could not be found'`)
}
