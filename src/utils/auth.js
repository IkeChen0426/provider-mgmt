import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const Tai = 'tai'

export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}

export function getTai () {
  return Cookies.get(Tai)
}

export function setTai (tai) {
  return Cookies.set(Tai, tai)
}

export function removeTai () {
  return Cookies.remove(Tai)
}
