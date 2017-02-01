import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { Close } from '../images/icons'

/*
 * SnackbarItem - a self-dismissing notificaiton.
 * `dismissTimer` is stopped when user hovers mouse over the item.
 * It's restarted when they move the mouse away
 */
const SnackbarItem = React.createClass({
  getInitialState () {
    return this.startDismissTimer({})
  },
  startDismissTimer ({dismissTimer}) {
    if (dismissTimer) return // is already running.
    return { dismissTimer: setTimeout(this.props.onDismiss, 2000) }
  },
  stopDismissTimer ({dismissTimer}) {
    if (!dismissTimer) return
    return { dismissTimer: clearTimeout(dismissTimer) }
  },
  render () {
    const { onDismiss, children, style } = this.props
    return (
      <div
        onMouseEnter={() => this.setState(this.stopDismissTimer)}
        onMouseLeave={() => this.setState(this.startDismissTimer)}
        className='inline-block p4 left-align shadow-1 bg-gray10'
        style={{...style}}>
        <div className='white inline-block align-middle'>
          {children}
        </div>
        <div className='inline-block pl4 align-middle'>
          <span onClick={onDismiss}>
            <Close className='gray20' />
          </span>
        </div>
      </div>
    )
  }
})

// Place me high up in the tree. I make a space for snackbars to play.
// Controls placement and animation of snackbarItems and provides an api
// via `context.snackbar.show` to add new items.
const Snackbar = React.createClass({
  propTypes: {
    children: PropTypes.node
  },
  getInitialState () {
    return {
      // An array of `{id: 1, message: 'Welcome to Medialist'}`
      // `message` could be a Component or an array of nodes
      items: []
    }
  },
  childContextTypes: {
    snackbar: PropTypes.object.isRequired
  },
  show (message) {
    const id = Math.random()
    const item = { id, message: message }
    this.setState((s) => {
      // message is possibly an array o nodes that should be treated as 1 item.
      const items = s.items.concat([item])
      return { items }
    })
  },
  remove (id) {
    this.setState((s) => {
      const items = s.items.filter((item) => item.id !== id)
      return { items }
    })
  },
  getChildContext () {
    return {
      // This provides the api for calling snackbar from other conponents
      // Usage:  snackbar.show(node)
      snackbar: {
        show: this.show
      }
    }
  },
  render () {
    const { children } = this.props
    const { items } = this.state
    return (
      <div>
        {children}
        <div className='snackbars' style={{
          position: 'fixed',
          bottom: 0,
          right: 20
        }}>
          <ReactCSSTransitionGroup
            transitionName='snackbar'
            transitionAppear
            transitionAppearTimeout={350}
            transitionEnterTimeout={350}
            transitionLeaveTimeout={350}>
            {items.map((item, index) => (
              <div className='mb4 right-align' key={item.id}>
                <SnackbarItem onDismiss={() => this.remove(item.id)}>
                  {item.message}
                </SnackbarItem>
              </div>
            ))}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    )
  }
})

export default Snackbar
