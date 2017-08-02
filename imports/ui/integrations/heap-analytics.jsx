import React from 'react'
import Helmet from 'react-helmet'
import { Meteor } from 'meteor/meteor'

const { heapanalytics } = Meteor.settings.public
const heapAppId = heapanalytics && heapanalytics.appId

export default () => {
  if (!heapAppId) return null
  return (
    <Helmet>
      <script>{`
        // https://docs.heapanalytics.com/docs/installation
        window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
        heap.load("${heapAppId}");
      `}</script>
    </Helmet>
  )
}
