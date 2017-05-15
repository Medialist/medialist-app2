import { Meteor } from 'meteor/meteor'
import Embeds from '/imports/api/embeds/embeds'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'

Migrations.add({
  version: 1,
  name: 'Normalise embeds',
  up: () => {
    Embeds.find().forEach(embed => {
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
        Embeds.update({
          _id: embed._id
        }, {
          $set: update
        })
      }
    })
  }
})

Migrations.add({
  version: 2,
  name: 'Normalise post embeds',
  up: () => {
    Posts.find().forEach(post => {
      const update = {}

      if (Array.isArray(post.embeds)) {
        update.embeds = post.embeds.map(embed => Embeds.toRef(Embeds.findOne({_id: embed._id})))
      }

      if (Object.keys(update).length) {
        Posts.update({
          _id: post._id
        }, {
          $set: update
        })
      }
    })
  }
})

Migrations.add({
  version: 3,
  name: 'Add campaign counts to users',
  up: () => {
    Meteor.users.find()
      .forEach(user => {
        const campaigns = Campaigns.find({
          'team._id': user._id
        }).fetch().length

        Meteor.users.update(user._id, {
          onCampaigns: campaigns
        })
      })
  }
})

Meteor.startup(() => Migrations.migrateTo('latest'))
