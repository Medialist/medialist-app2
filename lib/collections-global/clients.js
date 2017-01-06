import Clients, { ClientSchema } from '/imports/api/clients/clients'

// <Legacy compat>
if (Meteor.isServer) {
  global.Clients = Clients
} else {
  window.Clients = Clients
}

Schemas.Clients = ClientSchema
// </Legacy compat>