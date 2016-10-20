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
    this.props.onTermChange(this.state.term)
  },

  render () {
    return (
      <div>
        <input
          type='search'
          onChange={this.onChange}
          value={this.state.term}
          placeholder={this.props.placeholder} />
      </div>
    )
  }
})

export default SearchBox
