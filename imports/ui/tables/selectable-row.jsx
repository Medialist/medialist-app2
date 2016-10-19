import React, { PropTypes } from 'react'
import classnames from 'classnames'

const SelectableRow = ({ selected, data, children, onSelectChange, className }) => (
  <tr className={classnames(className, { active: selected })}>
    <td>
      <input type='checkbox' checked={selected} onChange={() => onSelectChange(data)} />
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
