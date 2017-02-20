import React from 'react'
import { Twitter, Facebook, WebsiteIcon } from '../images/icons'

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
  const Icon = socialIcons[label].icon
  const url = `${socialIcons[label].url}${value}`
  return (
    <a href={url} target='_Blank'><Icon className='mr2' /></a>
  )
}
