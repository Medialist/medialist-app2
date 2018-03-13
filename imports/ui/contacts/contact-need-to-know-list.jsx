import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '/imports/ui/images/avatar'
import Time from '/imports/ui/time/time'
import { PinIcon } from '/imports/ui/images/icons'
import { unpinPost } from '/imports/api/posts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import Tooltip from '/imports/ui/navigation/tooltip'

class ContactNeedToKnowList extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    snackbar: PropTypes.object.isRequired
  }

  state = { showAll: false }

  onShowAllClick = (e) => {
    e.preventDefault()
    this.setState({ showAll: true })
  }

  onUnpin = (item) => {
    unpinPost.call({ _id: item._id }, (err) => {
      if (err) {
        this.snackbar.error('unpin-post-failure')
        return console.error(err)
      }
      this.snackbar.show('Unpinned need-to-know')
    })
  }

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
          {displayItems.map(item => (
            <NeedToKnowItem key={item._id} item={item} onUnpin={this.onUnpin} />
          ))}
        </ul>
        {showAll === false && items.length > displayItems.length &&
          <footer className='center border-gray80 border-top pt2 pb3'>
            <a href='#' className='block tangerine semibold f-sm' onClick={this.onShowAllClick}>Show all</a>
          </footer>}
      </aside>
    )
  }
}

export default withSnackbar(ContactNeedToKnowList)

const NeedToKnowItem = ({ item, onUnpin }) => {
  const { message, createdAt, createdBy } = item

  const onUnpinClick = (e) => {
    e.preventDefault()
    onUnpin(item)
  }

  return (
    <li className='pt4'>
      <div className='flex'>
        <div className='flex-none pr4'>
          <CircleAvatar size={38} avatar={createdBy.avatar} name={createdBy.name} />
        </div>
        <div className='flex-auto'>
          <div className='gray10' style={{overflowX: 'hidden'}}>{message}</div>
          <Time className='gray60 f-sm mr1' date={createdAt} />
          <button className='Tooltip pointer border-none bg-transparent p0 gray60 hover-orange' onClick={onUnpinClick}>
            <Tooltip title='Unpin need-to-know'>
              <PinIcon style={{width: '16px', height: '16px'}} />
            </Tooltip>
          </button>
        </div>
      </div>
    </li>
  )
}
