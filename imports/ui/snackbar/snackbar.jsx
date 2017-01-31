import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { Close } from '../images/icons'

const SnackbarItem = React.createClass({
  render () {
    const { onDismiss, children, style } = this.props
    return (
      <div className='inline-block p4 left-align shadow-1 bg-gray10' style={{...style}}>
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
const Snackbar = React.createClass({
  propTypes: {
    children: PropTypes.node
  },
  getInitialState () {
    return {
      items: [
        {id: 1, message: 'hello'},
        {id: 2, message: 'world world world'},
        {id: 3, message: 'glooorb'}
      ]
    }
  },
  childContextTypes: {
    snackbar: PropTypes.object.isRequired
  },
  show (message) {
    const id = Math.random() // woteva
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
      snackbar: {
        show: this.show
      }
    }
  },
  render () {
    const { children } = this.props
    const { items } = this.state
    return (
      <div onClick={() => this.show(Math.random())}>
        {children}
        <div className='snackbars' style={{
          position: 'fixed',
          bottom: 0,
          right: 20
        }}>
          <ReactCSSTransitionGroup
            transitionName='snackbar'
            transitionAppear
            transitionEnterTimeout={350}
            transitionLeaveTimeout={350}>
            {items.map((item, index) => (
              <div className='mb4 right-align' key={item.id}>
                <SnackbarItem id={item.id} onDismiss={() => {
                  console.log('dismiss', {item, index})
                  this.remove(item.id)
                }}>
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
