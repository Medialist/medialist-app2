import { Meteor } from 'meteor/meteor'
import embeds from '/imports/api/embeds/embeds'

Migrations.add({
  version: 1,
  name: 'Normalise embeds',
  up: () => {
    embeds.find().forEach(embed => {
      const update = {}

      if (Array.isArray(embed.image)) {
        update.image = embed.image[0]
      }

      if (embed.entity && !embed.datePublished) {
        update.datePublished = embed.entity.datePublished
      }

      if (!embed.urls) {
        update.urls = []
      }

      if (Object.keys(update).length) {
        console.info(`Updating ${embed._id} ${Object.keys(update)}`)

        embeds.update({
          _id: embed._id
        }, {
          $set: update
        })
      }
    })
  }
})

Meteor.startup(() => Migrations.migrateTo('latest'))
