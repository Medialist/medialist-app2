import { ServerTemplate } from 'meteor/felixble:server-templates'

export default {
  subject: () => 'Log in to Medialist',
  html: (data) => ServerTemplate.render(Assets.getText('email/send-login-link.html'), data),
  text: (data) => ServerTemplate.render(Assets.getText('email/send-login-link.txt'), data)
}
