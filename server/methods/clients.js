Meteor.methods({
  'clients/search': function (term) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can search')
    if (!term) return []
    var regExp = new RegExp(term, 'i')
    return Clients.find( { name: regExp }, { limit: App.clientSuggestions } ).map( client => client.name )
  }
})
