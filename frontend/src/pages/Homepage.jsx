import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import useShowToast from '../hooks/useShowToast'
import { useState } from "react";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";


function Homepage() {
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    const getFeedPost = async() =>{
      setIsLoading(true)
      setPosts([])
      try {
        const res = await fetch('/api/posts/feed')
        const data = await res.json()
        if(data.error){
          showToast('Error', data.error, 'error')
          return
        }
        setPosts(data)
      } catch (error) {
        showToast('Error', error, 'error')
      }finally{
        setIsLoading(false)
      }
    }
    getFeedPost()
  }, [showToast])

  return (
    <Flex gap={10} alignItems={'start'}>
      <Box flex={70}>
        {!isLoading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

      {isLoading && (
        <Flex justifyContent={'center'}>
          <Spinner size={'xl'}/>
        </Flex>
      )}

      {posts.map((post)=>{
        return <Post key={post._id} post={post} postedBy={post.postedBy}/>
      })}
      </Box>
      <Box flex={30} 
      display={{
        base: 'none',
        md: 'block'
      }}>
        {/* Suggested user component */}
        <SuggestedUsers/>
      </Box>
    </Flex>
  )
}

export default Homepage