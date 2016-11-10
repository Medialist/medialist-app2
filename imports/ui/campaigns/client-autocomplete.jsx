import React, { PropTypes } from 'react'
import Autocomplete from '../lists/autocomplete'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    clientName: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
  },
  getInitialState () {
    const clientName = this.props.clientName || ''
    const { getSuggestions } = this
    return {
      clientName,
      suggestions: getSuggestions(clientName)
    }
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value.toLowerCase()
    })
  },
  onChange (value) {
    this.setState({clientName: value})
  },
  onSelect (suggestion) {
    const res = this.props.clients.filter((client) => suggestion === client.name)
    const client = res[0]
    if (!client) return
    this.props.onSelect(client)
  },
  render () {
    const { onSelect } = this
    const { suggestions, clientName } = this.state
    return (
      <Autocomplete {...this.props} suggestions={suggestions} value={clientName} onSelect={onSelect} />
    )
  }
})
