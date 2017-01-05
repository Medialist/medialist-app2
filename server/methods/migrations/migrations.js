var Migrations = new Mongo.Collection('tableflip_migrations')

var MigrationVersions = [
  {
    number: 0,
    instructions () {
      // Make sure there are no moments actually in the DB
      ;[Orgs, Clients, Contacts, Medialists, Posts].forEach(Collection => {
        Collection.find({}).forEach(doc => {
          if (removeMoments(doc)) Collection.update(doc._id, doc)
        })
      })
    }
  },

  {
    number: 1,
    instructions () {
      // Contacts migration to update roles.org with reference to org doc (which is added if required)
      Contacts.find({}).forEach(contact => {
        _.forEach(contact.roles, role => {
          if (typeof role.org !== 'string') return
          var orgName = role.org
          role.org = { name: orgName }
          var org = Orgs.findOne({ name: role.org.name })
          if (org) {
           role.org._id = org._id
          } else {
           role.org._id = Orgs.insert({ name: role.org.name })
          }
        })
        Contacts.update(contact._id, contact)
      })
    }
  },

  {
    number: 2,
    instructions () {
      // Contacts migration to update createdBy to object with _id and slug if it is just a slug string
      Contacts.find({}).forEach(contact => {
        if (typeof contact.createdBy !== 'string') return
        var newCreatedBy = { _id: contact.createdBy }
        var user = Meteor.users.findOne(contact.createdBy)
        newCreatedBy.name = user.profile.name
        contact.createdBy = newCreatedBy
        Contacts.update(contact._id, contact)
      })
    }
  },

  {
    number: 3,
    instructions () {
      // Posts migration to update contacts info in post to be an object with slug and name if it is just a slug string
      Posts.find({}).forEach(post => {
        var newContacts = post.contacts.reduce((memo, contact) => {
          if (typeof contact !== 'string') {
            memo.push(contact)
            return memo
          }
          var contactObj = Contacts.findOne({ slug: contact })
          if (!contactObj) return memo
          memo.push({
            slug: contactObj.slug,
            name: contactObj.name
          })
          return memo
        }, [])
        post.contacts = newContacts
        Posts.update(post._id, post)
      })
    }
  },

  {
    number: 4,
    instructions () {
      // Posts migration to add type: 'feedback' to any post with no type field
      Posts.find({}).forEach(post => {
        if (!post.type) {
          post.type = 'feedback'
          Posts.update(post._id, post)
        }
      })
    }
  },

  {
    number: 5,
    instructions () {
      // Clients migration to update medialist client to be an object with _id and name (added to Clients collection if required) where they are just a slug string
      Medialists.find({}).forEach(medialist => {
        if (typeof medialist.client === 'string') {
          var client = Clients.findOne({ name: medialist.client })
          var newClient = { name: medialist.client }
          if (client) {
           newClient._id = client._id
          } else {
           newClient._id = Clients.insert({ name: medialist.client })
          }
          medialist.client = newClient
          Medialists.update(medialist._id, medialist)
        }
      })
    }
  },

  {
    number: 7,
    instructions () {
      // Posts migration to add createdBy avatars
      Posts.find({}).forEach(post => {
        if (!post.createdBy.avatar) {
          var user = Meteor.users.findOne(post.createdBy._id)
          if (user) {
            post.createdBy.avatar = user.services.twitter.profile_image_url_https
            Posts.update(post._id, post)
          }
        }
      })
    }
  },

  {
    number: 8,
    instructions () {
      // Posts migration to add contacts avatars
      Posts.find({}).forEach(post => {
        var newContacts = post.contacts.map(contact => {
          if (!contact.avatar) {
            var thisContact = Contacts.findOne({ slug: contact.slug })
            if (thisContact) contact.avatar = thisContact.avatar
          }
          return contact
        })
        post.contacts = newContacts
        Posts.update(post._id, post)
      })
    }
  },

  {
    number: 9,
    instructions () {
      // Replaces contact details based on new schema
      Contacts.find({}).forEach(contact => {
        // Check contact has not already been transformed
        if (contact.socials) return
        var newContact = _.extend({}, contact, {
          emails: contact.roles.reduce((emails, role) => {
            if (role.email) emails.push({
              label: role.org.name,
              value: role.email
            })
            return emails
          }, []),
          phones: contact.roles.reduce((phones, role) => {
            return phones.concat(role.phones.map(phone => {
              return {
                label: phone.type,
                value: phone.number
              }
            }))
          }, []),
          socials: [{
            label: 'Twitter',
            value: contact.twitter.screenName,
            id: contact.twitter.id
          }],
          primaryOutlets: contact.roles.map( r => r.org.name ).join(', '),
          jobTitles: contact.roles.map( r => r.title ).join(', '),
          sectors: '',
          languages: ['English'],
        })
        if (!newContact.updatedAt) {
          newContact.updatedAt = newContact.createdAt
          newContact.updatedBy = newContact.createdBy
        }
        if (!newContact.updatedBy.avatar) newContact.updatedBy.avatar = ''
        if (!newContact.createdBy.avatar) newContact.createdBy.avatar = ''
        delete newContact.twitter
        delete newContact.roles

        check(_.omit(newContact, '_id'), Schemas.Contacts)
        Contacts.update(contact._id, newContact)
      })
    }
  },

  {
    number: 11,
    instructions () {
      // Updates id to twitterId in socials objects
      Contacts.find({}).forEach(contact => {
        var save = false
        contact.socials.forEach(social => {
          if (social.label === 'Twitter' && social.id) {
            social.twitterId = social.id
            delete social.id
            save = true
          }
        })
        if (save) Contacts.update(contact._id, contact)
      })
    }
  },

  {
    number: 12,
    instructions () {
      // Adds a medialist array to user docs
      Meteor.users.find({}).forEach(user => {
        if (!user.medialists) {
          Meteor.users.update(user._id, { $set: { 'profile.medialists': [] } })
        }
      })
    }
  }
]

