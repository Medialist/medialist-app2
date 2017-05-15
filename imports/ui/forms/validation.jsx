import React from 'react'
import { Meteor } from 'meteor/meteor'
import { rules } from '@achingbrain/react-validation'
import validator from 'validator'

export const SIGNIN_EMAIL_DOMAIN_REGEX = new RegExp('^.+' + Meteor.settings.public.authentication.emailDomains
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

export const SIGNIN_EMAIL_DOMAIN_HINT = Meteor.settings.public.authentication.emailDomains
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
      return <p className='error-message f-sm mt1' data-id='error-message-required-field'>This field is required</p>
    }
  },

  signInEmail: {
    rule: value => {
      return Boolean(SIGNIN_EMAIL_DOMAIN_REGEX.exec(value))
    },
    hint: value => {
      return <p className='error-message f-sm mt1' data-id='error-message-invalid-domain'>Please use a {SIGNIN_EMAIL_DOMAIN_HINT} address</p>
    }
  },

  signInEmailList: {
    rule: value => {
      if (!value) {
        return true
      }

      return Boolean(
        value
          .split(',')
          .map(e => e.trim())
          .filter(e => Boolean(SIGNIN_EMAIL_DOMAIN_REGEX.exec(value)))
          .length
      )
    },
    hint: value => {
      return <p className='error-message f-sm mt1' data-id='error-message-invalid-domain'>You can only invite colleages with a {SIGNIN_EMAIL_DOMAIN_HINT} address at present</p>
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
      return <p className='error-message f-sm mt1' data-id='error-message-invalid-email'>Looks like this isn’t a valid email</p>
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
      return <p className='error-message f-sm mt1' data-id='error-message-invalid-username'>Please enter their username</p>
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
      return <p className='error-message f-sm mt1' data-id='error-message-invalid-url'>Please enter a valid URL</p>
    }
  },

  paired: {
    rule: (value, components, component) => {
      const other = components[component.props['data-paired-with']]

      if (!value && other.state.value) {
        return false
      }

      return true
    },
    hint: value => {
      return <p className='error-message f-sm mt1' data-id='error-message-required-pair'>Please enter a value</p>
    }
  }
})
