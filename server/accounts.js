Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile
  user.medialists = []
  return user
})
