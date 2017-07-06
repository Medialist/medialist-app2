import React from 'react'
import PropTypes from 'prop-types'
import Loading from '/imports/ui/lists/loading'
import * as PostMap from '/imports/ui/posts/post'

class ActivityList extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired,
    contact: PropTypes.object,
    campaign: PropTypes.object,
    contacts: PropTypes.array,
    campaigns: PropTypes.array
  }

  render () {
    const { items, loading } = this.props
    if (!loading && !items.length) return <p className='p4 mb2 f-xl semibold center'>No items yet</p>
    return (
      <div style={{paddingBottom: 100}}>
        {items.map((item) => {
          const Post = PostMap[item.type]
          if (!Post) {
            console.log(`ActivityList - No UI component found for Post type: "${item.type}". Ignoring.`)
            return ''
          }
          const editable = ['FeedbackPost', 'CoveragePost', 'NeedToKnowPost'].indexOf(item.type) > -1
          return (
            <Post
              key={item._id}
              item={item}
              editable={editable}
              {...this.props} />
          )
        })}
        { loading && <div className='center p4'><Loading /></div> }
      </div>
    )
  }
}

export default ActivityList
