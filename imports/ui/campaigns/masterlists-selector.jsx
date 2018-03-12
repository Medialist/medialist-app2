import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import debounce from 'lodash.debounce'
import { ChevronDown } from '/imports/ui/images/icons'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'

class MasterListsSelector extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      hideItemsAfterIndex: null,
      showMoreOpen: false
    }
    this.resetState = this.resetState.bind(this)
  }

  resetState () {
    this.setState({
      hideItemsAfterIndex: null,
      showMoreOpen: false
    })
  }

  onItemClick (evt) {
    const slug = evt.currentTarget.dataset.slug
    this.props.onChange(slug)
  }

  onMenuClick (evt) {
    const slug = evt.currentTarget.dataset.slug
    this.setState({showMoreOpen: false})
    this.props.onChange(slug)
  }

  componentDidMount () {
    this.onResize = debounce(this.resetState, 100)
    window.addEventListener('resize', this.onResize)
    this.calculateSize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  componentDidUpdate () {
    this.calculateSize()
  }

  calculateSize () {
    if (this.state.hideItemsAfterIndex !== null) {
      return
    }

    if (!this.containerEl) {
      return
    }

    const {items} = this.props
    const itemWidthBuffer = 180
    const maxWidth = this.containerEl.clientWidth - itemWidthBuffer
    let hideItemsAfterIndex = this.itemElements
      .findIndex((el) => el.getBoundingClientRect().right > maxWidth)

    if (hideItemsAfterIndex === -1) {
      hideItemsAfterIndex = items.length
    }

    if (hideItemsAfterIndex === this.state.hideItemsAfterIndex) {
      return
    }

    this.setState({ hideItemsAfterIndex })
  }

  render () {
    const { type, items, selectedSlug } = this.props
    const { hideItemsAfterIndex, showMoreOpen } = this.state
    const visibleItems = hideItemsAfterIndex ? items.slice(0, hideItemsAfterIndex) : items
    const moreItems = hideItemsAfterIndex ? items.slice(hideItemsAfterIndex) : []
    const selectedIndex = moreItems.findIndex((i) => i.slug === selectedSlug)
    const settingsUrl = `/settings/${type.toLowerCase()}-master-lists`
    const scrollableHeight = Math.max(global.window && global.window.innerHeight - 310, 80)

    if (selectedIndex > -1) {
      // Swap the selected item out of the hidden list for the item at the end of the visible list
      const [selectedItem] = moreItems.splice(selectedIndex, 1)
      const [itemToSwap] = visibleItems.splice(-1, 1, selectedItem)
      moreItems.unshift(itemToSwap)
    }

    return (
      <nav className='block px4' ref={(el) => { this.containerEl = el }} data-id='masterlists-selector'>
        <div className={`nowrap ${hideItemsAfterIndex === null ? 'opacity-0' : ''}`}>
          {moreItems.length === 0 &&
            <Link to={settingsUrl} className='right inline-block p4 align-middle f-xs underline gray40 hover-blue'>
              Manage {this.props.type.substring(0, this.props.type.length - 1)} Lists
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
                onClick={(event) => this.onItemClick(event)} >
                {item.name}
              </Item>
            </div>
          )}
          {moreItems.length > 0 &&
            <Dropdown>
              <Item selected={showMoreOpen} onClick={() => this.setState({showMoreOpen: true})}>
                <span className='pl2' data-id='more'>More <ChevronDown /></span>
              </Item>
              <DropdownMenu width={334} left={-200} top={-20} arrowAlign='right' arrowMarginRight='75px' open={showMoreOpen} onDismiss={() => this.setState({showMoreOpen: false})}>
                <nav>
                  <div className='py2' style={{height: scrollableHeight, overflowY: 'scroll'}}>
                    {moreItems.map((item) =>
                      <MenuItem key={item.slug} onClick={(event) => this.onMenuClick(event)} {...item} />
                    )}
                  </div>
                  <div className='py2 bg-gray90 center'>
                    <Link
                      to={settingsUrl}
                      className='underline f-xs gray40'>Manage {this.props.type.substring(0, this.props.type.length - 1)} Lists</Link>
                  </div>
                </nav>
              </DropdownMenu>
            </Dropdown>
          }
        </div>
      </nav>
    )
  }
}

MasterListsSelector.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  selectedSlug: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

MasterListsSelector.defaultProps = {
  selectedSlug: 'all'
}

export default MasterListsSelector

const Item = ({children, slug, count, selected, onClick}) => (
  <div
    className={`inline-block p4 semibold ${selected ? 'shadow-inset-blue' : 'pointer gray40'}`}
    data-slug={slug}
    onClick={onClick}
    data-selected={selected}>
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

export const calculateResultTotal = (props) => {
  const { selectedSlug, items } = props
  return items.filter((item) => item.slug === selectedSlug)[0].count
}
