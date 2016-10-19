import React from 'react'
function setSvg () { return {__html: '<svg width="15" height="18" viewBox="0 0 15 18" xmlns="http://www.w3.org/2000/svg"><path d="M13.223 12.348L15 14.13V15H0v-.87l1.777-1.782V7.5a5.61 5.61 0 0 1 1.24-3.564c.826-1.05 1.873-1.726 3.14-2.03v-.58c0-.36.13-.67.393-.932C6.81.13 7.12 0 7.48 0c.357 0 .667.131.93.394.26.262.392.573.392.932v.58c1.267.304 2.32.98 3.16 2.03.841 1.05 1.261 2.238 1.261 3.564v4.848zM7.976 18c-.533 0-.996-.198-1.388-.595A1.932 1.932 0 0 1 6 16h4c0 .54-.204 1.008-.612 1.405-.408.397-.878.595-1.412.595z" fill="#FFF" fill-rule="evenodd"/></svg>'} }
function NotificationBell () { return (<span className="svg-icon svg-icon-notification-bell" dangerouslySetInnerHTML={setSvg()}></span>) }
export default NotificationBell
