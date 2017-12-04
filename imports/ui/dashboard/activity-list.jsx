import React from 'react'
import PropTypes from 'prop-types'
import { DataDam } from 'react-data-dam'
import { LoadingBar } from '/imports/ui/lists/loading'
import * as PostMap from '/imports/ui/posts/post'
import ShowUpdatesButton from '/imports/ui/lists/show-updates-button'
import { createdByUserAutoRelease } from '/imports/ui/lists/data-dam'

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
      <DataDam data={items} flowing={loading} autoRelease={createdByUserAutoRelease}>
        {(items, diff, release) => (
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
                  currentUser={currentUser}
                  contact={contact}
                  campaign={campaign}
                  editable={editable}
                />
              )
            })}
            { loading && <LoadingBar /> }
            <ShowUpdatesButton data={items} diff={diff} onClick={release} />
          </div>
        )}
      </DataDam>
    )
  }
})

export default ActivityList
