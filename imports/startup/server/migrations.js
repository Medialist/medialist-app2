import { Meteor } from 'meteor/meteor'
import './migrations/old'

Migrations.add({
  version: 12,
  ...require('./migrations/rescrape-embeds').default
})

Migrations.add({
  version: 13,
  ...require('./migrations/add-activity-to-campaign-contact').default
})

Meteor.startup(() => Migrations.migrateTo('latest'))
