import React, { PropTypes } from 'react'
import Tag from '../navigation/tag'
import InfoHeader from '../lists/info-header'

const QuickAdd = (props) => {
  const { selectedMasterLists, tags, onAddToMasterList, onAddTags } = props
  return (
    <div>
      <section>
        <InfoHeader name='Master Lists' onClick={onAddToMasterList} />
        <div className='py3'>
          {selectedMasterLists.map((l) => <span className='pointer p2 blue f-sm' key={l.label}>{l.label}</span>)}
        </div>
      </section>
      <section>
        <InfoHeader name='Tags' onClick={onAddTags} />
        <div className='px2 py3'>
          {tags.map((tag) => {
            const { _id, name, count } = tag
            return <Tag name={name} count={count} onClick={() => removeTag(_id)} key={name} />
          })}
        </div>
      </section>
    </div>
  )
}

QuickAdd.PropTypes = {
  tags: PropTypes.array.isRequired,
  selectedMasterLists: PropTypes.array.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onAddToMasterList: PropTypes.func.isRequired
}

function removeTag (id) {
  console.log('remove this tag ', id)
}

export default QuickAdd
