import React, { PropTypes } from 'react'

export default React.createClass({
  propTypes: {
    clients: PropTypes.array.isRequired,
    updateField: PropTypes.func.isRequired,
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  },
  getInitialState () {
    return {suggestions: []}
  },
  componentWillReceiveProps (props) {
    const { getSuggestions } = this
    const { name, value, updateField } = props
    if (!value) return
    const suggestions = getSuggestions(value)
    this.setState({suggestions})
    if (suggestions.length === 0) updateField(name, value.substring(0, value.length - 1))
  },
  getSuggestions (value) {
    return this.props.clients.filter((client) => {
      return client.name.toLowerCase().slice(0, value.length) === value.toLowerCase()
    })
  },
  selectValue (value) {
    const { name, updateField } = this.props
    updateField(name, value.name)
  },
  resetField (value) {
    value = value || ''
    const { name, updateField } = this.props
    updateField(name, value)
  },
  onFocus () {
    this.resetField()
  },
  onBlur () {
    setTimeout(() => {
      const { name, value, clients, updateField } = this.props
      this.setState({suggestions: []})
      const client = clients.filter((c) => c.name.toLowerCase() === value.toLowerCase())
      if (client.length === 0) updateField(name, '')
    }, 250)
  },
  render () {
    const { selectValue, onFocus, onBlur } = this
    const { suggestions } = this.state
    const {
      className,
      name,
      value
    } = this.props
    const style = {
      borderBottom: '1px dashed',
      width: '33%'
    }

    return (
      <div className='relative'>
        <input
          className={className}
          name={name}
          value={value}
          placeholder='Client'
          autoComplete='off'
          onFocus={onFocus}
          onBlur={onBlur} />
        {suggestions.length !== 0 &&
          <ul className='absolute list-reset center width-100'>
            {suggestions.map((client, i) => {
              return <li
                className='pointer bg-white center border-bottom border-gray80 py2 px4 my1 mx-auto shadow-2'
                key={client._id}
                onClick={selectValue.bind(null, client)}
                tabIndex={i}
                style={style}>{client.name}</li>
            })}
          </ul>
        }
      </div>
    )
  }
})
