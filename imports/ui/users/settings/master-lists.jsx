import React, { PropTypes } from 'react'
import { MenuCampaignIcon, DeleteIcon } from '../../images/icons'
import insertRuler from './insert-ruler'

const SettingsMasterLists = ({ masterlists }) => {
  return (
    <article className='pt4'>
      <div className='flex justify-center my4'>
        <div className='svg-icon blue'>
          <svg width='21' height='21' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'>
            <path d='M14.929 9A7.012 7.012 0 0 1 9 14.929V9h5.929zm0-2C14.443 3.613 11.526 1 8 1 4.142 1 1 4.134 1 8a7.008 7.008 0 0 0 6 6.929V8c0-.552.446-1 .998-1h6.93z' />
          </svg>
        </div>
      </div>
      <div className='flex justify-center my4 bold f-xl'>Campaign Lists</div>
      <div className='flex justify-center my4'>
        <p className='max-width-2 center'>Campaign Lists help keep your Campaigns organised. Look for them across the top of the Campaigns page.</p>
      </div>
      {insertRuler()}
      <MasterLists masterlists={masterlists} />
    </article>
  )
}

const EmptyMasterLists = (creating, onCreate) => {
  return (
    <div className='flex flex-column justify-start items-center' style={{height: 200}}>
      <div className='svg-icon blue mt4 mb3'>
        <svg width='21' height='21' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'>
          <g fill-rule='evenodd'>
            <path d='M3.775 5h-1.78C1.455 5 1 5.446 1 5.995v8.01c0 .54.446.995.995.995h8.01c.529 0 .977-.428.994-.963l-8.037-2.154a.995.995 0 0 1-.704-1.22L3.775 5z' /><rect transform='rotate(15 9.611 6.911)' x='5.111' y='2.411' width='9' height='9' rx='1' />
          </g>
        </svg>
      </div>
      <div className='mt3 mb1 center'>You have not created any Campaign Lists yet</div>
      <div className='mb3 center blue underlined pointer' onClick={onCreate}>Create a Campaign List</div>
    </div>
  )
}

const MasterLists = React.createClass({
  propTypes: {
    masterlists: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      creating: false,
      editing: false,
      masterlists: this.props.masterlists.reduce((keyValues, listItem) => {
        keyValues[listItem.slug] = listItem.name
        return keyValues
      }, {})
    }
  },
  onCreate () {
    this.setState({creating: true})
  },
  onChange (slug, value) {
    if (slug === value) return
    if (!this.state.editing) this.setState({editing: true})
    this.setState({masterlists: { [slug]: value }})
  },
  onUpdate (slug) {
    console.log('update', { slug, name: this.state.medialists[slug] })
    this.setState({editing: false})
  },
  removeMasterList (slug) {
    console.log('remove', slug)
  },
  render () {
    const { removeMasterList, onChange, onUpdate, onCreate } = this
    const { editing } = this.state
    const { masterlists } = this.props

    if (masterlists.length < 1) {
      return (
        <EmptyMasterLists onCreate={onCreate} />
      )
    } else {
      return (
        <div className='mx3 pb3'>
          <div className='flex justify-start align-middle p2 mb1'>
            <div className='bold flex-none'>Campaign Lists ({masterlists.length})</div>
            <div className='flex-auto blue underline right-align pointer'>Add new Campaign List</div>
          </div>
          {
            masterlists.map((masterlist) => {
              const { name, slug, items } = masterlist
              return (
                <div className='flex justify-start items-center p2 my1 border border-gray80 bg-gray90 gray60' key={name}>
                  <input className='input max-width-sm ml2' defaultValue={this.state.masterlists[slug]} onChange={(e) => onChange(slug, e.target.value)} />
                  <div className='flex-none mx3 right-align' style={{width: 10}}>{items}</div>
                  <MenuCampaignIcon className='ml2 flex-none' />
                  {editing ? <button className='btn bg-completed white mt3 mb2' onClick={() => onUpdate(slug)}>Save Changes</button> : <DeleteIcon className='flex-auto right-align mr2' onClick={() => removeMasterList(slug)} />}
                </div>
              )
            })
          }
        </div>
      )
    }
  }
})

SettingsMasterLists.propTypes = {
  user: PropTypes.object,
  masterlists: PropTypes.array
}

export default SettingsMasterLists
