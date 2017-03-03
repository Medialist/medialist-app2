import React, { PropTypes } from 'react'
import Loading from '../lists/loading'
import * as PostMap from '../posts/post'

const ActivityList = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired,
    contact: PropTypes.object,
    campaign: PropTypes.object
  },

  render () {
    const { items, currentUser, contact, campaign, loading } = this.props
    if (!loading && !items.length) return <p className='p4 mb2 f-xl semibold center'>No items yet</p>
    return (
      <div style={{paddingBottom: 100}}>
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
              contact={contact}
              campaign={campaign}
            />
          )
        })}
        { loading && <div className='center p4'><Loading /></div> }
      </div>
    )
  }
})

export default ActivityList
