const Ddp = require('ddp')
const login = require('ddp-login')
const faker = require('faker')
const async = require('async')

module.exports = (opts) => (t) => {
  return new Promise((resolve, reject) => {
    const client = new Ddp({
      host: opts.host,
      port: opts.port
    })

    async.auto({
      connect: async.apply(client.connect.bind(client)),
      login: ['connect', (results, callback) => {
        client.call('Authentication/sendLogInLink', [{ email: faker.internet.email(null, null, 'test.medialist.io') }], callback)
      }],
      authenticate: ['login', (results, callback) => {
        login.loginWithToken(client, results.login.token, callback)
      }],
      subscribe: ['authenticate', (results, callback) => {
        async.parallel([
          async.apply(client.subscribe.bind(client), 'campaign', []),
          async.apply(client.subscribe.bind(client), 'clients', []),
          async.apply(client.subscribe.bind(client), 'posts', [])
        ], callback)
      }],
      onboard: ['authenticate', (results, callback) => {
        t.db.connection.collection('users').update({
          _id: results.authenticate.id
        }, {
          $set: {
            'profile.name': faker.name.findName(),
            'profile.avatar': faker.image.imageUrl()
          }
        }, callback)
      }]
    }, (error, results) => {
      if (error) {
        return reject(error)
      }

      resolve({
        client: client,
        userInfo: results.authenticate
      })
    })
  })
}
