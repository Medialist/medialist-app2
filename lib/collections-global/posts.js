import Posts, { PostSchema } from '/imports/api/posts/posts'
import { ContactRefSchema } from '/imports/api/contacts/contacts'

// <Legacy compat>
if (Meteor.isServer) {
  global.Posts = Posts
} else {
  window.Posts = Posts
}

Schemas.Posts = PostSchema
Schemas.PostContacts = ContactRefSchema
// </Legacy compat>
