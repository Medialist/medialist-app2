import test from 'ava'
import React from 'react'
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15'
import Avatar from '../../../imports/ui/images/avatar'

Enzyme.configure({ adapter: new Adapter() })

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
