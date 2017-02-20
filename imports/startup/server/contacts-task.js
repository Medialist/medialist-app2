import { Meteor } from 'meteor/meteor'
import ContactsTask from '/imports/api/twitter-users/server/contacts-task'

Meteor.startup(() => ContactsTask.periodicallyUpdate())
