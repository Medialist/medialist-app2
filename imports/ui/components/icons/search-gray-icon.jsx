import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.105 7a4.105 4.105 0 1 0-8.21 0 4.105 4.105 0 0 0 8.21 0zM1 7a6 6 0 1 1 12 0A6 6 0 0 1 1 7zm9.49 2.975a.504.504 0 0 1 .709-.005l3.265 3.266a.494.494 0 0 1-.004.71l-.7.7a.504.504 0 0 1-.71.005l-3.266-3.266a.494.494 0 0 1 .005-.71l.7-.7z" fill="#BFC8D7" fill-rule="evenodd"/></svg>'} }
function SearchGrayIcon () { return (<span className="svg-icon svg-icon-search-gray-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default SearchGrayIcon
