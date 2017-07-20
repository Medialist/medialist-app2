import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { TypeSchema } from '/imports/lib/schema'
import Tags from '/imports/api/tags/tags'

// Gotta function as meteor needs to noodle with `this`
Meteor.publish('tags', function (props) {
  if (!this.userId) {
    return this.ready()
  }

  const schema = new SimpleSchema({
    searchTerm: {
      type: String, optional: true
    }
  })
  schema.extend(TypeSchema)

  const context = schema.newContext()
  context.validate(props)

  if (!context.isValid()) {
    throw new Error('props were not valid')
  }

  const { type, searchTerm } = props

  return Tags.suggest({
    type,
    userId: this.userId,
    searchTerm
  })
})

Meteor.publish('tags-by-slug', function ({tagSlugs}) {
  if (!this.userId) {
    return this.ready()
  }

  return Tags.find({
    slug: {
      $in: tagSlugs
    }
  })
})
