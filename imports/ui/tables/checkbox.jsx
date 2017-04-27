import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { CheckboxEmpty, CheckboxChecked } from '../images/icons'

const Checkbox = ({ className, checked, data, onChange, ...props }) => {
  return (
    <label className={classnames(className, 'inline-block')} style={{width: 14, height: 14}} data-id={`${props['data-id']}-label`}>
      {checked ? <CheckboxChecked className='align-top' /> : <CheckboxEmpty className='align-top' />}
      <input
        style={{display: 'none'}}
        type='checkbox'
        checked={checked}
        onChange={() => onChange(data)}
        data-id={props['data-id']}
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
