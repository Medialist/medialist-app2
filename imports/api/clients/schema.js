import SimpleSchema from 'simpl-schema'
import { IdSchema } from '/imports/lib/schema'

export const ClientSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
ClientSchema.extend(IdSchema)
