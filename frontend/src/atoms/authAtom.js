import { atom } from 'recoil'

const authScreenAtom = atom({
  key: 'authScreenAtom',
  default: 'Login'
})

export default authScreenAtom