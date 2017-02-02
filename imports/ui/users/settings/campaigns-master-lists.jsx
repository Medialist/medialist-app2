import React, { PropTypes } from 'react'
import SettingsMasterList from './settings-master-lists'
import { MenuCampaignIcon, DeleteIcon, FeedEditIcon } from '../../images/icons'
import Tooltip from '../../navigation/tooltip'

const copy = 'Campaign Lists help keep your Campaigns organised. Look for them across the top of the Campaigns page.'

const CampaignsMasterLists = (props) => {
  return (
    <SettingsMasterList title='Campaign' copy={copy}>
      <MasterLists {...props} />
    </SettingsMasterList>
  )
}

export default CampaignsMasterLists

const EmptyMasterLists = ({creating, onCreate, showCreateMasterListInput}) => {
  return (
    <div style={{height: 200}}>
      {creating ? (
        <div className='mx3'>
          <div className='flex justify-start align-middle p2 mb2'>
            <div className='bold flex-none'>Campaign Lists 0</div>
            <div className='flex-auto blue underline right-align'>
              <span className='pointer' onClick={showCreateMasterListInput}>Add new Campaign List</span>
            </div>
          </div>
          <CreateMasterListInput onCreate={onCreate} />
        </div>
      ) : (
        <div className='flex flex-column justify-start items-center'>
          <MenuCampaignIcon className='blue svg-icon-lg mt4 mb3' />
          <div className='mt3 mb1 center'>You have not created any Campaign Lists yet</div>
          <div className='mb3 center blue underlined pointer' onClick={showCreateMasterListInput}>Create a Campaign List</div>
        </div>
      )}
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

const MasterLists = React.createClass({
  propTypes: {
    masterlists: PropTypes.array.isRequired,
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
    return masterlists.reduce((state, item) => {
      state[item._id] = item.name
      return state
    }, {})
  },
  showCreateMasterListInput () {
    this.setState({creating: true})
  },
  onCreate (name) {
    if (!name) return this.setState({creating: false})
    this.props.onAddMasterList({ type: 'Campaigns', name })
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
  componentDidUpdate () {
    if (!this.state.editing) return
    this.refs[this.state.editing].focus()
  },
  render () {
    const { onChange, onUpdate, onKeyDown, isEditing, onCreate, showCreateMasterListInput } = this
    const { editing, creating } = this.state
    const { masterlists, onDeleteMasterList } = this.props
    if (masterlists.length < 1) {
      return <EmptyMasterLists creating={creating} onCreate={onCreate} showCreateMasterListInput={showCreateMasterListInput} />
    } else {
      return (
        <div className='mx3 pb3'>
          <div className='flex justify-start align-middle p2 mb2'>
            <div className='bold flex-none'>Campaign Lists ({masterlists.length})</div>
            <div className='flex-auto blue underline right-align'>
              <span className='pointer' onClick={showCreateMasterListInput}>Add new Campaign List</span>
            </div>
          </div>
          {creating && <CreateMasterListInput onCreate={onCreate} />}
          {
            masterlists.map((masterlist) => {
              const { _id, items } = masterlist
              return (
                <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60' key={_id}>
                  <input
                    ref={_id}
                    className='input max-width-sm ml2'
                    value={this.state.masterlists[_id]}
                    disabled={_id !== editing}
                    onChange={(e) => onChange(_id, e.target.value)}
                    onBlur={() => onUpdate(_id)}
                    onKeyDown={(e) => onKeyDown(_id, e.key)} />
                  <div className='flex-none ml4 right-align gray40' style={{width: 20}}>{items.length}</div>
                  <MenuCampaignIcon className='ml2 flex-none gray60' />
                  {
                    editing === _id ? (
                      <div className='flex-auto right-align'>
                        <button className='btn bg-completed white' onClick={() => onUpdate(_id)}>Save Changes</button>
                      </div>
                    ) : (
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
                </div>
              )
            })
          }
        </div>
      )
    }
  }
})
