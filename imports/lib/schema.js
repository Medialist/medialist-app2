import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})
