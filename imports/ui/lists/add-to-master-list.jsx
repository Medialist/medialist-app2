import React, {PropTypes} from 'react'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import { Check } from '../images/icons'

const AddCampaignToMasterList = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    selectedMasterLists: PropTypes.array,
    allMasterLists: PropTypes.array,
    title: PropTypes.string.isRequired
  },
  getInitialState () {
    return { selectableList: this.setSelectableList(this.props) }
  },
  componentWillReceiveProps (props) {
    this.setState({ selectableList: this.setSelectableList(props) })
  },
  setSelectableList ({ allMasterLists, selectedMasterLists }) {
    return allMasterLists.map((item) => {
      const selected = !!find(selectedMasterLists, {name: item.name})
      return { item, selected }
    })
  },
  onSelect (item) {
    item.selected = !item.selected
    const selectableList = this.state.selectableList.slice(0)
    const index = findIndex(selectableList, {item: {name: item.item.name}})
    selectableList[index] = item
    this.setState({ selectableList })
  },
  onSave () {
    const payload = this.state.selectableList
      .filter((item) => item.selected)
      .map((item) => item.item)
    this.props.onSave(payload)
    this.props.onDismiss()
  },
  render () {
    if (!this.props.open) return null
    const { onSelect, onSave } = this
    const { title, onDismiss } = this.props
    const { selectableList } = this.state

    return (
      <div>
        <div className='py6 center'>
          <span className='f-lg'>Add {title} to a Master List</span>
        </div>
        <div className='bg-gray90 border-top border-gray80 p2 flex flex-wrap'>
          {selectableList.map((item) => <MasterListBtn item={item} key={item._id} title={title} onSelect={onSelect} />)}
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={onSave}>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
            <Link to='/settings/sector' className='btn bg-transparent blue'>Manage Master Lists</Link>
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
  render () {
    const { item, title, onSelect } = this.props
    const { name, items, selected } = item
    const selectedClasses = selected ? 'border-blue bg-blue white shadow-1' : 'border-gray80 bg-white gray20'
    return (
      <div className='p2' style={{width: '25%'}}>
        <div className={`width-100 relative border ${selectedClasses} hover-border-blue hover-display-trigger`} style={{borderRadius: 8}}>
          {selected && <Check className='absolute top-0 right-0' style={{marginRight: 6}} />}
          <div className='table center' style={{height: 80}}>
            <div className='table-cell align-middle normal f-lg pointer px1' style={{overflowX: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}} onClick={() => onSelect(item)}>
              <label className='block mb1 pointer'>{name}</label>
              {items.length > 0 &&
                <label className={`display-none f-xxs pointer ${selected ? 'white opacity-50' : 'blue'} hover-display-block`}>
                  {items.length} {title.toLowerCase()}s
                </label>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default Modal(AddCampaignToMasterList)
