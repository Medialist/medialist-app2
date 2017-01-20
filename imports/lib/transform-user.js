import getAvatar from './get-avatar'

export default function transformUser (user) {
  return {
    _id: user._id,
    name: user.profile.name,
    avatar: getAvatar(user)
  }
}
