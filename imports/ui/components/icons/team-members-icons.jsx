import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="#BFC8D7" d="M3 2h10v12H3z" fill-rule="evenodd"/></svg>'} }
function TeamMembersIcons () { return (<span className="svg-icon svg-icon-team-members-icons" dangerouslySetInnerHTML={setSvg()}></span>) }
export default TeamMembersIcons
