import { Avatar, Flex, useColorModeValue, Text, Image, Divider, SkeletonCircle, Skeleton } from "@chakra-ui/react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useEffect, useState, useRef } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../../context/SocketContext";
import messageSound from '../assets/sounds/message.mp3'

function MessageContainer() {
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [messages, setMessages] = useState([])
  const selectedConversation = useRecoilValue(selectedConversationAtom)
  const currentUser = useRecoilValue(userAtom)
  const [ , setConversations] = useRecoilState(conversationsAtom)
  const { socket } = useSocket()
  const messagesEndRef = useRef(null);
  const showToast = useShowToast()

  useEffect(() => {
    socket?.on('newMessage', (newMessage) => {
      if (selectedConversation?._id === newMessage?.conversationId){ 
        setMessages((prevMessages) => [...prevMessages, newMessage])
      }

      if (!document.hasFocus()){
        const sound = new Audio(messageSound)
        sound.play()
      }

      setConversations((prev)=>{
        const updatedConversations = prev.map(conversation=>{
          if (conversation._id === newMessage.conversationId)
            return {
              ...conversation,
              lastMessage:{
                text: newMessage.text,
                sender: newMessage.sender
              }
            }
          return conversation
        })
        return updatedConversations
      })

    })

    return () => socket.off('newMessage')
  }, [socket, selectedConversation, setConversations])

  useEffect(()=>{
    const lastMessageIsFromOtherUser = messages.length && messages[messages.length -1].sender !== currentUser._id
    
    if (lastMessageIsFromOtherUser){
      socket.emit('markMessagesAsSeen', {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId
      })
    }

    socket.on('messagesSeen', ({conversationId}) => {
      if (selectedConversation._id === conversationId){
        setMessages(prev => {
          const updatedMessages = prev.map((message)=>{
            if (message.seen ===  false)
            {
              return{
              ...message,
              seen: true
              }
            }
            return message
          })
          return updatedMessages
        })
        setConversations(prev => {
          const updatedConversations = prev.map(conversation => {
            if (conversation._id === conversationId){
              return {
                ...conversation,
                lastMessage: {
                ...conversation.lastMessage,
                seen: true
                }
              }
            }
            return conversation
          })
          return updatedConversations
        })
      }
    })
    return () => socket && socket.off('messagesSeen')
  }, [currentUser._id, messages, selectedConversation._id, selectedConversation.userId, socket, setConversations])

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true)
      setMessages([])
      try {
        if (selectedConversation.mock) return
        
        const res = await fetch('/api/messages/' + selectedConversation.userId)
        const data = await res.json()
        if (data.error) {
          showToast('Error', data.error, 'error')
          return
        }
        console.log(data)
        setMessages(data)
      } catch (error) {
        showToast('Error', error.message, 'error')
      } finally {
        setLoadingMessages(false)
      }
    }
    getMessages()
  }, [showToast, selectedConversation.userId, selectedConversation.mock])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <Flex 
      flex={70}
      bg={useColorModeValue('gray.200', 'gray.dark')}
      borderRadius={'md'}
      p={2}
      flexDirection={'column'}
    >
      {/* message header */}
      <Flex w={'full'} h={12} alignItems={'center'} gap={2}>
        <Avatar src={selectedConversation.userProfilePic} size={'sm'} />
        <Text display={'flex'} alignItems={'center'}>
          {selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
        </Text>
      </Flex>
      <Divider />

      <Flex flexDirection={'column'} gap={4} my={4} height={'400px'} overflowY={'auto'} px={4}>
        {loadingMessages && (
          [...Array(5)].map((_, index) => {
            return (
              <Flex 
                key={index}
                alignItems={'center'}
                p={1}
                borderRadius={'md'}
                alignSelf={index % 2 === 0 ? 'flex-start' : 'flex-end'}
              >
                {index % 2 === 0 && (<SkeletonCircle size={7} />)}
                <Flex flexDir={'column'} gap={2}>
                  <Skeleton height={'8px'} w={'250px'} />
                  <Skeleton height={'8px'} w={'250px'} />
                  <Skeleton height={'8px'} w={'250px'} />
                </Flex>
                {index % 2 !== 0 && (<SkeletonCircle size={7} />)}
              </Flex>
            )
          })
        )}
        {!loadingMessages && messages.map((message) => {
          return (<Message ownMessage={message.sender === currentUser._id} message={message} key={message._id} />)
        })}
        <div ref={messagesEndRef} />
      </Flex>

      <MessageInput setMessages={setMessages} />
    </Flex>
  )
}

export default MessageContainer
