import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { IdSchema } from '/imports/lib/schema'

export const OrgSchema = new SimpleSchema([
  IdSchema, {
    name: {
      type: String,
      min: 1
    }
  }
])
