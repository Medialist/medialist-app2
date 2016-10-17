Orgs = new Mongo.Collection('orgs')

Orgs.allow({
  insert: function () {
    return false
  },

  update: function () {
    return false
  },

  remove: function () {
    return false
  }
})

Schemas.Orgs = new SimpleSchema({
  name: {
    type: String,
    min: 1
  }
})
