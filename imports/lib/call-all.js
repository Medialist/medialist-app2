export default function callAll ([...funcs]) {
  return (...args) => {
    funcs.forEach((func) => func(...args))
  }
}
