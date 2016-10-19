import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignsTable from './campaigns-table'

const CampaignsPage = React.createClass({
  getInitialState () {
    return { sort: { updatedAt: -1 }, selections: [] }
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  render () {
    const { onSortChange, onSelectionsChange } = this
    const { sort } = this.state

    return (
      <CampaignsTableContainer sort={sort} onSortChange={onSortChange} onSelectionsChange={onSelectionsChange} />
    )
  }
})

const CampaignsTableContainer = createContainer((props) => {
  Meteor.subscribe('medialists')
  const campaigns = window.Medialists.find({}, { sort: props.sort }).fetch()
  return { ...props, campaigns }
}, CampaignsTable)

export default CampaignsPage
