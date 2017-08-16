// https://forums.meteor.com/t/solved-meteor-1-5-buffer-is-not-defined/36902/8
import('buffer').then(({Buffer}) => {
  global.Buffer = Buffer
})
import '/imports/startup/client/schemas'
import '/imports/startup/client/react'
