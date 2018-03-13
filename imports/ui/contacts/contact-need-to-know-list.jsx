import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '/imports/ui/images/avatar'
import Time from '/imports/ui/time/time'

const ContactNeedToKnowList = React.createClass({
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
      <aside className='bg-orange-light mb4 shadow-2' style={{minHeight: 120}}>
        <header className='border-gray80 border-bottom'>
          <h1 className='m0 p4 f-md semibold gray20'>
            <span className='bg-tangerine white mr1 pill f-xxs'>{items.length}</span> Pinned need-to-knows
          </h1>
        </header>
        <ul className='list-reset px4 pb4 m0'>
          {displayItems.map((i) => <NeedToKnowItem key={i._id} item={i} />)}
        </ul>
        {showAll === false && items.length > displayItems.length &&
          <footer className='center border-gray80 border-top pt2 pb3'>
            <a href='#' className='block tangerine semibold f-sm' onClick={this.onShowAllClick}>Show all</a>
          </footer>}
      </aside>
    )
  }
})

export default ContactNeedToKnowList

const NeedToKnowItem = ({ item }) => {
  const { message, createdAt, createdBy } = item
  return (
    <li className='pt4'>
      <div className='flex'>
        <div className='flex-none pr4'>
          <CircleAvatar size={38} avatar={createdBy.avatar} name={createdBy.name} />
        </div>
        <div className='flex-auto'>
          <div className='gray10' style={{overflowX: 'hidden'}}>{message}</div>
          <Time className='gray60 f-sm' date={createdAt} />
        </div>
      </div>
    </li>
  )
}
