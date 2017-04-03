import React from 'react'
import { Meteor } from 'meteor/meteor'
import { rules } from 'react-validation/lib/build/validation.rc'
import validator from 'validator'

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
  },

  email: {
    rule: value => {
      if (!value) {
        return true
      }

      return validator.isEmail(value)
    },
    hint: value => {
      return <p className='error-message f-sm mt1'>Looks like this isn’t a valid email</p>
    }
  },

  username: {
    rule: value => {
      if (!value) {
        return true
      }

      return !value.match(/^https?/)
    },
    hint: value => {
      return <p className='error-message f-sm mt1'>Please enter their username</p>
    }
  },

  url: {
    rule: value => {
      if (!value) {
        return true
      }

      return value.match(/^https?/)
    },
    hint: value => {
      return <p className='error-message f-sm mt1'>Please enter a valid URL</p>
    }
  }
})