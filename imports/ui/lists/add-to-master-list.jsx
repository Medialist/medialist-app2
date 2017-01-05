import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'
import find from 'lodash.find'
import { Check } from '../images/icons'

const AddCampaignToMasterList = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    currentlyBelongsTo: PropTypes.array,
    masterLists: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired
  },
  getInitialState () {
    const { masterLists, currentlyBelongsTo } = this.props
    return { selectableList: markSelected(masterLists, currentlyBelongsTo) }
  },
  render () {
    if (!this.props.open) return null
    const { title, onDismiss } = this.props
    const { selectableList } = this.state

    return (
      <div>
        <div className='py6 center'>
          <span className='f-lg'>Add {title} to a Master List</span>
        </div>
        <div className='bg-gray90 border-top border-gray80 p2 flex flex-wrap'>
          {selectableList.map((item, key) => <MasterListBtn item={item} key={key} title={title} />)}
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right'>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
            <button className='btn bg-transparent blue'>Manage Master Lists</button>
          </div>
        </div>
      </div>
    )
  }
})

const MasterListBtn = React.createClass({
  propTypes: {
    item: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      showCount: false
    }
  },
  onMouseEnter () {
    this.setState({showCount: true})
  },
  onMouseLeave () {
    this.setState({showCount: false})
  },
  render () {
    const { onMouseEnter, onMouseLeave } = this
    const { showCount } = this.state
    const { item, key, title, onSelect } = this.props
    const btnStyle = item.selected ? 'border-blue bg-blue white shadow-1' : 'border-gray80 bg-white gray20'

    return (
      <div className='p2' style={{width: '25%'}} key={key}>
        <div className={`width-100 relative border ${btnStyle} hover-border-blue`} style={{borderRadius: 8}}>
          {item.selected && <Check className='absolute top-0 right-0' style={{marginRight: 6}} />}
          <div className='table center' style={{height: 80}}>
            <div className='table-cell align-middle normal f-lg pointer' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={() => onSelect(item)}>
              <label className='block mb1 pointer'>{item.label}</label>
              {item.count &&
                <label className={`f-xxs ${item.selected ? 'white opacity-50' : 'blue'} ${showCount ? 'block' : 'hide'}`}>
                  {item.count} {title.toLowerCase()}s
                </label>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
})

function markSelected (masterLists, currentlyBelongsTo) {
  return masterLists.map((item) => {
    item.selected = !!find(currentlyBelongsTo, {slug: item.slug})
    return item
  })
}

export default Modal(AddCampaignToMasterList)
