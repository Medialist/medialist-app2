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
    return {
      open: false
    }
  },
  componentWillReceiveProps (props) {
    const { setFieldValue } = this
    const { value } = props
    if (!value) return
    setFieldValue(value)
  },
  setFieldValue (value) {
    const { getSuggestions } = this
    const { name, updateField } = this.props
    const suggestions = getSuggestions(value)
    this.setState({suggestions})
    if (suggestions.length === 0) updateField(name, value.substring(0, value.length - 1))
    if (value.toLowerCase() === suggestions[0].name.toLowerCase()) this.setState({suggestions: []})
  },
  selectValue (value) {
    const { updateField } = this.props
    updateField('clientName', value.name)
    setTimeout(() => updateField('clientId', value._id), 0)
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
          <ul className='list-reset absolute mx-auto bg-white shadow-2 border border-gray80' style={{width: '33%', transform: 'translate(100%)'}}>
            {suggestions.map((client, i) => {
              return <li
                className='py2 px4 my1 pointer left-align gray90 f-sm'
                key={client._id}
                onClick={selectValue.bind(null, client)}
                tabIndex={i}>{client.name}</li>
            })}
          </ul>
        }
      </div>
    )
  }
})
