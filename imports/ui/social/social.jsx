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
    url: 'https://www.linkedin.com/in/'
  },
  Facebook: {
    icon: Facebook,
    url: 'https://facebook.com/public/'
  },
  YouTube: {
    icon: Youtube,
    url: 'https://www.youtube.com/user/'
  },
  Instagram: {
    icon: Instagram,
    url: 'https://www.instagram.com/'
  },
  Medium: {
    icon: Medium,
    url: 'https://medium.com/'
  },
  Pinterest: {
    icon: Pinterest,
    url: 'https://www.pinterest.com/'
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
