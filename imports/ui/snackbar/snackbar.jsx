import React from 'react'
import PropTypes from 'prop-types'
import { CSSTransitionGroup } from 'react-transition-group'
import { Close } from '/imports/ui/images/icons'

// ten seconds
const MESSAGE_VISIBILITY_DURATION = 10000

/*
 * SnackbarItem - a self-dismissing notification.
 * `dismissTimer` is stopped when user hovers mouse over the item.
 * It's restarted when they move the mouse away
 */
const SnackbarItem = React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    children: PropTypes.node,
    style: PropTypes.object,
    error: PropTypes.bool,
    type: PropTypes.string
  },
  getInitialState () {
    return this.startDismissTimer({})
  },
  startDismissTimer ({dismissTimer}) {
    if (dismissTimer) {
       // is already running.
      return
    }

    return { dismissTimer: setTimeout(this.props.onDismiss, MESSAGE_VISIBILITY_DURATION) }
  },
  stopDismissTimer ({dismissTimer}) {
    if (!dismissTimer) {
      return
    }

    return { dismissTimer: clearTimeout(dismissTimer) }
  },
  render () {
    return (
      <div
        onMouseEnter={() => this.setState(this.stopDismissTimer)}
        onMouseLeave={() => this.setState(this.startDismissTimer)}
        className={`inline-block p4 left-align shadow-1 ${this.props.error ? 'bg-not-interested' : 'bg-gray10'}`}
        style={{...this.props.style}}
        data-id='snackbar-message'
        data-message-type={this.props.type}
        >
        <div className='white inline-block align-middle'>
          {this.props.children}
        </div>
        <div className='inline-block pl4 align-middle'>
          <span className='pointer' onClick={this.props.onDismiss}>
            <Close className='gray20' />
          </span>
        </div>
      </div>
    )
  }
})

// Place Snacbar near the root.
// Controls placement and animation of snackbarItems
// provides an api via `context.snackbar.show` to add new items.
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
  show (message, type) {
    this.showItem({
      message: message,
      error: false,
      type: type
    })
  },
  error (message, type) {
    if (!type) {
      type = message
      message = 'Sorry, that didn\'t work'
    }

    this.showItem({
      message: message,
      error: true,
      type: type
    })
  },
  showItem (item) {
    item.id = Math.random()

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
      // This provides the api for calling snackbar from other components
      // Usage:  snackbar.show(node)
      snackbar: {
        show: this.show,
        error: this.error
      }
    }
  },
  render () {
    return (
      <div data-id='snackbar'>
        {this.props.children}
        <div className='snackbars' style={{
          position: 'fixed',
          bottom: 0,
          right: 20
        }}>
          <CSSTransitionGroup
            transitionName='snackbar'
            transitionAppear
            transitionAppearTimeout={350}
            transitionEnterTimeout={350}
            transitionLeaveTimeout={350}>
            {this.state.items.map((item, index) => (
              <div className='mb4 right-align' key={item.id}>
                <SnackbarItem onDismiss={() => this.remove(item.id)} error={item.error} type={item.type}>
                  {item.message}
                </SnackbarItem>
              </div>
            ))}
          </CSSTransitionGroup>
        </div>
      </div>
    )
  }
})

export default Snackbar
