import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const verifyLoginToken = (token) => {
  const user = Meteor.users.findOne({
    'services.email.verificationTokens.token': token
  })

  if (!user) {
    throw new Meteor.Error('INVALID_TOKEN')
  }

  const tokenRecord = user.services.email.verificationTokens.find(verificationToken => verificationToken.token === token)

  if (!tokenRecord) {
    throw new Meteor.Error('INVALID_TOKEN')
  }

  const tooOld = Date.now() - Meteor.settings.authentication.token_life
  const expired = tokenRecord.when.getTime() < tooOld

  if (expired) {
    Meteor.users.update({
      _id: user._id
    }, {
      $pull: {
        'services.email.verificationTokens': {
          address: tokenRecord.address
        }
      }
    })

    throw new Meteor.Error('INVALID_TOKEN')
  }

  const stampedLoginToken = Accounts._generateStampedLoginToken()
  Accounts._insertLoginToken(user._id, stampedLoginToken)

  return stampedLoginToken
}

export default verifyLoginToken
