import { Meteor } from 'meteor/meteor'
import findOrCreateUser from '/imports/api/users/server/find-or-create-user'

const createUsers = (emails = []) => {
  // validate all emails
  return emails.map(email => {
    const domain = email.split('@').pop()

    const validDomain = Meteor.settings.public.authentication.emailDomains
      .concat(Meteor.settings.public.authentication.extraEmailDomains)
      .some(validDomain => domain === validDomain)

    if (!validDomain) {
      console.warn(`Tried to invite someone with an invalid email '${domain}'`)

      throw new Meteor.Error('INVALID_EMAIL')
    }

    return findOrCreateUser(email)._id
  })
}

export default createUsers
