import { Meteor } from 'meteor/meteor'
import '/imports/startup/server/accounts'
import '/imports/startup/server/mail-url'
import '/imports/startup/server/migrations'
import '/imports/startup/server/fix-refs'
import '/imports/startup/server/validate'
import '/imports/startup/server/schemas'

if (Meteor.settings && !Meteor.settings.updateContactsFromTwitter) {
  return console.log('NOT sending contacts for twitter lookup. `updateContactsFromTwitter = false`')
}
