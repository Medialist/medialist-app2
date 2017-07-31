import React from 'react'
import Helmet from 'react-helmet'
import { Meteor } from 'meteor/meteor'

const { heapanalytics, intercom } = Meteor.settings.public
const heapAppId = heapanalytics && heapanalytics.appId
const intercomAppId = intercom && intercom.appId

export default () => (
  <Helmet
    defaultTitle='Medialist'
    titleTemplate='%s - Medialist'>
    { heapAppId ? (
      <script>{`
        // https://docs.heapanalytics.com/docs/installation
        window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
        heap.load("${heapAppId}");
      `}</script>
    ) : null }
    { intercomAppId ? (
      <script>{`
        (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;
        function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${intercomAppId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
      `}</script>
    ) : null }
  </Helmet>
)
