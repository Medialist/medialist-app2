import React from 'react'
import Helmet from 'react-helmet'
import HeapAnalyitcs from '/imports/ui/integrations/heap-analytics'
import Intercom from '/imports/ui/integrations/intercom'

export default () => (
  <div>
    <Helmet defaultTitle='Medialist' titleTemplate='%s - Medialist' />
    <HeapAnalyitcs />
    <Intercom />
  </div>
)
