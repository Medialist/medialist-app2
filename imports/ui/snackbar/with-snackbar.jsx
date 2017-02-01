import React, { PropTypes } from 'react'

// HOC to wrap a thing that wants to make snacks
// Assumes you have a Snackbar component higer up the tree
const withSnackbar = (component) => {
  return React.createClass({
    displayName: `withSnackbar(${component.displayName || component.name})`,

    contextTypes: {
      snackbar: PropTypes.shape({
        show: PropTypes.func.isRequired
      }).isRequired
    },

    render () {
      return React.createElement(component, {
        ...this.props,
        ...this.context
      })
    }
  })
}

export default withSnackbar
