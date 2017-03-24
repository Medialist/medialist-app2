import { Meteor } from 'meteor/meteor'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

let sendLoginLinkImplementation = () => {}
let verifyLoginTokenImplementation = () => {}

if (Meteor.isServer) {
  sendLoginLinkImplementation = require('./server/send-login-link').default
  verifyLoginTokenImplementation = require('./server/verify-login-token').default
}

export const sendLogInLink = new ValidatedMethod({
  name: 'Authentication/sendLogInLink',
  validate: new SimpleSchema({
    email: {
      type: String
    }
  }).validator(),
  run ({ email }) {
    if (this.isSimulation) {
      return
    }

    return sendLoginLinkImplementation(email)
  }
})

export const verifyLoginToken = new ValidatedMethod({
  name: 'Authentication/verifyLoginToken',
  validate: new SimpleSchema({
    token: {
      type: String
    }
  }).validator(),
  run ({ token }) {
    if (this.isSimulation) {
      return
    }

    return verifyLoginTokenImplementation(token)
  }
})
