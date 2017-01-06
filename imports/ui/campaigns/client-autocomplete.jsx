import React, { PropTypes } from 'react'
import Autocomplete from '../lists/autocomplete'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    clientName: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    const { clientName } = this.props
    const { getSuggestions } = this
    return {
      suggestions: getSuggestions(clientName)
    }
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value.toLowerCase()
    }).map((c) => c.name)
  },
  onChange (value) {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
    this.props.onChange(value)
  },
  render () {
    const { onChange } = this
    const { suggestions } = this.state
    const { onSelect, clientName } = this.props
    return (
      <Autocomplete {...this.props} suggestions={suggestions} value={clientName} onSelect={onSelect} onChange={onChange} />
    )
  }
})
