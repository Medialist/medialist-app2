import React from 'react'
import { Link } from 'react-router'

export default ({tag, type, linkClassName = 'semibold gray10'}) => (
  <Link className={linkClassName} to={`/${type}s?tag=${tag.toLowerCase()}`} data-id='tag-link'>
    <span data-id='tag-name'>#{tag}</span>
  </Link>
)
