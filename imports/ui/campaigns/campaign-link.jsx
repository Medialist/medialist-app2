import React from 'react'
import { Link } from 'react-router'

export default ({campaign, linkClassName = 'semibold gray10'}) => (
  <Link className={linkClassName} to={`/campaign/${campaign.slug}`} data-id='campaign-link'>
    <span data-id='campaign-name'>{campaign.name}</span>
  </Link>
)
