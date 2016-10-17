Meteor.methods({
  'orgs/search': function (term) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can search')
    if (!term) return []
    var regExp = new RegExp(term, 'i')
    return Orgs.find( { name: regExp }, { limit: App.clientSuggestions } ).map( org => org.name )
  }
})
