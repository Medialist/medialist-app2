import { Meteor } from 'meteor/meteor'
import attachSchemas from '/imports/lib/attach-schemas.js'

Meteor.startup(() => {
  if (Meteor.settings.public.attachSchemasToDatabase) {
    // attach schemas after any migrations have run
    attachSchemas()
  }
})
