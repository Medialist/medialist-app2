import React, { PropTypes } from 'react'

const CampaignContactList = React.createClass({
  propTypes: {
    items: PropTypes.array
  },

  getInitialState () {
    return { showAll: false }
  },

  onShowAllClick (e) {
    e.preventDefault()
    this.setState({ showAll: true })
  },

  render () {
    let { items } = this.props
    const { showAll } = this.state
    const displayItems = showAll ? items : items.slice(0, 5)

    return (
      <aside className='bg-orange-light mb4 p4 shadow-2'>
        <header className='border-gray80 border-bottom'>
          <h1 className='m0 pb3 f-md semibold gray20'>
            {items.length && <span className='bg-orange white mr1 py1 px2 rounded f-xxs'>{items.length}</span>} Contacts
          </h1>
        </header>
        <ul className='list-reset'>
        </ul>
        {showAll === false && items.length > displayItems.length &&
          <footer className='center border-gray80 border-top pt3'>
            <a href='#' className='block orange' onClick={this.onShowAllClick}>Show all</a>
          </footer>}
      </aside>
    )
  }
})

export default CampaignContactList
