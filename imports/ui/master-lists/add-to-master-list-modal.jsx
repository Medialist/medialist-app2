import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import { Check } from '/imports/ui/images/icons'
import { createContainer } from 'meteor/react-meteor-data'
import MasterLists from '/imports/api/master-lists/master-lists'

class AddToMasterList extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    selectedMasterLists: PropTypes.array,
    allMasterLists: PropTypes.array.isRequired,
    type: PropTypes.oneOf(['Campaigns', 'Contacts']),
    title: PropTypes.string.isRequired,
    children: PropTypes.node
  }

  state = {
    selectedMasterLists: this.props.selectedMasterLists || []
  }

  onSelect (masterList) {
    this.setState((s) => ({
      selectedMasterLists: s.selectedMasterLists.concat([masterList])
    }))
  }

  onDeselect (masterList) {
    this.setState((s) => ({
      selectedMasterLists: s.selectedMasterLists.filter((m) => m._id !== masterList._id)
    }))
  }

  onSave () {
    this.props.onSave(this.state.selectedMasterLists)
    this.props.onDismiss()
  }

  render () {
    if (!this.props.open) {
      return null
    }

    const { type, title, allMasterLists, children } = this.props
    const { selectedMasterLists } = this.state

    const confirmText = `Add ${type.substring(0, this.props.items.length === 1 ? type.length - 1 : undefined)}`
    const scrollableHeight = Math.max(global.window && global.window.innerHeight - 360, 80)

    return (
      <div data-id='add-to-list-modal'>
        <div className='pt6 center'>
          <span className='f-xl'>{title}</span>
        </div>
        {children}
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}
          className='bg-gray90 shadow-inset-2 border-top border-gray80 mt6 p2 flex-wrap'>
          {!allMasterLists || allMasterLists.length === 0 && <EmptyMasterLists type={type} />}
          {allMasterLists && allMasterLists.map((item, ind) => (
            <MasterListBtn
              item={item}
              type={type}
              selected={selectedMasterLists.some((m) => item._id === m._id)}
              onSelect={(masterList) => this.onSelect(masterList)}
              onDeselect={(masterList) => this.onDeselect(masterList)}
              key={`${type}-${ind}`} />
          ))}
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={() => this.onSave()} data-id='add-to-list-modal-save-button'>{confirmText}</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={(event) => this.props.onDismiss(event)} data-id='add-to-list-modal-cancel-button'>Cancel</button>
            <Link to={`/settings/${type.toLowerCase()}-master-lists`} className='btn bg-transparent blue' data-id='add-to-list-modal-manage-lists-button'>Manage {this.props.type.substring(0, this.props.type.length - 1)} Lists</Link>
          </div>
        </div>
      </div>
    )
  }
}

const AddToMasterListContainer = createContainer(({open, type, ...props}) => {
  // master lists are subscribed to at the layout level
  const allMasterLists = open ? MasterLists.find({type}).fetch() : []
  return { open, type, allMasterLists, ...props }
}, AddToMasterList)

const AddToMasterListModal = Modal(AddToMasterListContainer, {
  width: 680,
  'data-id': 'delete-post-modal'
})

const MasterListBtn = ({item, type, selected, onSelect, onDeselect}) => {
  const { name, items } = item
  const selectedClasses = selected ? 'border-blue bg-blue white shadow-1' : 'border-gray80 bg-white gray20'
  return (
    <div className='p2 inline-block' style={{width: '25%'}}>
      <div className={`width-100 relative border hover-border-blue ${selectedClasses}`} style={{borderRadius: 8}}>
        {selected && <Check className='absolute top-0 right-0 white' style={{marginRight: 6}} />}
        <div className='center overflow-hidden' style={{height: 80}}>
          <div
            className='flex flex-column justify-center normal f-lg pointer px1 hover-display-trigger'
            style={{height: '100%'}}
            onClick={() => selected ? onDeselect(item) : onSelect(item)}
            data-id='master-list-button'
            data-item={item._id}>
            <label className='block mb1 pointer nowrap truncate'>{name}</label>
            <label style={{textTransform: 'lowercase'}} className={`display-none f-xxs pointer ${!selected && 'blue'} hover-display-block`}>
              {`${items.length} ${items.length === 1 ? type.substring(0, type.length - 1) : type}`}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyMasterLists = ({type}) => {
  return (
    <div className='mx-auto' style={{height: 321, paddingTop: 90}}>
      <div className='center'>Looks like there aren't any {type.substring(0, type.length - 1)} Lists yet…</div>
      <div className='center mt4'>
        <Link className='btn bg-blue-dark white' to={`/settings/${type.toLowerCase()}-master-lists`}>Create a {type.substring(0, type.length - 1)} List</Link>
      </div>
    </div>
  )
}

export default AddToMasterListModal
