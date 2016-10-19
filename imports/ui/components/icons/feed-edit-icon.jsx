import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 11.536l7.424-7.425a.499.499 0 0 0 .007-.7L12.59 1.276a.493.493 0 0 0-.7.007L4.464 8.707l2.829 2.829zm-1.445 1.383c-.188.116-.41.21-.583.239l-2.433.415c-.27.047-.45-.14-.405-.405l.415-2.433a1.79 1.79 0 0 1 .239-.583l2.767 2.767z" fill="#BFC8D7" fill-rule="evenodd"/></svg>'} }
function FeedEditIcon () { return (<span className="svg-icon svg-icon-feed-edit-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default FeedEditIcon
