import React, { PropTypes } from 'react'
import classnames from 'classnames'
import Checkbox from './checkbox'

const SelectableRow = ({ selected, data, children, onSelectChange, className, ...props }) => (
  <tr className={classnames(className, 'hover-opacity-trigger', { active: selected })} data-id={props['data-id']}>
    <td className='right-align' style={{paddingRight: 0}}>
      <Checkbox
        className={classnames('hover-opacity-100', { 'opacity-0': !selected })}
        checked={selected}
        onChange={() => onSelectChange(data)}
        data-id={`${props['data-id']}-checkbox`}
      />
    </td>
    {children}
  </tr>
)

SelectableRow.propTypes = {
  data: PropTypes.object,
  selected: PropTypes.bool,
  onSelectChange: PropTypes.func
}

export default SelectableRow
