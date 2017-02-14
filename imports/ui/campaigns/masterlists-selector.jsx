import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'

const MasterListsSelector = React.createClass({
  getInitialState () {
    return {
      hideItemsAfterIndex: null,
      showMoreOpen: false
    }
  },
  componentDidUpdate () {
    if (this.state.hideItemsAfterIndex) return
    const { clientWidth } = this.containerEl
    const hideItemsAfterIndex = this.itemElements
      .filter((el) => !!el)
      .findIndex((el) => el.getBoundingClientRect().right > clientWidth - 80)
    this.setState((s) => {
      return s.hideItemsAfterIndex === hideItemsAfterIndex ? {} : {hideItemsAfterIndex}
    })
  },
  render () {
    const { items, selectedSlug, onChange } = this.props
    const { hideItemsAfterIndex, showMoreOpen } = this.state
    const visibleItems = hideItemsAfterIndex ? items.slice(0, hideItemsAfterIndex) : items
    const moreItems = hideItemsAfterIndex ? items.slice(hideItemsAfterIndex, items.length) : []
    this.itemElements = []
    return (
      <nav className='block px4' ref={(el) => { this.containerEl = el }}>
        <div className='nowrap'>
          {visibleItems.map((item) =>
            <div className='inline-block' ref={(el) => { this.itemElements.push(el) }} >
              <Item
                count={item.count}
                selected={item.slug === selectedSlug}
                onClick={() => onChange(item.slug)}
                key={item.slug}>
                {item.name}
              </Item>
            </div>
          )}
          {hideItemsAfterIndex &&
            <Dropdown>
              <Item selected={showMoreOpen} onClick={() => this.setState({showMoreOpen: true})}>
                <span>More <ChevronDown /></span>
              </Item>
              <DropdownMenu width={334} left={-200} top={-20} open={showMoreOpen} onDismiss={() => this.setState({showMoreOpen: false})}>
                <nav>
                  <div className='py2' />
                  {moreItems.map((item) =>
                    <div
                      className='py1 pl4 hover-bg-blue hover-color-trigger hover-bg-trigger'
                      onClick={() => onChange(item.slug)}
                      key={item.slug}>
                      <div className='inline-block f-md semibold gray40 hover-white'>{item.name}</div>
                      <div className='inline-block px1 py-2px ml1 f-xs rounded gray60 bg-gray90 hover-blue hover-bg-white'>{item.count}</div>
                    </div>
                  )}
                  <div className='py2 mt3 bg-gray90 center'>
                    <Link to='/settings' className='underline f-xs gray40'>Manage Master Lists</Link>
                  </div>
                </nav>
              </DropdownMenu>
            </Dropdown>
          }
        </div>
      </nav>
    )
  }
})

MasterListsSelector.defaultProps = {
  selectedSlug: 'all'
}

MasterListsSelector.propTypes = {
  items: PropTypes.array.isRequired,
  selectedSlug: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

export default MasterListsSelector

const Item = ({children, count, selected, onClick}) => (
  <div className={`inline-block p4 semibold ${selected ? 'shadow-inset-blue' : 'pointer gray40'}`} onClick={onClick}>
    <div className={`inline-block f-sm ${selected ? 'blue' : 'gray40'}`}>
      {children}
    </div>
    {count > -1 &&
      <div className={`inline-block px1 py-2px ml1 f-xs rounded ${selected ? 'white bg-blue' : 'gray60 bg-gray90'}`}>
        {count}
      </div>
    }
  </div>
)
