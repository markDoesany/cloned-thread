import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import useShowToast from "./useShowToast"
import { useRecoilState, useRecoilValue } from "recoil"
import postsAtom from "../atoms/postsAtom"
import userAtom from "../atoms/userAtom"

function useGetPosts() {
  const user = useRecoilValue(userAtom)
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [isFetching, setIsFetching] = useState(true)
  const {username} = useParams()
  const showToast = useShowToast()

  useEffect(()=>{
    const getPosts  =async() =>{
      if (!user) return
      setIsFetching(true)
      setPosts([])
      try {
          const res = await fetch(`/api/posts/user/${username}`)
          const data = await res.json()
          if(data.error){
            showToast('Error', data.error, 'error')
            return
          }
          setPosts(data)
      } catch (error) {
        showToast('Error', error, 'error')
      }finally{
        setIsFetching(false)
      }
    }
    getPosts()
  }, [username, showToast, setPosts, user])
  return [posts, isFetching]
}

export default useGetPosts