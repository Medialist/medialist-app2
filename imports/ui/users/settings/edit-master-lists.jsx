import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { MenuCampaignIcon, MenuContactIcon, DeleteIcon, FeedEditIcon } from '/imports/ui/images/icons'
import Tooltip from '/imports/ui/navigation/tooltip'
import DeleteListsModal from '/imports/ui/users/settings/delete-lists-modal'

const EditMasterLists = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(['Contacts', 'Campaigns']),
    masterlists: PropTypes.array,
    onAddMasterList: PropTypes.func.isRequired,
    onUpdateMasterList: PropTypes.func.isRequired
  },

  getInitialState () {
    return {
      creating: false,
      editing: null,
      masterlists: this.setMasterlists(this.props.masterlists),
      selections: [],
      deleteListsModal: false
    }
  },

  componentWillReceiveProps (props) {
    this.setState({
      masterlists: this.setMasterlists(props.masterlists)
    })
  },

  setMasterlists (masterlists) {
    if (!masterlists) return {}
    return masterlists.reduce((state, item) => {
      state[item._id] = item.name
      return state
    }, {})
  },

  showCreateMasterListInput () {
    this.setState({creating: true})
  },

  onCreate (name) {
    if (!name) {
      return
    }

    this.props.onAddMasterList({ type: this.props.type, name })
  },

  onChange (_id, value) {
    this.setState({masterlists: { [_id]: value }})
  },

  onUpdate (_id) {
    this.setState({ editing: null })
    this.props.onUpdateMasterList({ _id, name: this.state.masterlists[_id], type: this.props.type })
  },

  isEditing (_id) {
    this.setState({ editing: _id })
  },

  showModal (modal) {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  },

  hideModals () {
    this.setState({
      deleteListsModal: false
    })
  },

  clearSelectionAndHideModals () {
    this.hideModals()
    this.clearSelection()
  },

  clearSelection () {
    this.setState({
      selections: []
    })
  },

  onDeleteMasterList (type, name, _id) {
    this.setState({
      selections: [{
        type, name, _id
      }]
    })
    this.showModal('deleteListsModal')
  },

  render () {
    const { onCreate, showCreateMasterListInput, isEditing, onUpdate, onChange, state } = this
    const masterListItemProps = { isEditing, onUpdate, onChange, state }
    const { editing, creating } = this.state
    const { masterlists, type } = this.props
    const typeAsSingular = type.substring(0, type.length - 1)
    if (!masterlists || masterlists.length < 1) {
      return (
        <EmptyMasterLists
          type={type}
          creating={creating}
          onCreate={onCreate}
          showCreateMasterListInput={showCreateMasterListInput} />
      )
    } else {
      return (
        <div className='mx3 pb3' data-id='edit-master-lists'>
          <div className='flex justify-start align-middle p2 mb2'>
            <div className='bold flex-none'>{typeAsSingular} Lists ({masterlists.length})</div>
            <div className='flex-auto blue underline right-align'>
              <span className='pointer' onClick={showCreateMasterListInput} data-id={`add-new-list-button`}>Add new {typeAsSingular} List</span>
            </div>
          </div>
          {creating && <CreateMasterListInput onCreate={onCreate} type={type} />}
          {masterlists.map((masterlist) => {
            return (
              <MasterListsItem
                key={masterlist._id}
                {...masterListItemProps}
                masterlist={masterlist}
                onDeleteMasterList={this.onDeleteMasterList}
                editing={editing}
                type={this.props.type} />
            )
          })}
          <DeleteListsModal
            open={this.state.deleteListsModal}
            lists={this.state.selections}
            type={this.props.type.substring(0, this.props.type.length - 1).toLowerCase()}
            onDelete={() => this.clearSelectionAndHideModals()}
            onDismiss={() => this.hideModals()}
          />
        </div>
      )
    }
  }
})

export default EditMasterLists

const SaveBtn = ({type, name, _id, onUpdate}) => {
  return (
    <div className='flex-auto right-align'>
      <button className='btn bg-completed white' onClick={() => onUpdate(type, name, _id)} data-id='save-list-button'>Save Changes</button>
    </div>
  )
}

