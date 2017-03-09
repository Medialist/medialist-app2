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
      console.info('App was running')
      done()
    })
    .on('error', () => {
      console.info('Starting app')
      app()
      .then(app => {
        console.info('Started app')
        server = app

        done()
      })
    })
  },

  after: (done) => {
    if (!server) {
      console.info('App was already running')
      return done()
    }

    console.info('Stopping app')
    server.stop()
    .then(done)
    .catch(done)
  },

  beforeEach: (t, done) => {
    mongo(MONGO_URL)
    .then(mongo => {
      t.db = mongo

      done()
    })
  },

  afterEach: (t, done) => {
    t.db.connection.close()

    done()
  }
}
