import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'
import find from 'lodash.find'

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
  componentWillReceiveProps (props) {
    const { masterLists, currentlyBelongsTo } = props
    this.setState({selectableList: markSelected(masterLists, currentlyBelongsTo)})
  },
  render () {
    if (!this.props.open) return null
    const { title, onDismiss } = this.props
    const { selectableList } = this.state
    const selectedStyle = 'border-blue bg-blue white'
    const unSelectedStyle = 'border-gray80 bg-white gray20'
    return (
      <div>
        <div className='py6 center'>
          <span className='f-lg'>Add {title} to a Master List</span>
        </div>
        <div className='bg-gray90 border-top border-gray80 p2 flex flex-wrap'>
          {selectableList.map((item) => {
            return (
              <div className='center p2' style={{width: '25%'}}>
                <div className={`btn-lg table width-100 ${item.selected ? selectedStyle : unSelectedStyle}`}>
                  <label className='table-cell align-middle normal f-lg'>{item.label}</label>
                </div>
              </div>
            )
          })}
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

const markSelected = (masterLists, currentlyBelongsTo) => {
  return masterLists.map((item) => {
    item.selected = !!find(currentlyBelongsTo, item)
    return item
  })
}

export default Modal(AddCampaignToMasterList)
