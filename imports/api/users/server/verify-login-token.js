import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const verifyLoginToken = (token) => {
  const user = Meteor.users.findOne({
    'services.email.verificationTokens.token': token
  })

  if (!user) {
    console.warn('Token did not exist')

    throw new Meteor.Error('INVALID_TOKEN')
  }

  const tokenRecord = user.services.email.verificationTokens.find(verificationToken => verificationToken.token === token)
  const oldestValidTokenDate = Date.now() - Meteor.settings.authentication.tokenLife
  const expired = tokenRecord.when.getTime() < oldestValidTokenDate

  if (expired) {
    console.warn('Token has expired')

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

  // mark email verified
  Accounts.addEmail(user._id, tokenRecord.address, true)

  const stampedLoginToken = Accounts._generateStampedLoginToken()
  Accounts._insertLoginToken(user._id, stampedLoginToken)

  return stampedLoginToken
}

export default verifyLoginToken
