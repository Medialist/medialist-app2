import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Email } from 'meteor/email'
import { Accounts } from 'meteor/accounts-base'
import inviteToCampaignTemplate from '/imports/api/email/server/templates/invite-to-campaign'

export const findOrCreateUser = (email) => {
  let user = Accounts.findUserByEmail(email)

  if (!user) {
    Accounts.createUser({
      email: email,
      profile: {}
    })
  }

  return user || Accounts.findUserByEmail(email)
}

export const createInvitationLink = (user, campaign) => {
  const tokenRecord = {
    token: Random.secret(),
    address: user.emails[0].address,
    when: new Date()
  }

  Meteor.users.update({
    _id: user._id
  }, {
    $push: {
      'services.email.verificationTokens': tokenRecord
    }
  })

  Meteor._ensure(user, 'services', 'email')

  if (!user.services.email.verificationTokens) {
    user.services.email.verificationTokens = []
  }

  user.services.email.verificationTokens.push(tokenRecord)

  return Meteor.absoluteUrl(`sign-in/${tokenRecord.token}?r=/campaign/${campaign.slug}`)
}

const sendEmail = (user, sender, campaign) => {
  const url = createInvitationLink(user, campaign)

  const data = {
    sender: sender.profile.name,
    campaign: campaign.name,
    url: url
  }

  Email.send({
    to: user.emails[0].address,
    from: Meteor.settings.email.defaultFrom,
    subject: inviteToCampaignTemplate.subject(data),
    html: inviteToCampaignTemplate.html(data),
    text: inviteToCampaignTemplate.text(data)
  })
}

const sendCampaignLink = (emails = [], sender, campaign) => {
  // validate all emails
  emails.forEach(email => {
    const domain = email.split('@').pop()

    const validDomain = Meteor.settings.public.authentication.emailDomains
      .some(validDomain => domain === validDomain)

    if (!validDomain) {
      console.warn(`Tried to invite someone with an invalid email '${domain}'`)

      throw new Meteor.Error('INVALID_EMAIL')
    }
  })

  // all are valid, process them
  return emails.map(email => {
    const user = findOrCreateUser(email)

    try {
      sendEmail(user, sender, campaign)
    } catch (error) {
      // the tests cause an error to be thrown so only propagate it if we
      // are in the business of sending emails
      if (Meteor.settings.authentication.sendLink) {
        throw error
      }
    }

    return user._id
  })
}

export default sendCampaignLink
