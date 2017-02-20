import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const LabelValueSchema = new SimpleSchema({
  label: { type: String, min: 1 },
  value: { type: String, min: 1 }
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

export const AuditSchema = new SimpleSchema({
  createdAt: { type: Date },
  createdBy: { type: UserRefSchema },
  updatedAt: { type: Date },
  updatedBy: { type: UserRefSchema }
})
