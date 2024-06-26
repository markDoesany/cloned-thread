import { Flex, Avatar, Text, Image, Box, Divider, Button, Spinner } from "@chakra-ui/react"
import Actions from "../components/Actions"
import { useEffect, useState } from "react"
import Comment from "../components/Comment"
import useGetUserProfile from '../hooks/useGetUserProfile'
import useShowToast from "../hooks/useShowToast"
import { useNavigate, useParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import userAtom from "../atoms/userAtom"
import { useRecoilValue } from "recoil"
import { DeleteIcon } from "@chakra-ui/icons"

function PostPage() {
  const [post, setPost] = useState(null)
  const currentUser = useRecoilValue(userAtom)
  const {user, isLoading} = useGetUserProfile()
  const {pid} = useParams()
  const showToast = useShowToast()
  const navigate = useNavigate()

  useEffect(()=>{
    const getPost = async() => {
      try {
        const res = await fetch(`/api/posts/${pid}`)
        const data = await res.json()
        if(data.error){
          showToast('Error', data.error, 'error')
          return
        }
        setPost(data)
      } catch (error) {
        showToast('Error', error, 'error')
      }
    }
    getPost()
  })

  const handleDeletePost = async ()=> {
    if(!window.confirm("Are you sure you want to delete this post?")) return
    try {
      const res = await fetch(`/api/posts/${post._id}`,{
        method: 'DELETE'
      })

      const data = await res.json()
        if(data.error){
          showToast('Error', data.error, 'error')
          return
        }
        showToast('Success', 'Post deleted', 'success')
        navigate(`/${user.username}`)
    } catch (error) {
      showToast('Error', error, 'error')
    }
  }

  if(!user && isLoading){
    <Flex justifyContent={'center'}>
        <Spinner size={'xl'}/>
      </Flex>
  }

  if(!user) return
  if(!post) return
  return (
    <>
      <Flex>
        <Flex w={'full'} alignItems={'center'} gap={3}>
        <Avatar src={user.profilePic} size={'md'} name={user.name}/>
          <Flex>
            <Text fontSize={'sm'} fontWeight={'bold'}>{user.username}</Text>
            <Image src='/verified.png' w='4' h={4} ml={4} alt='profile'/>
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={'center'}>
        <Text fontSize={'xs'} width={36} textAlign={'end'} color={'gray.light'}>{formatDistanceToNow(new Date(post.createdAt))} ago</Text>
        {currentUser?._id === user?._id && <DeleteIcon size={20} onClick={handleDeletePost} cursor={'pointer'}/>}
        </Flex>
      </Flex>
      
      <Text my={3}>{post.text}</Text>
      
      <Box borderRadius={6} overflow={'hidden'}  borderColor={'gray.light'}>
            <Image src={post.img} w={'full'}></Image>
      </Box>

      <Flex gap={3} my={3}>
        <Actions post={post} postedBy={post.postedBy}/>
      </Flex>

      <Divider my={4}/>

      <Flex justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'}>👋</Text>
          <Text color={'gray.light'}>Get the app to like, reply, and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>

      <Divider my={4}/>

      {post.replies.length > 0 && (
        post.replies.map((reply)=>{
          return <Comment key={reply._id} reply={reply}
            lastReply={reply._id === post.replies[post.replies.length - 1]._id}
          />
        })
      )}
      {/* <Comment 
        comment='Really Good'
        createdAt='2d'
        likes={100}
        username='haduklin'
        userAvatar = "https://bit.ly/kent-c-dodds" 
        /> */}
        
    </>
  )
}

export default PostPage