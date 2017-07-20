import { Meteor } from 'meteor/meteor'
import attachSchemas from '/imports/lib/attach-schemas.js'

Meteor.startup(() => {
  if (Meteor.settings.attachSchemasToDatabase) {
    // attach schemas after any migrations have run
    attachSchemas()
  } else {
    console.info('Not attaching schemas to database')
  }
})
