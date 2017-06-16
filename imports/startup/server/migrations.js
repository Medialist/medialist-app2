import { Meteor } from 'meteor/meteor'
import Embeds from '/imports/api/embeds/embeds'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'

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

        Meteor.users.update({
          _id: user._id
        }, {
          $set: {
            onCampaigns: campaigns
          }
        })
      })
  }
})

// contact.address: 'foo,bar,baz' -> contact.addresses: [{street: 'foo', city: 'bar', 'postcode': 'baz'}]
Migrations.add({
  version: 4,
  name: 'Update contact address format',
  up: () => {
    Contacts.find({})
      .forEach(contact => {
        const {_id, address} = contact
        const addresses = []
        if (address) {
          const lines = address.split(',').map(l => l.trim())
          let [street, city, postcode, country, extra] = lines
          // Some extra data smooshing.
          // Super rough, but greatly improves the hit rate on our current data.
          if (street === 'United Kingdom') {
            country = street
            street = null
          }
          if (country === 'London') {
            street = [street, city, postcode].join(', ')
            city = 'London'
            postcode = extra
            country = 'United Kingdom'
          }
          if (postcode === 'London') {
            street = [street, city].join(', ')
            city = 'London'
            postcode = country
            country = 'United Kingdom'
          }
          addresses.push({street, city, postcode, country})
        }
        Contacts.update(
          {_id},
          {
            $set: {addresses},
            $unset: {address}
          }
        )
      })
  }
})

Migrations.add({
  version: 5,
  name: 'Add imports property to contacts',
  up: () => {
    Contacts.update({}, {$set: {imports: []}}, {multi: true})
  }
})

Migrations.add({
  version: 6,
  name: 'Add update time to campaign contacts',
  up: () => {
    Contacts.find().forEach(contact => {
      const campaigns = {}

      contact.campaigns.forEach(slug => {
        campaigns[slug] = {
          updatedAt: contact.updatedAt
        }
      })

      Contacts.update({
        _id: contact._id
      }, {
        $set: {
          campaigns: campaigns
        }
      })
    })
  }
})

Meteor.startup(() => Migrations.migrateTo('latest'))
