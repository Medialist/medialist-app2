import { Meteor } from 'meteor/meteor'
import ContactsTask from '/imports/api/twitter-users/server/contacts-task'

Meteor.startup(() => {
  if (Meteor.settings.updateContactsFromTwitter) {
    ContactsTask.periodicallyUpdate()
  } else {
    console.info('Not updating contacts from twitter')
  }
})
