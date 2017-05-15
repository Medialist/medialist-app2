import { ServerTemplate } from 'meteor/felixble:server-templates'

export default {
  subject: () => 'Invitation to campaign',
  html: (data) => ServerTemplate.render(Assets.getText('email/invite-to-campaign.html'), data),
  text: (data) => ServerTemplate.render(Assets.getText('email/invite-to-campaign.txt'), data)
}
