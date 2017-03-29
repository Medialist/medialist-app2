import { Meteor } from 'meteor/meteor'

process.env.MAIL_URL = Meteor.settings.email.mailUrl
