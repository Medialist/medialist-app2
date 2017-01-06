import Medialists, { MedialistSchema } from '/imports/api/medialists/medialists'

// <Legacy compat>
if (Meteor.isServer) {
  global.Medialists = Medialists
} else {
  window.Medialists = Medialists
}

Schemas.Medialists = MedialistSchema
// </Legacy compat>
