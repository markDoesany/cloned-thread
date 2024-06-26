import { SearchIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, useColorModeValue, Input, Button, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from 'react-icons/gi'
import MessageContainer from "../components/MessageContainer";
import useShowToast from '../hooks/useShowToast'
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom }from '../atoms/messagesAtom'
import userAtom from "../atoms/userAtom";
import { useSocket } from "../../context/SocketContext";


function ChatPage() {
  const [loadingConversation, setLoadingConversation] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
  const currentUser = useRecoilValue(userAtom)
  const [searchingUser, setSearchingUser] = useState(false)
  const [conversations, setConversations] = useRecoilState(conversationsAtom)
  const {socket, onlineUsers} = useSocket() 
  const showToast = useShowToast()

  useEffect(()=>{
    socket?.on('messagesSeen', ({ conversationId }) => {
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
    })
    return () => socket && socket.off('messagesSeen')
  }, [socket, setConversations, selectedConversation._id])

  useEffect(()=>{
    socket?.on('newMessage', (newMessage)=>{
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
    return () => socket && socket.off('newMessage')
  }, [socket, setConversations])

  useEffect(()=>{
    const getConversations = async() => {
      try {
        const res = await fetch('/api/messages/conversations')
        const data = await res.json()
        if(data.error){
          showToast('Error', data.error, 'error')
          return
        }
        setConversations(data)
      } catch (error) {
        showToast('Error', error, 'error')
      }finally{
        setLoadingConversation(false)
      }
    }
    getConversations()
  }, [showToast, setConversations])

  const handleConversationSearch = async(e) =>{
    e.preventDefault()
    setSearchingUser(true)
    try {

      const res = await fetch('/api/users/profile/'+searchText)
      const searchedUser = await res.json()

      if (searchedUser.error){
        showToast('Error', searchedUser.error, 'error')
        return
      }

      if (searchedUser._id === currentUser._id){
        showToast('Error', 'You cannot message yourself', 'error')
        return
      }

      if (conversations.find((conversation)=> conversation.participants[0]._id === searchedUser._id)){
        setSelectedConversation({
          _id: conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic 
        })
        return
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: '',
          sender: ''
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic
          }
        ]
      }

      setConversations((prevConversations) => [...prevConversations, mockConversation])
    } catch (error) {
      showToast('Error', error.message, 'error')
    }finally{
      setSearchingUser(false)
    }
  }
  return (
    <Box position={'absolute'} w={{lg: '750px', md:'80%', base:'100%'}} left={'50%'} transform={"translateX(-50%)"} p={4}>
      <Flex 
      gap={4}
      flexDirection={{
        base: 'column',
        md: 'row'
      }}
      maxW={{
        sm: '400px',
        md: 'full'
      }}
      mx={'auto'}>

        <Flex 
          flex={30}
          flexDirection={'column'}
          maxW={{
            sm:'250px',
            md: 'full'
          }}
          mx={'auto'}>
              <Text fontWeight={700} color={useColorModeValue('gray.600', 'gray.400')}>Your Conversations</Text>
              <form onSubmit={handleConversationSearch}>
                <Flex alignItems={'center'} gap={4}>
                    <Input placeholder="Search for a user" onChange={(e)=>setSearchText(e.target.value)} value={searchText}></Input>
                    <Button size={'sm'} onClick={handleConversationSearch} isLoading={searchingUser}>
                      <SearchIcon/>
                    </Button>
                </Flex>
              </form>

              {loadingConversation && (
                [0, 1, 2, 3, 4, 5].map((_, index)=>{
                  return (<Flex key={index} gap={4} alignItems={'center'} p={1} borderRadius={'md'}>
                    <Box>
                      <SkeletonCircle size={'10'}/>
                    </Box>
                    <Flex w={'full'} flexDirection={'column'} gap={3}>
                      <Skeleton h={'10px'} w={'80px'}/>
                      <Skeleton h={'8px'} w={'90%'}/>
                    </Flex>
                  </Flex>)
                })
              )}

              {!loadingConversation && (
                conversations.map((conversation)=>{
                  return <Conversation conversation={conversation} key={conversation._id} isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                  />
                })
              )}
          </Flex>

        {!selectedConversation._id ? (<Flex 
          flex={70}
          borderRadius={'md'}
          p={2}
          flexDir={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          height={'400px'}>
            <GiConversation size={100}/>
            <Text fontSize={20}>Select a conversation to start messaging</Text>
        </Flex>) :  <MessageContainer/>}
        
      </Flex>
    </Box>
  )
}

export default ChatPage 