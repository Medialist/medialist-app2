import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const Toast = ({children, ...props}) => (
  <div style={{position: 'fixed', bottom: 0, left: 0, right: 0}} data-id={props['data-id']}>
    <ReactCSSTransitionGroup
      transitionName='toast'
      transitionEnterTimeout={350}
      transitionLeaveTimeout={250}>
      {children}
    </ReactCSSTransitionGroup>
  </div>
)

export default Toast
