import SimpleSchema from 'simpl-schema'
import { IdSchema } from '/imports/lib/schema'

export const OrgSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
OrgSchema.extend(IdSchema)
