Meteor.publish('clients', function (opts) {
  if (!this.userId) return this.ready()
  return Clients.find({})
})
