import React, { PropTypes } from 'react'
import { CircleAvatar } from '../images/avatar'
import FromNow from '../time/from-now'

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
      <aside className='bg-orange-light mb4 p4 shadow-2'>
        <header className='border-gray80 border-bottom'>
          <h1 className='m0 pb3 f-md semibold gray20'>
            {items.length && <span className='bg-orange white mr1 py1 px2 rounded f-xxs'>{items.length}</span>} Need-to-Knows
          </h1>
        </header>
        <ul className='list-reset'>
          {displayItems.map((i) => <NeedToKnowItem key={i._id} item={i} />)}
        </ul>
        {showAll === false && items.length > displayItems.length &&
          <footer className='center border-gray80 border-top pt3'>
            <a href='#' className='block orange' onClick={this.onShowAllClick}>Show all</a>
          </footer>}
      </aside>
    )
  }
})

export default ContactNeedToKnowList

const NeedToKnowItem = ({ item }) => {
  const { message, createdAt, createdBy } = item
  return (
    <li className='my3'>
      <div className='flex'>
        <div className='flex-none pr4'>
          <CircleAvatar avatar={createdBy.avatar} name={createdBy.name} />
        </div>
        <div className='flex-auto'>
          <div>{message}</div>
          <FromNow className='gray60 f-sm' date={createdAt} />
        </div>
      </div>
    </li>
  )
}
