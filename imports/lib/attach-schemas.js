import { Meteor } from 'meteor/meteor'
import Campaigns from '/imports/api/campaigns/campaigns'
import { CampaignSchema } from '/imports/api/campaigns/schema'
import Clients from '/imports/api/clients/clients'
import { ClientSchema } from '/imports/api/clients/schema'
import Contacts from '/imports/api/contacts/contacts'
import { ContactSchema } from '/imports/api/contacts/schema'
import Embeds from '/imports/api/embeds/embeds'
import { EmbedSchema } from '/imports/api/embeds/schema'
import MasterLists from '/imports/api/master-lists/master-lists'
import { MasterListSchema } from '/imports/api/master-lists/schema'
import Orgs from '/imports/api/orgs/orgs'
import { OrgSchema } from '/imports/api/orgs/schema'
import Posts from '/imports/api/posts/posts'
import { PostSchema } from '/imports/api/posts/schema'
import Tags from '/imports/api/tags/tags'
import { TagSchema } from '/imports/api/tags/schema'
import { UserSchema } from '/imports/api/users/schema'

export default function () {
  Campaigns.attachSchema(CampaignSchema)
  Clients.attachSchema(ClientSchema)
  Contacts.attachSchema(ContactSchema)
  Embeds.attachSchema(EmbedSchema)
  MasterLists.attachSchema(MasterListSchema)
  Orgs.attachSchema(OrgSchema)
  Posts.attachSchema(PostSchema)
  Tags.attachSchema(TagSchema)
  Meteor.users.attachSchema(UserSchema)
}
