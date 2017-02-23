import React, { PropTypes } from 'react'
import * as PostMap from '../posts/post'

const ActivityList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired,
    hideContact: PropTypes.bool,
    hideCampaign: PropTypes.bool
  },

  render () {
    const { items, currentUser, hideContact, hideCampaign } = this.props
    if (!items.length) return <p className='p4 mb2 f-xl semibold center'>No items yet</p>
    return (
      <div>
        {items.map((item) => {
          const Post = PostMap[item.type]
          if (!Post) {
            console.log(`ActivityList - No UI component found for Post type: "${item.type}". Ignoring.`)
            return ''
          }
          return (
            <Post
              key={item._id}
              item={item}
              currentUser={currentUser}
              hideContact={hideContact}
              hideCampaign={hideCampaign}
            />
          )
        })}
      </div>
    )
  }
})

export default ActivityList
