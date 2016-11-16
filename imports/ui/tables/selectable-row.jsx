import React, { PropTypes } from 'react'
import classnames from 'classnames'
import Checkbox from './checkbox'

const SelectableRow = ({ selected, data, children, onSelectChange, className }) => (
  <tr className={classnames(className, 'hover-opacity-trigger', { active: selected })}>
    <td>
      <Checkbox
        className={classnames('hover-opacity-100', { 'opacity-0': !selected })}
        checked={selected}
        onChange={() => onSelectChange(data)}
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
