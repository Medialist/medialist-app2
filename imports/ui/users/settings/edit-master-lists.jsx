import React, { PropTypes } from 'react'
import { MenuCampaignIcon, DeleteIcon, FeedEditIcon } from '../../images/icons'
import Tooltip from '../../navigation/tooltip'

const EditMasterLists = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(['Contacts', 'Campaigns']),
    masterlists: PropTypes.array,
    onAddMasterList: PropTypes.func.isRequired,
    onUpdateMasterList: PropTypes.func.isRequired,
    onDeleteMasterList: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      creating: false,
      editing: null,
      masterlists: this.setMasterlists(this.props.masterlists)
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
    if (!name) return
    this.props.onAddMasterList({ type: this.props.type, name })
  },
  onChange (_id, value) {
    this.setState({masterlists: { [_id]: value }})
  },
  onUpdate (_id) {
    this.setState({ editing: null })
    this.props.onUpdateMasterList({ _id, name: this.state.masterlists[_id] })
  },
  onKeyDown (_id, key) {
    if (key === 'Enter' || key === 'Tab') this.onUpdate(_id)
  },
  isEditing (_id) {
    this.setState({ editing: _id })
  },
  render () {
    const { onCreate, showCreateMasterListInput } = this
    const { editing, creating } = this.state
    const { masterlists, onDeleteMasterList, type } = this.props
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
        <div className='mx3 pb3'>
          <div className='flex justify-start align-middle p2 mb2'>
            <div className='bold flex-none'>{typeAsSingular} Lists ({masterlists.length})</div>
            <div className='flex-auto blue underline right-align'>
              <span className='pointer' onClick={showCreateMasterListInput}>Add new {typeAsSingular} List</span>
            </div>
          </div>
          {creating && <CreateMasterListInput onCreate={onCreate} />}
          {masterlists.map((masterlist) => {
            return (
              <MasterListsItem
                key={masterlist._id}
                {...this}
                masterlist={masterlist}
                onDeleteMasterList={onDeleteMasterList}
                editing={editing} />
            )
          })}
        </div>
      )
    }
  }
})

export default EditMasterLists

const SaveBtn = ({_id, onUpdate}) => {
  return (
    <div className='flex-auto right-align'>
      <button className='btn bg-completed white' onClick={() => onUpdate(_id)}>Save Changes</button>
    </div>
  )
}

const EditDeleteBtns = ({_id, isEditing, onDeleteMasterList}) => {
  return (
    <div className='flex-auto right-align mr2'>
      <Tooltip title='Edit List'>
        <div className='inline-block mx-auto'>
          <FeedEditIcon className='mx2 gray60 hover-gray40' onClick={() => isEditing(_id)} />
        </div>
      </Tooltip>
      <Tooltip title='Delete List'>
        <div className='inline-block mx-auto'>
          <DeleteIcon className='mx2 gray60 hover-gray40' onClick={() => onDeleteMasterList(_id)} />
        </div>
      </Tooltip>
    </div>
  )
}

const EmptyMasterLists = ({type, creating, onCreate, showCreateMasterListInput}) => {
  const typeAsSingular = type.substring(0, type.length - 1)
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
          <MenuCampaignIcon className='blue svg-icon-lg mt4 mb3' />
          <div className='mt3 mb1 center'>You have not created any {typeAsSingular} Lists yet</div>
          <div className='mb3 center blue underlined pointer' onClick={showCreateMasterListInput}>Create a {typeAsSingular} List</div>
        </div>
      )}
    </div>
  )
}

const MasterListsItem = (props) => {
  const {masterlist, isEditing, onDeleteMasterList, onUpdate, onChange, onKeyDown, editing, state} = props
  const { _id, items } = masterlist

  return (
    <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60'>
      <input
        ref={(input) => input && editing === _id && input.focus()}
        className='input max-width-sm ml2'
        defaultValue={state.masterlists[_id]}
        disabled={_id !== editing}
        onChange={(e) => onChange(_id, e.target.value)}
        onBlur={() => onUpdate(_id)}
        onKeyDown={(e) => onKeyDown(_id, e.key)} />
      <div className='flex-none ml4 right-align gray40' style={{width: 20}}>{items.length}</div>
      <MenuCampaignIcon className='ml2 flex-none gray60' />
      {editing === _id ? <SaveBtn _id={_id} onUpdate={onUpdate} /> : <EditDeleteBtns _id={_id} isEditing={isEditing} onDeleteMasterList={onDeleteMasterList} />}
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
    const { onCreate } = this.props
    return (
      <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60'>
        <input
          ref='input'
          className='input max-width-sm ml2'
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown} />
        <div className='flex-none ml4 right-align' style={{width: 20}}>0</div>
        <MenuCampaignIcon className='flex-none ml2' />
        <div className='flex-auto right-align'>
          <button className='btn bg-completed white' disabled={value.length === 0} onClick={() => onCreate(value)}>Add List</button>
        </div>
      </div>
    )
  }
})