const EditDeleteBtns = ({type, name, _id, isEditing, onDeleteMasterList}) => {
  return (
    <div className='flex-auto right-align mr2'>
      <Tooltip title='Edit List'>
        <div className='inline-block mx-auto'>
          <FeedEditIcon className='mx2 gray60 hover-gray40' onClick={() => isEditing(_id)} data-id='edit-list-button' />
        </div>
      </Tooltip>
      <Tooltip title='Delete List'>
        <div className='inline-block mx-auto'>
          <DeleteIcon className='mx2 gray60 hover-gray40' onClick={() => onDeleteMasterList(type, name, _id)} data-id='delete-list-button' />
        </div>
      </Tooltip>
    </div>
  )
}

const EmptyMasterLists = ({type, creating, onCreate, showCreateMasterListInput}) => {
  const typeAsSingular = type.substring(0, type.length - 1)
  const Icon = type === 'Campaigns' ? MenuCampaignIcon : MenuContactIcon
  return (
    <div style={{height: 200}}>
      {creating ? (
        <div className='mx3'>
          <div className='flex justify-start align-middle p2 mb2'>
            <div className='bold flex-none'>{typeAsSingular} Lists 0</div>
            <div className='flex-auto blue underline right-align'>
              <span className='pointer' onClick={showCreateMasterListInput}>Add new {typeAsSingular} List</span>
            </div>
          </div>
          <CreateMasterListInput onCreate={onCreate} />
        </div>
      ) : (
        <div className='flex flex-column justify-start items-center'>
          <Icon className='blue svg-icon-lg mt4 mb3' />
          <div className='mt3 mb1 center'>You have not created any {typeAsSingular} Lists yet</div>
          <div className='mb3 center blue underlined pointer' onClick={showCreateMasterListInput}>Create a {typeAsSingular} List</div>
        </div>
      )}
    </div>
  )
}

const MasterListsItem = (props) => {
  const {masterlist, isEditing, onDeleteMasterList, onUpdate, onChange, editing, state, type} = props
  const { _id, items } = masterlist
  const triggerUpdate = (_id, key) => { key === 'Enter' || key === 'Tab' ? onUpdate(_id) : null }
  const disabled = _id !== editing
  const Icon = type === 'Campaigns' ? MenuCampaignIcon : MenuContactIcon

  return (
    <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60' data-item={_id}>
      <input
        ref={(input) => input && editing === _id && input.focus()}
        className='input max-width-sm ml2'
        defaultValue={state.masterlists[_id]}
        disabled={disabled}
        onChange={(e) => onChange(_id, e.target.value)}
        onBlur={() => onUpdate(_id)}
        onKeyDown={(e) => triggerUpdate(_id, e.key)}
        data-id='list-name-input' />
      <div className='flex-none ml4 right-align gray40 hover-color-trigger'>
        <Link to={`/${masterlist.type.toLowerCase()}?list=${masterlist.slug}`} className='hover-blue'>
          {items.length}
          <Icon className='ml1 gray60 hover-blue' />
        </Link>
      </div>
      {!disabled ? <SaveBtn
        onUpdate={onUpdate}
        _id={_id}
        type={props.type}
        name={state.masterlists[_id]} /> : <EditDeleteBtns
          onDeleteMasterList={onDeleteMasterList}
          _id={_id} isEditing={isEditing}
          type={props.type}
          name={state.masterlists[_id]} />}
    </div>
  )
}

const CreateMasterListInput = React.createClass({
  propTypes: {
    onCreate: PropTypes.func.isRequired
  },
  getInitialState () {
    return { value: '' }
  },
  onChange (e) {
    const { value } = e.target
    this.setState({ value })
  },
  onBlur () {
    this.props.onCreate(this.state.value)
    this.setState({ value: '' })
  },
  onKeyDown (e) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      this.props.onCreate(this.state.value)
      this.setState({ value: '' })
      this.refs.input.focus()
    }
  },
  componentDidMount () {
    this.refs.input.focus()
  },
  render () {
    const { onChange, onBlur, onKeyDown } = this
    const { value } = this.state
    const { onCreate, type } = this.props
    const Icon = type === 'Campaigns' ? MenuCampaignIcon : MenuContactIcon
    return (
      <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60'>
        <input
          ref='input'
          className='input max-width-sm ml2'
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          data-id='add-new-list-input' />
        <div className='flex-none ml4 right-align'>
          0<Icon className='ml1 gray60' />
        </div>
        <div className='flex-auto right-align'>
          <button className='btn bg-completed white' disabled={value.length === 0} onClick={() => onCreate(value)} data-id='save-new-list-button'>Add List</button>
        </div>
      </div>
    )
  }
})
