import React, { PropTypes } from 'react'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    updateField: PropTypes.func.isRequired,
    className: PropTypes.string
  },
  getInitialState () {
    return {suggestions: []}
  },
  onChange (evt) {
    const { name, value } = evt.target
    const suggestions = this.getSuggestions(value)
    this.setState({suggestions})
    this.props.updateField(name, value)
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value
    })
  },
  selectClient (field, value) {
    this.props.updateField(field, value.name)
    this.setState({suggestions: []})
  },
  onFocus () {
    const field = this.props.name
    const value = ''
    this.setState({suggestions: []})
    this.props.updateField(field, value)
  },
  render () {
    const { onChange, selectClient, onFocus } = this
    const { suggestions } = this.state
    const {
      className,
      name,
      value
    } = this.props

    return (
      <div>
        <input
          className={className}
          name={name}
          onChange={onChange}
          value={value}
          autoComplete='off'
          onFocus={onFocus}
        />
        {suggestions.length > 0 && <ul className='block list-reset width-100 center'>
          {suggestions.map((client, i) => {
            return <li className='input-inline pointer hover-bg-blue center border-gray80 p2 mx2' key={client._id} onClick={selectClient.bind(null, name, client)} tabIndex={i}>{client.name}</li>
          })}
        }
        </ul>}
      </div>
    )
  }
})
