import { SimpleSchema } from 'meteor/aldeed:simple-schema'
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
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
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

export const CreatedAtSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    denyUpdate: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date()
      }

      return this.value
    }
  },
  createdBy: {
    type: UserRefSchema
  }
})

export const AuditSchema = new SimpleSchema([
  CreatedAtSchema, {
    updatedAt: {
      type: Date,
      optional: true,
      denyInsert: true,
      autoValue: function () {
        if (this.isUpdate) {
          return new Date()
        }

        this.unset()
      }
    },
    updatedBy: {
      type: UserRefSchema,
      optional: true,
      denyInsert: true
    }
  }
])

export const LinkSchema = new SimpleSchema({
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  }
})
