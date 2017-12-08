import SimpleSchema from 'simpl-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, AuditSchema, CreatedAtSchema, UserRefSchema, LinkSchema } from '/imports/lib/schema'
import { ClientSchema } from '/imports/api/clients/schema'
import { StatusValues } from '/imports/api/contacts/status'

export const CampaignRefSchema = new SimpleSchema({
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
  clientName: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: Date
  }
})
CampaignRefSchema.extend(IdSchema)

export const CampaignContactRefSchema = new SimpleSchema({
  slug: {
    type: String
  },
  status: {
    type: String,
    allowedValues: StatusValues
  },
  // TODO: this shouls be a post, but that'd be a circlular ref.
  latestPost: {
    type: Object,
    blackbox: true,
    optional: true
  },
  owners: {
    type: Array,
    optional: true
  },
  'owners.$': {
    type: UserRefSchema
  }
})
CampaignContactRefSchema.extend(AuditSchema)

export const CampaignSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  },
  purpose: {
    type: String,
    min: 1,
    optional: true
  },
  slug: {
    type: String,
    denyUpdate: true
  },
  contacts: {
    type: Array
  },
  'contacts.$': {
    type: CampaignContactRefSchema
  },
  client: {
    type: ClientSchema,
    optional: true
  },
  masterLists: {
    type: Array
  },
  'masterLists.$': {
    type: MasterListRefSchema
  },
  tags: {
    type: Array
  },
  'tags.$': {
    type: TagRefSchema
  },
  team: {
    type: Array
  },
  'team.$': {
    type: UserRefSchema
  },
  links: {
    type: Array
  },
  'links.$': {
    type: LinkSchema
  }
})
CampaignSchema.extend(IdSchema)
CampaignSchema.extend(AuditSchema)
CampaignSchema.extend(CreatedAtSchema)

export const CampaignSearchSchema = new SimpleSchema({
  excludeSlugs: {
    type: Array,
    optional: true
  },
  'excludeSlugs.$': {
    type: String
  },
  term: {
    type: String,
    optional: true
  },
  tagSlugs: {
    type: Array,
    optional: true
  },
  'tagSlugs.$': {
    type: String
  },
  masterListSlug: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  contactSlug: {
    type: String,
    optional: true
  },
  minSearchLength: {
    type: Number,
    optional: true
  }
})

export const CampaignSlugsOrSearchSchema = new SimpleSchema({
  campaignSlugs: {
    type: Array,
    optional: true
  },
  'campaignSlugs.$': {
    type: String
  },
  campaignSearch: {
    type: CampaignSearchSchema,
    optional: true,
    custom () {
      if (!this.isSet && !this.field('campaignSlugs').isSet) {
        return SimpleSchema.ErrorTypes.REQUIRED
      }
    }
  }
})
