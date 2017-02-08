import { Meteor } from 'meteor/meteor'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TypeSchema } from '/imports/lib/schema'
import Tags from './tags'

// Gotta function as meteor needs to noodle with `this`
Meteor.publish('tags', function (props) {
  if (!this.userId) return this.ready()

  new SimpleSchema([
    TypeSchema,
    { searchTerm: { type: String, optional: true } }
  ]).validate(props)

  const { type, searchTerm } = props
  return Tags.suggest({type, userId: this.userId, searchTerm})
})
