import Orgs, { OrgSchema } from '/imports/api/orgs/orgs'

// <Legacy compat>
if (Meteor.isServer) {
  global.Orgs = Orgs
} else {
  window.Orgs = Orgs
}

Schemas.Orgs = OrgSchema
// </Legacy compat>
