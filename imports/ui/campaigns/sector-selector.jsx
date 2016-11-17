import React, { PropTypes } from 'react'

const SectorSelector = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    selected: PropTypes.object.isRequired,
    onSectorChange: PropTypes.func.isRequired
  },

  isSelected (item) {
    return item._id === this.props.selected._id
  },

  onClick (item) {
    this.props.onSectorChange(item)
  },

  renderSelectedItem (item) {
    return (
      <div key={item._id} className='inline-block pointer p4 shadow-inset-blue'>
        <div className='inline-block f-sm mr1 blue'>{item.name}</div>
        <div className='inline-block f-xs rounded white bg-blue px1 py-2px'>{item.count}</div>
      </div>
    )
  },

  renderItem (item) {
    return (
      <div key={item._id} className='inline-block pointer p4' onClick={this.onClick.bind(this, item)}>
        <div className='inline-block f-sm mr1 gray40'>{item.name}</div>
        <div className='inline-block f-xs rounded gray60 bg-gray90 px1 py-2px'>{item.count}</div>
      </div>
    )
  },

  render () {
    return (
      <nav className='block px4'>
        <div className='nowrap truncate'>
          {this.props.items.map((i) => this.isSelected(i) ? this.renderSelectedItem(i) : this.renderItem(i))}
        </div>
      </nav>
    )
  }
})

export default SectorSelector
