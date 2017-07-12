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
    denyUpdate: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date()
      }

      this.unset()
    }
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
    defaultValue: []
  },
  'myContacts.$': {
    type: ContactRefSchema
  },
  myCampaigns: {
    type: Array,
    defaultValue: []
  },
  'myCampaigns.$': {
    type: CampaignRefSchema
  },
  onCampaigns: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  recentCampaignLists: {
    type: Array,
    defaultValue: []
  },
  'recentCampaignLists.$': {
    type: String
  },
  recentContactLists: {
    type: Array,
    defaultValue: []
  },
  'recentContactLists.$': {
    type: String
  }
})
UserSchema.extend(IdSchema)
