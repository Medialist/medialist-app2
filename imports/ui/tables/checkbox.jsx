import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { CheckboxEmpty, CheckboxChecked } from '/imports/ui/images/icons'

const Checkbox = ({ className, label, checked, data, onChange, ...props }) => {
  return (
    <label className={classnames(className, 'inline-block', 'pointer')} data-id={`${props['data-id']}-label`}>
      <span className='inline-block' style={{width: 14, height: 14}}>
        {checked ? <CheckboxChecked className='align-top' /> : <CheckboxEmpty className='align-top' />}
      </span>
      {label ? (
        <span className={classnames('f-md pl2', {gray10: checked, semibold: checked, gray20: !checked})}>
          {label}
        </span>
      ) : null}
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
