Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile || {}
  user.myMedialists = []
  user.myContacts = []
  return user
})
