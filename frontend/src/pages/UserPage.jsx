import UserHeader from "../components/UserHeader"
import { Flex, Spinner } from "@chakra-ui/react"
import Post from "../components/Post"
import useGetUserProfile from '../hooks/useGetUserProfile'
import useGetPosts from "../hooks/useGetPosts"

export default function UserPage() {
  const {user, isLoading} = useGetUserProfile()
  const [posts, isFetching] = useGetPosts() 

  if(!user && isLoading){
    return(
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'}/>
      </Flex>
    ) 
  }

  if(!user && !isLoading) return <h1>User not found</h1>
  if(!user) return 
  if(!posts) return 
  return (
    <>
      <UserHeader user={user}/>
      {!isFetching && posts.length === 0 && (
        <h1> User does not have any posts</h1>
      )}
      {isFetching && (
        <Flex justifyContent={'center'} my={12}>
          <Spinner size={'xl'}/>
        </Flex>
      )}
      {user._id !== posts && !isFetching && (
        posts.map((post) => {
          return <Post key={post._id} post={post} postedBy={post.postedBy}/>
        })
      )}
    </>
  )
}
