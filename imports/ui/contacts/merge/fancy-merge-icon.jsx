import React from 'react'
import {
  Merge3Icon,
  Merge2Icon
} from '/imports/ui/images/icons'

const FancyMergeIcon = ({count, ...props}) => {
  if (count === 2) {
    return <Merge2Icon {...props} />
  }
  return <Merge3Icon {...props} />
}

export default FancyMergeIcon
