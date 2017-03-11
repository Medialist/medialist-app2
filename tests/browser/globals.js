'use strict'

const app = require('./fixtures/app')
const mongo = require('./fixtures/mongo')
const http = require('http')
const APP_URL = 'http://127.0.0.1:3000'
const MONGO_URL = 'mongodb://127.0.0.1:3001/meteor'
let server

module.exports = {
  asyncHookTimeout: 360000,
  waitForConditionTimeout: 30000,

  before: (done) => {
    http.get(APP_URL, result => {
      result.resume()
      done()
    })
    .on('error', () => {
      app()
      .then(app => {
        server = app

        done()
      })
    })
  },

  after: (done) => {
    if (!server) {
      return done()
    }

    server.stop()
    .then(() => {
      done()
    })
    .catch(error => {
      console.error('Could not stop app!', error.stack)
      done(error)
    })
  },

  beforeEach: (t, done) => {
    t.db = mongo(MONGO_URL)

    done()
  },

  afterEach: (t, done) => {
    t.db.connection.close(true, () => {
      done()
    })
  }
}
