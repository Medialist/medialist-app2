import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M13 8.58c.033.268-8.166 6.656-8.333 6.413-.167-.242 2.222-5.247 2.222-5.247S3.04 7.68 3 7.414C2.96 7.146 10.022 1 10.222 1c.228 0-1.11 5.247-1.11 5.247S12.965 8.312 13 8.58z" fill="#FFF" fill-rule="evenodd"/></svg>'} }
function MenuActivityIcon () { return (<span className="svg-icon svg-icon-menu-activity-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default MenuActivityIcon
