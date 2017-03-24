import { Meteor } from 'meteor/meteor'

process.env.MAIL_URL = `smtp://${Meteor.settings.email.smtp.user}:${Meteor.settings.email.smtp.password}@${Meteor.settings.email.smtp.host}:${Meteor.settings.email.smtp.port}`
