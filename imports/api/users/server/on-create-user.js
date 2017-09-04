import { Meteor } from 'meteor/meteor'

const { teamDomains, supportDomains } = Meteor.settings.public.authentication

export function pickUserRoles (email) {
  const domain = email.split('@').pop()
  const roles = []
  if (teamDomains.some(e => e === domain)) {
    roles.push('team')
  }
  if (supportDomains.some(e => e === domain)) {
    roles.push('support')
  }
  return roles
}

export default function onCreateUser (options, user) {
  user.profile = options.profile || {}
  user.myCampaigns = []
  user.myContacts = []
  user.recentCampaignLists = []
  user.recentContactLists = []
  user.onCampaigns = 0
  user.createdAt = new Date()
  user.roles = pickUserRoles(options.email)

  return user
}
