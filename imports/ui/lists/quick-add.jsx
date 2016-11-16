import React, { PropTypes } from 'react'
import Tag from '../navigation/tag'
import InfoHeader from '../lists/info-header'

const QuickAdd = (props) => {
  const { sectors, tags, onAddSectors, onAddTags } = props
  return (
    <div>
      <section>
        <InfoHeader name='Sectors' onClick={onAddSectors} />
        <div className='py3'>
          {sectors.map((s) => <span className='pointer p2 blue f-sm'>{s}</span>)}
        </div>
      </section>
      <section>
        <InfoHeader name='Tags' onClick={onAddTags} />
        <div className='px2 py3'>
          {tags.map((tag) => {
            const { name, count, onRemove } = tag
            return <Tag name={name} count={count} onClick={onRemove} />
          })}
        </div>
      </section>
    </div>
  )
}

QuickAdd.PropTypes = {
  tags: PropTypes.array.isRequired,
  sectors: PropTypes.array.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onAddSectors: PropTypes.func.isRequired
}

export default QuickAdd
