import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

const Toast = ({children, ...props}) => (
  <div style={{position: 'fixed', bottom: 0, left: 0, right: 0}} data-id={props['data-id']}>
    <CSSTransitionGroup
      transitionName='toast'
      transitionEnterTimeout={350}
      transitionLeaveTimeout={250}>
      {children}
    </CSSTransitionGroup>
  </div>
)

export default Toast
