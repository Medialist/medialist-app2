import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="#99A3B2" fill-rule="evenodd"><path d="M11.105 7a4.105 4.105 0 1 0-8.21 0 4.105 4.105 0 0 0 8.21 0zM1 7a6 6 0 1 1 12 0A6 6 0 0 1 1 7z"/><rect transform="rotate(45 12.124 12.31)" x="9.317" y="11.31" width="5.615" height="2" rx=".5"/></g></svg>'} }
function MenuSearchIcon () { return (<span className="svg-icon svg-icon-menu-search-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default MenuSearchIcon
