import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignsTable from './campaigns-table'

const CampaignsPage = React.createClass({
  getInitialState () {
    return { sort: { updatedAt: -1 } }
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  render () {
    const { onSortChange } = this
    const { sort } = this.state

    return (
      <CampaignsTableContainer sort={sort} onSortChange={onSortChange} />
    )
  }
})

const CampaignsTableContainer = createContainer((props) => {
  Meteor.subscribe('medialists')
  const campaigns = window.Medialists.find({}, { sort: props.sort }).fetch()
  return { ...props, campaigns }
}, CampaignsTable)

export default CampaignsPage
