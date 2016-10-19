import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="#FFF" fill-rule="evenodd"><path d="M3.775 5h-1.78C1.455 5 1 5.446 1 5.995v8.01c0 .54.446.995.995.995h8.01c.529 0 .977-.428.994-.963l-8.037-2.154a.995.995 0 0 1-.704-1.22L3.775 5z"/><rect transform="rotate(15 9.611 6.911)" x="5.111" y="2.411" width="9" height="9" rx="1"/></g></svg>'} }
function MenuCampaignIcon () { return (<span className="svg-icon svg-icon-menu-campaign-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default MenuCampaignIcon
