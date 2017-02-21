import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { StatusValues } from '/imports/api/contacts/status'

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const StatusSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: StatusValues
  }
})

export const LabelValueSchema = new SimpleSchema({
  label: { type: String },
  value: { type: String }
})

export const UserRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'name': {
    type: String,
    min: 1
  },
  'avatar': {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url
  }
})

export const CreatedAtSchema = new SimpleSchema({
  createdAt: { type: Date },
  createdBy: { type: UserRefSchema }
})

export const AuditSchema = new SimpleSchema({
  createdAt: { type: Date },
  createdBy: { type: UserRefSchema },
  updatedAt: { type: Date },
  updatedBy: { type: UserRefSchema }
})
