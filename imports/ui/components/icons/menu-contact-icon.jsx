import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1.462 10.22c-.255.086-.462.384-.462.668v3.6c0 .283.216.512.482.512h13.036c.268 0 .482-.23.482-.513v-3.6c0-.283-.207-.582-.462-.668L11.5 9c-.808.691-1.5 1.5-3.5 1.5S5.316 9.719 4.5 9l-3.038 1.22zM8 8.123c1.933 0 3.5-1.595 3.5-3.562C11.5 2.594 9.933 1 8 1S4.5 2.594 4.5 4.561c0 1.967 1.567 3.562 3.5 3.562z" fill="#FFF" fill-rule="evenodd"/></svg>'} }
function MenuContactIcon () { return (<span className="svg-icon svg-icon-menu-contact-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default MenuContactIcon
