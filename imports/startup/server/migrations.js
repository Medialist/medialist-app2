import { Meteor } from 'meteor/meteor'
import Embeds from '/imports/api/embeds/embeds'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Tags from '/imports/api/tags/tags'
import { EmbedSchema } from '/imports/api/embeds/schema'

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

Migrations.add({
  version: 7,
  name: 'Make existing documents conform to schema',
  up: () => {
    console.info('Updating campaigns')
    Campaigns.find().fetch().forEach(campaign => {
      const set = {
        tags: Tags.findRefsForCampaigns({ tagSlugs: (campaign.tags || []).map(t => t.slug).filter(s => !!s) })
      }

      Campaigns.update({
        _id: campaign._id
      }, {
        $set: set
      })
    })

    console.info('Updating contacts')
    Contacts.find().fetch().forEach(contact => {
      const set = {
        tags: Tags.findRefsForContacts({ tagSlugs: (contact.tags || []).map(t => t.slug).filter(s => !!s) })
      }

      Contacts.update({
        _id: contact._id
      }, {
        $set: set
      })
    })

    console.info('Updating embeds')
    Embeds.find().fetch().forEach(embed => {
      const _id = embed._id

      EmbedSchema.clean(embed)
      delete embed._id
      delete embed.createdAt
      delete embed.createdBy
      delete embed.updatedAt

      Embeds.update({
        _id
      }, {
        $set: embed
      })
    })

    console.info('Updating posts')
    Posts.find().fetch().forEach(post => {
      const set = {
        embeds: (post.embeds || []).map(e => Embeds.findOneEmbedRefForUrl(e.url)).filter(e => !!e),
        contacts: Contacts.findRefs({contactSlugs: (post.contacts || []).map(c => c.slug)}),
        campaigns: Campaigns.findRefs({campaignSlugs: (post.campaigns || []).map(c => c.slug)})
      }

      Posts.update({
        _id: post._id
      }, {
        $set: set
      })
    })

    console.info('Updating users')
    Meteor.users.find().fetch().forEach(user => {
      const set = {
        myCampaigns: user.myCampaigns || [],
        myContacts: user.myContacts || []
      }

      set.myCampaigns = set.myCampaigns
        .map(campaign => {
          if (campaign._id) {
            return campaign
          }

          if (campaign.slug) {
            return Campaigns.findRefs({campaignSlugs: [campaign.slug]})[0]
          }
        })
        .filter(campaign => !!campaign)

      set.myContacts = set.myContacts
        .map(contact => {
          if (contact._id) {
            return contact
          }

          if (contact.slug) {
            return Contacts.findRefs({contactSlugs: [contact.slug]})[0]
          }
        })
        .filter(contact => !!contact)

      Meteor.users.update(user._id, {
        $set: set
      })
    })
  }
})

Migrations.add({
  version: 8,
  name: 'Add recent campaign and contact lists to users',
  up: () => {
    Meteor.users.find()
      .forEach(user => {
        Meteor.users.update({
          _id: user._id
        }, {
          $set: {
            recentCampaignLists: Array.isArray(user.recentCampaignLists) ? user.recentCampaigns : [],
            recentContactLists: Array.isArray(user.recentContactLists) ? user.recentContacts : []
          }
        })
      })
  }
})

Meteor.startup(() => Migrations.migrateTo('latest'))
