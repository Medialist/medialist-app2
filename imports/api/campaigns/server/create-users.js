import { Meteor } from 'meteor/meteor'
import findOrCreateUser from '/imports/api/users/server/find-or-create-user'
import validateEmail from '/imports/api/users/server/validate-email'

const createUsers = (emails = []) => {
  // validate all emails
  return emails.map(email => {
    if (!validateEmail(email)) {
      console.warn(`Tried to invite someone with an invalid email '${email}'`)

      throw new Meteor.Error('INVALID_EMAIL')
    }

    return findOrCreateUser(email)._id
  })
}

export default createUsers
