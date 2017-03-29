import Pug from 'pug'
const path = Npm.require('path')
const base = path.resolve('.').split('.meteor')[0]

const plainText = (data) => `
Please follow the link below to sign in to Medialist.

${data.url}

This link will expire in fifteen minutes and can only be used once.

If you did not make this request, please contact us at feedback@medialist.io

Cheers,

The team at Medialist
`
export default {
  subject: () => 'Log in to Medialist',
  html: Pug.compileFile(`${base}imports/api/email/server/templates/send-login-link.pug`),
  text: plainText
}
