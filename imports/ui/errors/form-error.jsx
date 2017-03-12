import React from 'react'

const FormError = ({show, error, className, ...props}) => {
  if (!show || !error) return null
  return (
    <div className={`mt1 f-xs red ${className}`} {...props}>
      {error}
    </div>
  )
}

export default FormError
