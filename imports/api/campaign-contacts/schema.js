import SimpleSchema from 'simpl-schema'
import { IdSchema, AuditSchema } from '/imports/lib/schema'
import { StatusValues } from '/imports/api/contacts/status'
import { ContactRefSchema } from '/imports/api/contacts/schema'

export const CampaignContactSchema = new SimpleSchema({
  campaign: {
    type: String
  },
  status: {
    type: String,
    allowedValues: StatusValues
  }
})
CampaignContactSchema.extend(IdSchema)
CampaignContactSchema.extend(AuditSchema)
CampaignContactSchema.extend(ContactRefSchema)
