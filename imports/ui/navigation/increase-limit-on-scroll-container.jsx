import React from 'react'
import NearBottomContainer from './near-bottom-container'
import SubscriptionLimitContainer from './subscription-limit-container'

export default (Component) => {
  return class IncreaseLimitOnScrollContainer extends React.Component {
    render () {
      return (
        <NearBottomContainer>
          {(nearBottom) => (
            <SubscriptionLimitContainer wantMore={nearBottom}>
              {(limit) => (
                <Component limit={limit} {...this.props} />
              )}
            </SubscriptionLimitContainer>
          )}
        </NearBottomContainer>
      )
    }
  }
}
