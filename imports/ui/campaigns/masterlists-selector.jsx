import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import debounce from 'lodash.debounce'
import { ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'

const MasterListsSelector = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    selectedSlug: PropTypes.string,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      hideItemsAfterIndex: null,
      showMoreOpen: false
    }
  },
  resetState () {
    this.setState({
      hideItemsAfterIndex: null,
      showMoreOpen: false
    })
  },
  onItemClick (evt) {
    const slug = evt.currentTarget.dataset.slug
    this.props.onChange(slug)
  },
  onMenuClick (evt) {
    const slug = evt.currentTarget.dataset.slug
    this.setState({showMoreOpen: false})
    this.props.onChange(slug)
  },
  componentDidMount () {
    this.onResize = debounce(this.resetState, 100)
    window.addEventListener('resize', this.onResize)
    this.calculateSize()
  },
  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  },
  componentDidUpdate () {
    this.calculateSize()
  },
  calculateSize () {
    if (this.state.hideItemsAfterIndex !== null) return
    const {items} = this.props
    const itemWidthBuffer = 180
    const maxWidth = this.containerEl.clientWidth - itemWidthBuffer
    let hideItemsAfterIndex = this.itemElements
      .findIndex((el) => el.getBoundingClientRect().right > maxWidth)
    if (hideItemsAfterIndex === -1) hideItemsAfterIndex = items.length
    if (hideItemsAfterIndex === this.state.hideItemsAfterIndex) return
    this.setState({ hideItemsAfterIndex })
  },
  render () {
    const { type, items, selectedSlug } = this.props
    const { hideItemsAfterIndex, showMoreOpen } = this.state
    const visibleItems = hideItemsAfterIndex ? items.slice(0, hideItemsAfterIndex) : items
    const moreItems = hideItemsAfterIndex ? items.slice(hideItemsAfterIndex) : []
    const selectedIndex = moreItems.findIndex((i) => i.slug === selectedSlug)
    if (selectedIndex > -1) {
      // Swap the selected item out of the hidden list for the item at the end of the visible list
      const [selectedItem] = moreItems.splice(selectedIndex, 1)
      const [itemToSwap] = visibleItems.splice(-1, 1, selectedItem)
      moreItems.unshift(itemToSwap)
    }
    const settingsUrl = `/settings/${type.toLowerCase()}-master-lists`
    return (
      <nav className='block px4' ref={(el) => { this.containerEl = el }}>
        <div className={`nowrap ${hideItemsAfterIndex === null ? 'opacity-0' : ''}`}>
          {moreItems.length === 0 &&
            <Link to={settingsUrl} className='right inline-block p4 align-middle f-xs underline gray40 hover-blue'>
              Manage Master Lists
            </Link>
          }
          {visibleItems.map((item, i) =>
            <div className='inline-block' ref={(el) => {
              if (i === 0) this.itemElements = []
              this.itemElements.push(el)
            }} key={item.slug} >
              <Item
                slug={item.slug}
                count={item.count}
                selected={item.slug === selectedSlug}
                onClick={this.onItemClick} >
                {item.name}
              </Item>
            </div>
          )}
          {moreItems.length > 0 &&
            <Dropdown>
              <Item selected={showMoreOpen} onClick={() => this.setState({showMoreOpen: true})}>
                <span className='pl2'>More <ChevronDown /></span>
              </Item>
              <DropdownMenu width={334} left={-200} top={-20} open={showMoreOpen} onDismiss={() => this.setState({showMoreOpen: false})}>
                <nav>
                  <div className='py2' />
                  {moreItems.map((item) =>
                    <MenuItem key={item.slug} onClick={this.onMenuClick} {...item} />
                  )}
                  <div className='py2 mt3 bg-gray90 center'>
                    <Link
                      to={settingsUrl}
                      className='underline f-xs gray40'>Manage Master Lists</Link>
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

export default MasterListsSelector

const Item = ({children, slug, count, selected, onClick}) => (
  <div
    className={`inline-block p4 semibold ${selected ? 'shadow-inset-blue' : 'pointer gray40'}`}
    data-slug={slug}
    onClick={onClick}>
    <div style={{maxWidth: 140}} className={`inline-block align-middle truncate f-sm ${selected ? 'blue' : 'gray40'}`}>
      {children}
    </div>
    {count > -1 &&
      <div className={`inline-block px1 py-2px ml1 f-xs rounded ${selected ? 'white bg-blue' : 'gray60 bg-gray90'}`}>
        {count}
      </div>
    }
  </div>
)

const MenuItem = ({name, count, slug, onClick}) => (
  <div
    data-slug={slug}
    className='py1 pl4 pointer hover-bg-blue hover-color-trigger hover-bg-trigger'
    onClick={onClick}>
    <div style={{maxWidth: 280}} className='inline-block truncate align-middle f-md semibold gray40 hover-white'>{name}</div>
    <div className='inline-block px1 py-2px ml1 f-xs rounded gray60 bg-gray90 hover-blue hover-bg-white'>{count}</div>
  </div>
)
