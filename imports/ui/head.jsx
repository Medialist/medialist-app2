import React from 'react'
import Helmet from 'react-helmet'

export default () => (
  <Helmet
    defaultTitle='Medialist'
    titleTemplate='%s - Medialist'
    meta={[
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ]}
  />
)
