import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Checkbox from '/imports/ui/tables/checkbox'

const SelectableRow = ({ selected, highlight, data, children, onSelectChange, className, ...props }) => (
  <tr className={classnames(className, 'hover-opacity-trigger')} data-id={props['data-id']} data-item={props['data-item']} data-highlight={highlight}>
    <td className={classnames('right-align', {'shadow-inset-blue-left': highlight})} style={{paddingRight: 0}}>
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
  highlight: PropTypes.bool,
  onSelectChange: PropTypes.func
}

export default SelectableRow
