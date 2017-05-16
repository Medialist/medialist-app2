import getAvatar from '/imports/lib/get-avatar'

export default function toUserRef (user) {
  if (!user) {
    return null
  }

  const ref = {
    _id: user._id,
    name: user.profile.name,
    avatar: getAvatar(user)
  }

  if (!ref.avatar) {
    delete ref.avatar
  }

  return ref
}
