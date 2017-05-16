import getAvatar from '/imports/lib/get-avatar'

export default function toUserRef (user) {
  if (!user) {
    return null
  }

  return {
    _id: user._id,
    name: user.profile.name,
    avatar: getAvatar(user)
  }
}
