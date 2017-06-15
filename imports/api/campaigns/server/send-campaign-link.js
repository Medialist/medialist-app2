import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Email } from 'meteor/email'
import inviteToCampaignTemplate from '/imports/api/email/server/templates/invite-to-campaign'

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

const sendCampaignLink = (userIds = [], sender, campaign) => {
  Meteor.users.find({
    _id: {
      $in: userIds
    }
  }, {
    fields: {
      emails: 1
    }
  })
  .forEach(user => {
    try {
      sendEmail(user, sender, campaign)
    } catch (error) {
      // the tests cause an error to be thrown so only propagate it if we
      // are in the business of sending emails
      if (Meteor.settings.authentication && Meteor.settings.authentication.sendLink) {
        throw error
      }
    }
  })
}

export default sendCampaignLink
