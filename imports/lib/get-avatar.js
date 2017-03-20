export default function getAvatar (user) {
  const twitter = user && user.services && user.services.twitter && user.services.twitter.profile_image_url_https
  return twitter
}
