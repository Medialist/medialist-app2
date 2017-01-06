import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { SearchBlueIcon } from '../images/icons'
import Modal from '../navigation/modal'

const EditTeam = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object
  },

  getInitialState () {
    const { campaign } = this.props
    return { team: campaign.team || [] }
  },

  onSubmit (evt) {
    evt.preventDefault()
    this.props.onDismiss()
  },

  onReset () {
    this.props.onDismiss()
  },

  render () {
    const { open } = this.props
    if (!open) return null

    const { onSubmit, onReset, onSearch } = this

    return (
      <form onSubmit={onSubmit} onReset={onReset}>
        <div className='border-gray60 border-bottom'>
          <h1 className='f-xl normal center pt4 pb4'>Add Team Mates to this Campaign</h1>
        </div>
        <div className='py3 pl3 flex border-gray60 border-bottom'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find team mates' onChange={onSearch} style={{ outline: 'none' }} />
        </div>
        <div className='p4 right-align'>
          <button className='btn bg-transparent blue mr2 left' type='button' disabled>Manage Team Mates</button>
          <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
          <button className='btn bg-completed white' type='submit'>Save Changes</button>
        </div>
      </form>
    )
  }
})

export default Modal(EditTeam)
