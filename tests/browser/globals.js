'use strict'

const http = require('http')
const url = require('url')

const APP_URL = process.env.SELENIUM_LAUNCH_URL || 'http://localhost:3000'
const APP_HOST = url.parse(APP_URL).hostname
const APP_PORT = url.parse(APP_URL).port
const MONGO_URL = process.env.MONGO_URL || `mongodb://${APP_HOST}:3001/meteor`

const app = require('./fixtures/app')
const mongo = require('./fixtures/mongo')
const ddp = require('./fixtures/ddp')({
  host: APP_HOST,
  port: APP_PORT
})

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
    t.db.connection.close(true)

    if (t.currentTest.results.failed > 0 || t.currentTest.results.errors > 0) {
      console.info('')

      t.getLog('browser', (result) => {
        if (!result || !result.forEach) {
          console.error('Could not load browser logs!')
          return
        }

        console.info('Browser logs:')
        console.info('')

        result.forEach(log => {
          console.info(`[${log.level}] ${new Date(log.timestamp)} - ${log.message}`)
        })

        console.info('')
      })
      t.end()
    }

    done()
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
