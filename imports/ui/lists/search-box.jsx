import React, { PropTypes } from 'react'
import { SearchDarkIcon } from '../images/icons'
import debounce from 'lodash.debounce'

const SearchBox = React.createClass({
  propTypes: {
    placeholder: PropTypes.string,
    onTermChange: PropTypes.func.isRequired
  },

  getDefaultProps () {
    return { placeholder: 'Search...' }
  },

  getInitialState () {
    return { term: '' }
  },

  onChange (e) {
    const value = e.target.value
    this.setState({ term: value })
    this.onTermChange(value)
  },

  componentWillMount () {
    this.onTermChange = debounce(this.props.onTermChange, 200, {maxWait: 600})
  },

  render () {
    return (
      <div className='flex items-center border border-gray80 p2'>
        <SearchDarkIcon className='flex-none f-lg ml1 mr2' />
        <input
          type='search'
          className='flex-auto pl1 mb0 f-lg normal gray20'
          onChange={this.onChange}
          value={this.state.term}
          placeholder={this.props.placeholder}
          style={{outline: 'none'}} />
      </div>
    )
  }
})

export default SearchBox
