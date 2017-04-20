import { Meteor } from 'meteor/meteor'
import embeds from '/imports/api/embeds/embeds'
import posts from '/imports/api/posts/posts'

Migrations.add({
  version: 1,
  name: 'Normalise embeds and posts',
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
        console.info(`Updating embed ${embed._id} ${Object.keys(update)}`)

        embeds.update({
          _id: embed._id
        }, {
          $set: update
        })
      }
    })

    posts.find().forEach(post => {
      const update = {}

      if (Array.isArray(post.embed)) {
        const embeds = []
        let updateEmbeds = false

        post.embeds.forEach((embed, index) => {
          embeds[index] = embed

          if (Array.isArray(embed.image)) {
            updateEmbeds = true
            embeds[index].image = embed.image[0]
          }
        })

        if (updateEmbeds) {
          update.embeds = embeds
        }
      }

      if (Object.keys(update).length) {
        console.info(`Updating post ${post._id} ${Object.keys(update)}`)

        posts.update({
          _id: post._id
        }, {
          $set: update
        })
      }
    })
  }
})

Meteor.startup(() => Migrations.migrateTo('latest'))
