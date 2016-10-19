import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.994A1 1 0 0 1 2.007 1h11.986C14.55 1 15 1.447 15 1.994v7.812a1 1 0 0 1-1.007.994H2.007A1.001 1.001 0 0 1 1 9.806V1.994zM3.8 10.8h5.6L3.8 15v-4.2z" fill="#2B60D5" fill-rule="evenodd"/></svg>'} }
function FeedFeedbackIcon () { return (<span className="svg-icon svg-icon-feed-feedback-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default FeedFeedbackIcon
