import getAvatar from './get-avatar'

export default function toUserRef (user) {
  return {
    _id: user._id,
    name: user.profile.name,
    avatar: getAvatar(user)
  }
}
