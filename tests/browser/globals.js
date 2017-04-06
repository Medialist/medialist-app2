'use strict'

const app = require('./fixtures/app')
const mongo = require('./fixtures/mongo')
const ddp = require('./fixtures/ddp')
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
  },

  beforeEach: (t, done) => {
    t.db = mongo(MONGO_URL)

    ddp(t)
    .then(ddp => {
      t.ddp = ddp
      done()
    })
  },

  afterEach: (t, done) => {
    t.ddp.client.close()
    t.db.connection.close(true, () => {
      done()
    })
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error)

  if (process.listenerCount('uncaughtException') === 1) {
    throw error
  }
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection', error)

  if (process.listenerCount('unhandledRejection') === 1) {
    throw error
  }
})
