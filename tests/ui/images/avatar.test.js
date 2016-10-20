import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'

import Avatar from '../../../imports/ui/images/avatar'

test('should render without exploding', (t) => {
  t.plan(1)
  const wrapper = shallow(<Avatar avatar='/avatar.jpg' name='Joe Bloggs' />)
  t.is(wrapper.length, 1)
})

test('should render initials if no avatar URL passed', (t) => {
  t.plan(1)
  const wrapper = shallow(<Avatar name='Joe Bloggs' />)
  t.is(wrapper.find('.initials').text(), 'JB')
})
