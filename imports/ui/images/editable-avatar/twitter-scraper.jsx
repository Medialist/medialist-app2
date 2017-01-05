import React, { PropTypes } from 'react'

const TwitterScraper = React.createClass({
  propTypes: {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  render () {
    return (
      <div>TODO</div>
    )
  }
})

export default TwitterScraper
