import React, { PropTypes } from 'react'
import Autocomplete from '../lists/autocomplete'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    clientName: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    const clientName = this.props.clientName || ''
    const { getSuggestions } = this
    return {
      clientName,
      suggestions: getSuggestions(clientName)
    }
  },
  componentWillReceiveProps (props) {
    this.setState({
      clientName: props.clientName
    })
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value.toLowerCase()
    }).map((c) => c.name)
  },
  onChange (value) {
    this.setState({
      clientName: value,
      suggestions: this.getSuggestions(value)
    })
    this.props.onChange(value)
  },
  onSelect (suggestion) {
    const res = this.props.clients.filter((client) => suggestion === client.name)
    const client = res[0]
    if (!client) return
    this.props.onSelect('client', client)
  },
  render () {
    const { onChange, onSelect } = this
    const { suggestions, clientName } = this.state
    return (
      <Autocomplete {...this.props} suggestions={suggestions} value={clientName} onSelect={onSelect} onChange={onChange} />
    )
  }
})
