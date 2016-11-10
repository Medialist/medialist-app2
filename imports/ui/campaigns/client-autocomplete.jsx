import React, { PropTypes } from 'react'
import Autocomplete from '../lists/autocomplete'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired
  },
  getInitialState () {
    const value = this.props.value || ''
    const { getSuggestions } = this
    return {
      value,
      suggestions: getSuggestions(value)
    }
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value.toLowerCase()
    })
  },
  render () {
    const { suggestions, value } = this.state
    return (
      <Autocomplete {...this.props} suggestions={suggestions} value={value} />
    )
  }
})
