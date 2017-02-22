import React, { PropTypes } from 'react'
import { SearchIcon } from '../images/icons'
import debounce from 'lodash.debounce'

const SearchBox = React.createClass({
  propTypes: {
    placeholder: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    children: PropTypes.node,
    style: PropTypes.object
  },

  getDefaultProps () {
    return { placeholder: 'Search...' }
  },

  getInitialState () {
    return { term: '', isFocused: false }
  },

  onChange (e) {
    const value = e.target.value
    this.setState({ term: value })
    this.onTermChange(value)
  },

  componentWillMount () {
    this.onTermChange = debounce(this.props.onTermChange, 200, {maxWait: 600})
  },

  focus () {
    this.textInput.focus()
  },

  clear () {
    this.setState({term: ''})
  },

  render () {
    const { placeholder, children, onKeyDown, style } = this.props
    const { term, isFocused } = this.state
    return (
      <div
        style={{paddingLeft: 45, ...style}}
        className={`relative border py2 pr1 ${isFocused ? 'border-blue' : 'border-gray80'}`}>
        <SearchIcon
          style={{left: 20, top: 13}}
          className={`absolute f-lg mr2 ${isFocused ? 'blue' : 'gray20'}`} />
        <div className='flex flex-wrap items-start'>
          <div className='inline-block'>
            {children}
          </div>
          <input
            ref={(input) => { this.textInput = input }}
            type='search'
            style={{outline: 'none', height: 30, lineHeight: 30}}
            className='flex-auto f-lg normal gray20'
            onChange={this.onChange}
            onKeyDown={onKeyDown}
            onFocus={() => this.setState({isFocused: true})}
            onBlur={() => this.setState({isFocused: false})}
            value={term}
            placeholder={placeholder} />
        </div>
      </div>
    )
  }
})

export default SearchBox
