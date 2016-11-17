import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { CheckboxEmpty, CheckboxChecked } from '../images/icons'

const Checkbox = ({ className, checked, data, onChange }) => {
  return (
    <label className={classnames(className, 'inline-block')} style={{width: 14, height: 14}} >
      {checked ? <CheckboxChecked className='align-top' /> : <CheckboxEmpty className='align-top' />}
      <input
        style={{display: 'none'}}
        type='checkbox'
        checked={checked}
        onChange={() => onChange(data)}
      />
    </label>
  )
}

Checkbox.propTypes = {
  data: PropTypes.object,
  checked: PropTypes.bool,
  onChange: PropTypes.func
}

export default Checkbox
