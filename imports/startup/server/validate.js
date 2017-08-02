import { Meteor } from 'meteor/meteor'
import Campaigns from '/imports/api/campaigns/campaigns'
import { CampaignSchema } from '/imports/api/campaigns/schema'
import Contacts from '/imports/api/contacts/contacts'
import { ContactSchema } from '/imports/api/contacts/schema'
import Clients from '/imports/api/clients/clients'
import { ClientSchema } from '/imports/api/clients/schema'
import Embeds from '/imports/api/embeds/embeds'
import { EmbedSchema } from '/imports/api/embeds/schema'
import MasterLists from '/imports/api/master-lists/master-lists'
import { MasterListSchema } from '/imports/api/master-lists/schema'
import Orgs from '/imports/api/orgs/orgs'
import { OrgSchema } from '/imports/api/orgs/schema'
import Posts from '/imports/api/posts/posts'
import { PostSchema } from '/imports/api/posts/schema'
import Tags from '/imports/api/tags/tags'
import { TagSchema } from '/imports/api/tags/schema'
import { UserSchema } from '/imports/api/users/schema'

const validate = (name, collection, schema) => {
  const docs = {
    valid: 0,
    invalid: 0
  }

  console.info(`Validating ${name}`)

  collection.find().fetch().forEach(doc => {
    const context = schema.newContext()
    context.validate(doc)

    if (!context.isValid()) {
      docs.invalid++
      console.warn(`${name} ${doc._id} had validation errors: ${JSON.stringify(context.validationErrors(), null, 2)}`)
    } else {
      docs.valid++
    }
  })

  console.info(`${docs.invalid} of ${docs.invalid + docs.valid} ${name} were invalid`)
}

Meteor.startup(() => {
  if (Meteor.settings.validateDatabaseOnStartup) {
    validate('campaigns', Campaigns, CampaignSchema)
    validate('contacts', Contacts, ContactSchema)
    validate('clients', Clients, ClientSchema)
    validate('embeds', Embeds, EmbedSchema)
    validate('master lists', MasterLists, MasterListSchema)
    validate('orgs', Orgs, OrgSchema)
    validate('posts', Posts, PostSchema)
    validate('tags', Tags, TagSchema)
    validate('users', Meteor.users, UserSchema)
  } else {
    console.info('Not validating database docs')
  }
})
