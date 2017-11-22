import { Meteor } from 'meteor/meteor'

export default function validateEmail (email) {
  const {teamDomains, supportDomains} = Meteor.settings.public.authentication
  const validDomains = teamDomains.concat(supportDomains)
  const domain = email.split('@').pop()
  return validDomains.some(validDomain => domain === validDomain)
}
