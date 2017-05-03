import React from 'react'
import { Link } from 'react-router'

export default ({campaignList, linkClassName = 'semibold gray10'}) => (
  <Link className={linkClassName} to={`/campaigns?list=${campaignList.slug}`} data-id='campaign-list-link'>
    <span data-id='campaign-list-name'>{campaignList.name}</span>
  </Link>
)
