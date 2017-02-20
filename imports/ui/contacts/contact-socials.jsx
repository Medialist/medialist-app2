import React from 'react'
import { Twitter } from '../images/icons'

const socialIcons = {
  Twitter: {
    icon: Twitter,
    url: 'https://twitter.com/'
  }
}

export default (props) => {
  const { label, value } = props
  const Icon = socialIcons[label].icon
  const url = `${socialIcons[label].url}${value}`
  return (
    <a href={url} target='_Blank'><Icon size='20' className='mr2' /></a>
  )
}
