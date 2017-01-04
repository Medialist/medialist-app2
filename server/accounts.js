Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile || {}
  user.profile.medialists = user.profile.medialists || []
  return user
})
