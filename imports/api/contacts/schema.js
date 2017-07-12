import SimpleSchema from 'simpl-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, LabelValueSchema, AuditSchema, CreatedAtSchema } from '/imports/lib/schema'

export const ContactRefSchema = new SimpleSchema({
  slug: {
    type: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  outlets: {
    type: Array,
    defaultValue: []
  },
  'outlets.$': {
    type: LabelValueSchema
  },
  updatedAt: {
    type: Date
  }
})
ContactRefSchema.extend(IdSchema)

export const SocialSchema = new SimpleSchema({
  label: {
    type: String
  },
  value: {
    type: String,
    optional: true
  },
  twitterId: {
    type: String,
    optional: true
  }
})

export const AddressSchema = new SimpleSchema({
  street: {
    type: String,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  postcode: {
    type: String,
    optional: true
  },
  country: {
    type: String,
    optional: true
  }
})

export const ContactCreateSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  outlets: {
    type: Array,
    defaultValue: []
  },
  'outlets.$': {
    type: LabelValueSchema
  },
  emails: {
    type: Array,
    defaultValue: []
  },
  'emails.$': {
    type: LabelValueSchema
  },
  phones: {
    type: Array,
    defaultValue: []
  },
  'phones.$': {
    type: LabelValueSchema
  },
  bio: {
    type: String,
    optional: true
  },
  // TODO: Refactor the socials schema to allow for twitterId or other properties
  socials: {
    type: Array,
    defaultValue: []
  },
  'socials.$': {
    type: SocialSchema
  },
  addresses: {
    type: Array,
    autoValue: function () {
      if (!this.value) {
        return []
      }

      return this.value.filter(address => {
        let allEmpty = true

        for (var key in address) {
          if (address[key]) {
            allEmpty = false
          }
        }

        return !allEmpty
      })
    }
  },
  'addresses.$': {
    type: AddressSchema
  }
})

export const ContactCampaignSchema = new SimpleSchema({
  updatedAt: {
    type: Date
  }
})

export const ContactSchema = new SimpleSchema({
  slug: {
    type: String,
    min: 1
  },
  // References to other collections
  campaigns: {
    type: Object,
    defaultValue: {},
    blackbox: true,
    custom: function () {
      // ugh https://github.com/aldeed/meteor-simple-schema/issues/244
      Object.keys(this.value).forEach(key => {
        const context = ContactCampaignSchema.newContext()
        context.validate(this.value[key])

        if (!context.isValid()) {
          throw context.validationErrors().pop()
        }
      })
    }
  },
  masterLists: {
    type: Array,
    defaultValue: []
  },
  'masterLists.$': {
    type: MasterListRefSchema
  },
  tags: {
    type: Array,
    defaultValue: []
  },
  'tags.$': {
    type: TagRefSchema
  },
  imports: {
    type: Array,
    defaultValue: []
  },
  'imports.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
})
ContactSchema.extend(IdSchema)
ContactSchema.extend(AuditSchema)
ContactSchema.extend(CreatedAtSchema)
ContactSchema.extend(ContactCreateSchema)
