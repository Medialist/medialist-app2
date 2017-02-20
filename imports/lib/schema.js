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
