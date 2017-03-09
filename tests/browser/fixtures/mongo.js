
const MongoClient = require('mongodb').MongoClient
const retry = require('promise-retry')

const findCampaign = (db, query) => {
  return retry((retry) => {
    return db.collection('campaigns').findOne(query)
    .then(doc => {
      if (!doc) {
        throw new Error('Could not find doc')
      }

      return doc
    })
    .catch(retry)
  })
}

let mongo

module.exports = (url) => {
  if (mongo) {
    return Promise.resolve(mongo)
  }

  return MongoClient.connect(url)
  .then(db => {
    mongo = {
      connection: db,
      findCampaign: findCampaign.bind(null, db)
    }

    return mongo
  })
}
