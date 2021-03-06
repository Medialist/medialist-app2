import SimpleSchema from 'simpl-schema'
import { StatusValues } from '/imports/api/contacts/status'

export const IdSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
})

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const StatusSchema = new SimpleSchema({
  status: {
    type: String,
    allowedValues: StatusValues
  }
})

export const LabelValueSchema = new SimpleSchema({
  label: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  }
})

export const UserRefSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    min: 1
  },
  avatar: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url
  },
  email: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  }
})
UserRefSchema.extend(IdSchema)

export const CreatedAtSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    denyUpdate: true
  },
  createdBy: {
    type: UserRefSchema
  }
})

export const AuditSchema = new SimpleSchema({
  updatedAt: {
    type: Date,
    optional: true
  },
  updatedBy: {
    type: UserRefSchema,
    optional: true
  }
})

export const LinkSchema = new SimpleSchema({
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  }
})
