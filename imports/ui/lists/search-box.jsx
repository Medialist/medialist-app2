import React, { PropTypes } from 'react'

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
    this.setState({ term: e.target.value })
    this.props.onTermChange(e.target.value)
  },

  render () {
    return (
      <input
        type='search'
        className='input mb0'
        onChange={this.onChange}
        value={this.state.term}
        placeholder={this.props.placeholder} />
    )
  }
})

export default SearchBox
