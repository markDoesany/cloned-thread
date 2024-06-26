import { atom } from "recoil";

export const conversationsAtom = atom({
  key: 'conversations',
  default: []
})

export const selectedConversationAtom  = atom({
  key:'selectedConversation',
  default: {
    _id: '',
    userId: '',
    username:'',
    userProfilePic: ''
  }
})