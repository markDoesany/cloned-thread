import { AddIcon } from "@chakra-ui/icons"
import { Button, useColorModeValue, useDisclosure, FormControl, Textarea, Text, Input, Flex, Image, CloseButton} from "@chakra-ui/react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useRef, useState } from "react"
import usePreviewImg from "../hooks/usePreviewImg"
import { BsFillImageFill } from "react-icons/bs"
import {useRecoilState, useRecoilValue} from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from "../hooks/useShowToast"
import postsAtom from "../atoms/postsAtom"
import { useParams } from "react-router-dom"

const MAX_CHAR=500

function CreatePost() {
  const [postText, setPostText] = useState(' ') 
  const [isLoading, setIsLoading] = useState(false)
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR)
  const [posts, setPosts] = useRecoilState(postsAtom)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { handleImageChange, imgUrl, setImgUrl} = usePreviewImg()
  const imageRef = useRef(null)
  const user = useRecoilValue(userAtom)
  const showToast = useShowToast()
  const {username} = useParams()

  const handleTextChange = (e) =>{
    const inputText = e.target.value

    if(inputText.length > MAX_CHAR){
      const truncatedText = inputText.slice(0, MAX_CHAR)
      setPostText(truncatedText)
      setRemainingChar(0)
      return
    }else{
      setPostText(inputText)
      setRemainingChar(MAX_CHAR-inputText.length)
    }
  }

  const handleCreatePost = async() =>{  
    setIsLoading(true)
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({postedBy: user._id, text: postText, img: imgUrl})
      })
      const data = await res.json()
      if(data.error){
        showToast('Error', data.error, 'error')
        return
      }
      showToast('Success', 'Post created successfully', 'success')
      if(user.username === username){
        setPosts([data, ...posts])

      }
      onClose()
      setPostText('')
      setImgUrl('')
    } catch (error) {
      showToast('Error', error, 'error')
    }finally{
      setIsLoading(false)
    }
  }
  return (
    <>
      <Button
        position={'fixed'}
        bottom={10}
        right={5}
        bg={useColorModeValue('gray.300', 'gray.dark')}
        onClick={onOpen}
        size={{ base:'sm', sm:'md'}}
      >
        <AddIcon/>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <FormControl>
              <Textarea 
                placeholder='Post text goes here' 
                onChange={handleTextChange}
                value={postText}
                />
            </FormControl>
            <Text 
              fontSize={'xs'}
              fontWeight={'bold'}
              color={'gray.600'}
              textAlign={'right'}
              m={1}
            >
              {remainingChar}/{MAX_CHAR}
            </Text>

            <Input type="file" hidden ref={imageRef} onChange={handleImageChange}/>
            <BsFillImageFill 
              style={{marginLeft:'5px', cursor:'pointer'}}
              size={16}
              onClick={()=> imageRef.current.click()}/>

            {imgUrl && (
              <Flex mt={5} w={'full'} position={'relative'}>
                <Image src={imgUrl} alt="Selected image"/>
                <CloseButton 
                onClick={()=> setImgUrl("")}
                bg={'gray.800'} position={'absolute'} top={2} right={2}/>
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleCreatePost} isLoading={isLoading}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    
    </>
  )
}

export default CreatePost