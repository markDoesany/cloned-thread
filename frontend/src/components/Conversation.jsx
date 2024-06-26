import { Avatar, AvatarBadge, Flex, Stack, WrapItem, Text, Image, useColorModeValue, useColorMode, Box} from "@chakra-ui/react"
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { BsCheck2All, BsImageFill } from 'react-icons/bs'
import { selectedConversationAtom } from "../atoms/messagesAtom"
 
function Conversation({ conversation, isOnline }) {
  const currentUser = useRecoilValue(userAtom)
  const [ selectedConversation, setSelectedConversation] = useRecoilState( selectedConversationAtom )
  const user = conversation?.participants[0]
  const lastMessage = conversation?.lastMessage
  const colorMode = useColorMode()
   return (
    <Flex
      gap={4}
      alignItems={'center'}
      p={'1'}
      _hover={
        {
          cursor:'pointer',
          bg: useColorModeValue('gray.500', 'gray.dark'),
          color: 'white'
        }
      }
      borderRadius={'md'}
      onClick={()=> setSelectedConversation({
        _id: conversation?._id,
        userId: user._id,
        username: user.username,
        userProfilePic: user.profilePic,
        mock: conversation?.mock
      })}
      bg={selectedConversation._id === conversation?._id ? (colorMode === 'light' ? 'gray.200': 'gray.700') : ''}
      color={selectedConversation._id === conversation?._id ? (colorMode === 'light' ? 'white': 'white') : ''}
    >
      <WrapItem>
        <Avatar size ={{
          base: 'xs',
          sm: 'sm',
          md: 'md'
        }} src={user.profilePic || "https://bit.ly/broken-link"}>
      {isOnline ? (<AvatarBadge boxSize={'1em'} bg={'green.500'} />) : ''}
        </Avatar>
      </WrapItem>
        
      <Stack direction={'column'} fontSize={'sm'}>
          <Text fontWeight='700' display={'flex'} alignItems={'center'}>
            {user.username} <Image src='/verified.png' w={4} h={4} ml={1}/> </Text>
            <Text fontSize={'xs'} display={'flex'} alignItems={'center'} gap={1}>
            {currentUser._id === lastMessage.sender? 
            (<Box color={lastMessage.seen ? 'blue.400': ''}>
              <BsCheck2All size={16}/>   
            </Box>): ''}
              {lastMessage.text.length >= 18 ? lastMessage.text.slice(0,10)+'...' : lastMessage.text || <BsImageFill size={16}/>}</Text>
      </Stack>
    </Flex>
  )
}

export default Conversation