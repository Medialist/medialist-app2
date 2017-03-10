import React from 'react'
import { Twitter, Facebook, Linkedin, Youtube, Instagram, Medium, Pinterest, WebsiteIcon } from '../images/icons'
import Tooltip from '../navigation/tooltip'

export const SocialMap = {
  Website: {
    icon: WebsiteIcon,
    url: ''
  },
  Twitter: {
    icon: Twitter,
    url: 'https://twitter.com/'
  },
  LinkedIn: {
    icon: Linkedin,
    url: ''
  },
  Facebook: {
    icon: Facebook,
    url: 'https://facebook.com/public/'
  },
  YouTube: {
    icon: Youtube,
    url: ''
  },
  Instagram: {
    icon: Instagram,
    url: ''
  },
  Medium: {
    icon: Medium,
    url: ''
  },
  Pinterest: {
    icon: Pinterest,
    url: ''
  }
}

export const SocialIcon = ({label, value, ...props}) => {
  const social = SocialMap[label] ? SocialMap[label] : SocialMap.Website
  const Icon = social.icon
  const url = `${social.url}${value}`
  const tooltip = value ? url.split('//').pop() : label
  return (
    <a href={url} target='_blank' {...props}>
      <Tooltip title={tooltip}>
        <Icon size='20' className='gray60' />
      </Tooltip>
    </a>
  )
}