Meteor.methods({
  'migrations/run': function () {
    checkMigrator(this.userId)
    var migrationsRun = []
    MigrationVersions.forEach(migration => {
      if (Migrations.find({ version: migration.number }).count()) return
      if (migration.instructions) migration.instructions()
      Migrations.insert({ version: migration.number })
      migrationsRun.push(migration.number)
    })
    if (migrationsRun.length) {
      console.log(`Successfully ran ${migrationsRun.length} migrations: `, migrationsRun.map(v => `v${v}`))
    } else {
      console.log('No unprocessed migrations found to run.')
    }
    return migrationsRun
  },
  'migrations/check': function () {
    console.log('Checking docs...')
    var failedDocs = []
    ;['Orgs', 'Clients', 'Contacts', 'Medialists', 'Posts'].forEach(collection => {
      var Collection = global[collection]
      var validator = Schemas[collection].namedContext('validator');
      Collection.find().forEach(doc => {
        if (!validator.validate(_.omit(doc, '_id'))) {
          var invalidKeys = validator.invalidKeys()
          invalidKeys = invalidKeys.reduce(function (newInvalidKeys, key) {
            if (key.type !== 'expectedConstructor' || typeof key.value !== 'object' || !key.value._isAMomentObject) {
              newInvalidKeys.push(key)
            }
            return newInvalidKeys
          }, [])
          if (!invalidKeys.length) return
          console.log(collection, invalidKeys)
          failedDocs.push({
            collection,
            doc: doc._id,
            invalidKeys: invalidKeys
          })
        }
      })
    })
    console.log('Finished running checks')
    return failedDocs
  }
})

function checkMigrator (userId) {
  if (!userId) throw new Meteor.Error('Only a logged-in user can run migrations')
  var user = Meteor.users.findOne(userId)
  var whitelist = Meteor.settings && Meteor.settings.migrations.whitelist
  if (whitelist.indexOf(user.services.twitter.screenName) === -1) throw new Meteor.Error('Only a whitelisted user can run migrations')
}

function removeMoments (doc) {
  return _.reduce(doc, (isAltered, val, key) => {
    if (val && val._isAMomentObject) {
      doc[key] = moment(val).toDate()
      return true
    }
    if (typeof val === 'object') {
      return removeMoments(val)
    }
    return isAltered
  }, false)
}
