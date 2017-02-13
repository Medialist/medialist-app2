import React, { PropTypes } from 'react'

const MasterListsSelector = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    selected: PropTypes.object,
    onSectorChange: PropTypes.func.isRequired
  },
  render () {
    const { items, selected, onSectorChange } = this.props
    return (
      <nav className='block px4'>
        <div className='nowrap truncate'>
          {items.map((item) =>
            <Item
              key={item.slug}
              name={item.name}
              count={item.count}
              selected={selected && item.slug === selected.slug}
              onClick={() => onSectorChange(item)} />
          )}
        </div>
      </nav>
    )
  }
})

const Item = ({name, count, selected, onClick}) => (
  <div className={`inline-block p4 semibold ${selected ? 'shadow-inset-blue' : 'pointer gray40'}`} onClick={onClick}>
    <div className={`inline-block mr1 f-sm ${selected ? 'blue' : 'gray40'}`}>
      {name}
    </div>
    <div className={`inline-block px1 py-2px f-xs rounded ${selected ? 'white bg-blue' : 'gray60 bg-gray90'}`}>
      {count}
    </div>
  </div>
)

export default MasterListsSelector
