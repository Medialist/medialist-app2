import { Accounts } from 'meteor/accounts-base'

const findOrCreateUser = (email) => {
  let user = Accounts.findUserByEmail(email)

  if (!user) {
    Accounts.createUser({
      email: email,
      profile: {}
    })
  }

  return user || Accounts.findUserByEmail(email)
}

export default findOrCreateUser
