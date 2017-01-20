export default function getAvatar (user) {
  return user && user.services && user.services.twitter && user.services.twitter.profile_image_url_https
}
