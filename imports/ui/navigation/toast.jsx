import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const Toast = ({children}) => (
  <div style={{position: 'fixed', bottom: 0, left: 0, right: 0}}>
    <ReactCSSTransitionGroup
      transitionName='toast'
      transitionEnterTimeout={350}
      transitionLeaveTimeout={250}>
      {children}
    </ReactCSSTransitionGroup>
  </div>
)

export default Toast
