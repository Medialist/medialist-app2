import React from 'react'
import { Twitter, Facebook, WebsiteIcon } from '../images/icons'
import Tooltip from '../navigation/tooltip'

const socialIcons = {
  Twitter: {
    icon: Twitter,
    url: 'https://twitter.com/'
  },
  Facebook: {
    icon: Facebook,
    url: 'https://facebook.com/public/'
  },
  Website: {
    icon: WebsiteIcon,
    url: ''
  }
}

export default (props) => {
  const { label, value } = props
  const social = socialIcons[label] ? socialIcons[label] : socialIcons.Website
  const Icon = social.icon
  const url = `${social.url}${value}`
  const tooltip = url.split('//').pop()
  return (
    <a href={url} target='_Blank' className='mr2'>
      <Tooltip title={tooltip}>
        <Icon size='20' className='gray60' />
      </Tooltip>
    </a>
  )
}
