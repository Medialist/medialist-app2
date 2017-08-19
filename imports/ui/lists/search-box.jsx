import React from 'react'
import PropTypes from 'prop-types'
import { SearchIcon } from '/imports/ui/images/icons'
import debounce from 'lodash.debounce'
import Loading from './loading'

const SearchBox = React.createClass({
  propTypes: {
    placeholder: PropTypes.string,
    initialTerm: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    children: PropTypes.node,
    style: PropTypes.object,
    'data-id': PropTypes.string
  },

  getDefaultProps () {
    return { initialTerm: '', placeholder: 'Search...' }
  },

  getInitialState () {
    return { term: this.props.initialTerm, isFocused: false }
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
        className='relative border py2 pr1 border-gray80'>
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
            style={{outline: 'none', height: 30, lineHeight: 30, backgroundColor: 'transparent'}}
            className='flex-auto f-lg normal gray20 placeholder-gray60'
            onChange={this.onChange}
            onKeyDown={onKeyDown}
            onFocus={() => this.setState({isFocused: true})}
            onBlur={() => this.setState({isFocused: false})}
            value={term}
            placeholder={placeholder}
            data-id={this.props['data-id']} />
        </div>
      </div>
    )
  }
})

export default SearchBox

export const SearchBoxCount = ({ type, loading, total }) => {
  const suffix = `${type}${total === 1 ? '' : 's'}`
  return (
    <div
      className='f-xs gray60'
      style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>
      { loading ? <Loading className='lolo-gray80' /> : null }
      { !loading && total ? <span>{total} {suffix}</span> : <span />}
    </div>
  )
}
