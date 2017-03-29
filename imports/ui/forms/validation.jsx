import React from 'react'
import { Meteor } from 'meteor/meteor'
import { rules } from 'react-validation/lib/build/validation.rc'

const SIGNIN_EMAIL_DOMAIN_REGEX = new RegExp('^.+' + Meteor.settings.public.authentication.emailDomains
  .map(domain => `@${domain}`)
  .reduce((list, current, index) => {
    if (index > 0) {
      list = `${list}|`
    }

    list = `${list}${current}`

    if (index === Meteor.settings.public.authentication.emailDomains.length - 1) {
      list = `${list})$`
    }

    return list
  }, '('))

const SIGNIN_EMAIL_DOMAIN_HINT = Meteor.settings.public.authentication.emailDomains
  .map(domain => `@${domain}`)
  .reduce((list, current, index) => {
    if (index > 0 && index === Meteor.settings.public.authentication.emailDomains.length - 1) {
      list = list + ' or '
    } else if (list) {
      list += ', '
    }

    list += current

    return list
  }, '')

export default Object.assign(rules, {
  required: {
    rule: value => {
      return value && value.toString().trim()
    },
    hint: value => {
      return <p className='error-message f-sm mt1'>This field is required</p>
    }
  },

  signInEmail: {
    rule: value => {
      return Boolean(SIGNIN_EMAIL_DOMAIN_REGEX.exec(value))
    },
    hint: value => {
      return <p className='error-message f-sm mt1'>Please use a {SIGNIN_EMAIL_DOMAIN_HINT} address</p>
    }
  }
})
