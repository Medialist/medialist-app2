import SimpleSchema from 'simpl-schema'
import { CampaignRefSchema } from '/imports/api/campaigns/schema'
import { ContactRefSchema } from '/imports/api/contacts/schema'
import { IdSchema } from '/imports/lib/schema'

export const UserProfileSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
})

export const UserSchema = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
  },
  'emails.$': {
    type: Object
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean,
    optional: true
  },
  registered_emails: {
    type: Array,
    optional: true
  },
  'registered_emails.$': {
    type: Object,
    blackbox: true
  },
  createdAt: {
    type: Date,
    denyUpdate: true
  },
  profile: {
    type: UserProfileSchema,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  heartbeat: {
    type: Date,
    optional: true
  },
  myContacts: {
    type: Array,
    optional: true
  },
  'myContacts.$': {
    type: ContactRefSchema
  },
  myCampaigns: {
    type: Array,
    optional: true
  },
  'myCampaigns.$': {
    type: CampaignRefSchema
  },
  onCampaigns: {
    type: Number,
    min: 0,
    optional: true
  },
  recentCampaignLists: {
    type: Array,
    optional: true
  },
  'recentCampaignLists.$': {
    type: String
  },
  recentContactLists: {
    type: Array,
    optional: true
  },
  'recentContactLists.$': {
    type: String
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String
  }
})
UserSchema.extend(IdSchema)
