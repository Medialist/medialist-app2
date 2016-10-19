import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.929 9A7.012 7.012 0 0 1 9 14.929V9h5.929zm0-2C14.443 3.613 11.526 1 8 1 4.142 1 1 4.134 1 8a7.008 7.008 0 0 0 6 6.929V8c0-.552.446-1 .998-1h6.93z" fill="#BFC8D7" fill-rule="evenodd"/></svg>'} }
function SectorIcon () { return (<span className="svg-icon svg-icon-sector-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default SectorIcon
