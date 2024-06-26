import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { useRef } from 'react';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage(){
  const [user, setUser] = useRecoilState(userAtom)
  const showToast = useShowToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [inputs,setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profilePic: user.profilePic,
    password: ''
  })

  const fileRef = useRef(null)
  const { handleImageChange, imgUrl } = usePreviewImg()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: 'PUT',
        headers:{
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({...inputs, profilePic: imgUrl})
      })
      const data = await res.json()

      if(data.error){
        showToast('Update Failed', data.error, 'error')
        return
      }
      showToast('Profile Updated', 'Changes are saved successfully!', 'success')
      setUser(data)
      localStorage.setItem('user-threads', JSON.stringify(data))
      navigate('/')
    } catch (error) {
      console.log(error)
    } finally{
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        align={'center'}
        justify={'center'}
        my={2}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.dark')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}>
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
            User Profile Edit
          </Heading>
          <FormControl>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar size="xl" boxShadow={'md'} src={ imgUrl || inputs.profilePic} />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>Change Icon</Button>
                <Input type='file' hidden ref={fileRef} onChange={handleImageChange}/>
              </Center>
            </Stack>
          </FormControl>
          <FormControl  isRequired>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="e.g. Sophia Lorraine Tecson"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({...inputs, name: e.target.value})} 
              value={inputs.name}
            />
          </FormControl>
          <FormControl  isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="e.g. Bleble<3"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({...inputs, username: e.target.value})} 
              value={inputs.username}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="topePogi123@example.com"
              _placeholder={{ color: 'gray.500' }}
              type="email"
              onChange={(e) => setInputs({...inputs, email: e.target.value})} 
              value={inputs.email}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="I am a Cum Laude"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({...inputs, bio: e.target.value})} 
              value={inputs.bio}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{ color: 'gray.500' }}
              type="password"
              onChange={(e) => setInputs({...inputs, password: e.target.value})} 
              value={inputs.password}
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'red.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'red.500',
              }}
              onClick={() => navigate(`/${user.username}`)}
              >
              Cancel
            </Button>
            <Button
              bg={'green.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'green.500',
              }}
              type='submit'
              isLoading={isLoading}
              >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>

  );
}