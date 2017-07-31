const domain = require('../fixtures/domain')
const async = require('async')

function findUser (email, callback) {
  this.db.findUser({
    'emails.address': email
  })
  .then((doc) => {
    if (!doc) {
      throw new Error('Could not find user')
    }

    callback(null, doc)
  })
  .catch(error => {
    callback(error)
  })
}

exports.command = function createCampaign (callback) {
  const user = domain.user()

  this.perform((done) => {
    async.waterfall([
      // create user in meteor
      async.apply(this.ddp.client.call.bind(this.ddp.client), 'Authentication/sendLogInLink', [{
        email: user.emails[0].address
      }]),
      (result, callback) => {
        if (!result.token) {
          throw new Error('No token received, is authentication.sendLink set to false in settings.json?')
        }

        return findUser.call(this, user.emails[0].address, callback)
      },
      // update their profile
      (doc, callback) => {
        this.db.connection.collection('users').update({
          _id: doc._id
        }, {
          $set: {
            'profile': user.profile
          }
        }, callback)
      },
      // retrieve the updated user from the database
      (result, callback) => {
        findUser.call(this, user.emails[0].address, callback)
      }
    ], (error, result) => {
      if (error) {
        throw error
      }

      callback(result)
      done()
    })
  })

  return this
}
