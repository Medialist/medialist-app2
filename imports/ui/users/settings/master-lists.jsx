import React, { PropTypes } from 'react'
import { SectorIcon, MenuCampaignIcon, DeleteIcon, FeedEditIcon } from '../../images/icons'
import Tooltip from '../../navigation/tooltip'
import insertRuler from './insert-ruler'

const SettingsMasterLists = ({ masterlists }) => {
  return (
    <section className='pt4'>
      <div className='flex justify-center my4'>
        <SectorIcon className='blue svg-icon-lg' />
      </div>
      <div className='flex justify-center my4 bold f-xl'>Campaign Lists</div>
      <div className='flex justify-center my4'>
        <p className='max-width-2 center'>Campaign Lists help keep your Campaigns organised. Look for them across the top of the Campaigns page.</p>
      </div>
      {insertRuler()}
      <MasterLists masterlists={masterlists} />
    </section>
  )
}

SettingsMasterLists.propTypes = {
  user: PropTypes.object,
  masterlists: PropTypes.array
}

export default SettingsMasterLists

const EmptyMasterLists = ({creating, onCreate}) => {
  return (
    <div style={{height: 200}}>
      {creating ? (
        <CreateMasterListInput onCreate={onCreate} />
      ) : (
        <div className='flex flex-column justify-start items-center'>
          <MenuCampaignIcon className='blue svg-icon-lg mt4 mb3' />
          <div className='mt3 mb1 center'>You have not created any Campaign Lists yet</div>
          <div className='mb3 center blue underlined pointer' onClick={onCreate}>Create a Campaign List</div>
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
  componentDidMount () {
    this.refs.input.focus()
  },
  render () {
    const { onChange } = this
    const { value } = this.state
    const { onCreate } = this.props
    return (
      <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60'>
        <input ref='input' className='input max-width-sm ml2' value={value} onChange={onChange} />
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
    masterlists: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      creating: false,
      editing: null,
      masterlists: this.props.masterlists.reduce((keyValues, listItem) => {
        keyValues[listItem.slug] = listItem.name
        return keyValues
      }, {})
    }
  },
  onCreate (name) {
    this.setState({creating: true})
    if (!name) return
    console.log({ name })
    this.setState({creating: false})
  },
  onChange (slug, value) {
    this.setState({masterlists: { [slug]: value }})
  },
  onUpdate (slug) {
    this.setState({ editing: null })
    console.log({ name: this.state.masterlists[slug] })
  },
  onKeyDown (slug, key) {
    if (key === 'Enter' || key === 'Tab') this.onUpdate(slug)
  },
  isEditing (slug) {
    this.setState({ editing: slug })
  },
  removeMasterList (slug) {
    console.log('remove', slug)
  },
  componentDidUpdate () {
    if (!this.state.editing) return
    this.refs[this.state.editing].focus()
  },
  render () {
    const { removeMasterList, onChange, onUpdate, onKeyDown, isEditing, onCreate } = this
    const { editing, creating } = this.state
    const { masterlists } = this.props

    if (masterlists.length < 1) {
      return <EmptyMasterLists creating={creating} onCreate={onCreate} />
    } else {
      return (
        <div className='mx3 pb3'>
          <div className='flex justify-start align-middle p2 mb1'>
            <div className='bold flex-none'>Campaign Lists ({masterlists.length})</div>
            <div className='flex-auto blue underline right-align pointer' onClick={(e) => onCreate()}>Add new Campaign List</div>
          </div>
          {creating && <CreateMasterListInput onCreate={onCreate} />}
          {
            masterlists.map((masterlist) => {
              const { name, slug, items } = masterlist
              return (
                <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60' key={name}>
                  <input
                    ref={slug}
                    className='input max-width-sm ml2'
                    defaultValue={this.state.masterlists[slug]}
                    disabled={slug !== editing}
                    onChange={(e) => onChange(slug, e.target.value)}
                    onBlur={() => onUpdate(slug)}
                    onKeyDown={(e) => onKeyDown(slug, e.key)} />
                  <div className='flex-none ml4 right-align gray40' style={{width: 20}}>{items}</div>
                  <MenuCampaignIcon className='ml2 flex-none gray60' />
                  {
                    editing === slug ? (
                      <div className='flex-auto right-align'>
                        <button className='btn bg-completed white' onClick={() => onUpdate(slug)}>Save Changes</button>
                      </div>
                    ) : (
                      <div className='flex-auto right-align'>
                        <Tooltip title='Edit List'>
                          <FeedEditIcon className='mr2 gray60 hover-gray40' onClick={(e) => isEditing(slug)} />
                        </Tooltip>
                        <DeleteIcon className='mr4 gray60' onClick={() => removeMasterList(slug)} />
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
