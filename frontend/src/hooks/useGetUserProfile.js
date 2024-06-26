import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import useShowToast from "./useShowToast"

function useGetUserProfile() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const {username} = useParams()
  const showToast = useShowToast()

  useEffect(()=>{
    const getUser = async()=>{
      try {
        const res = await fetch(`/api/users/profile/${username}`)
        const data = await res.json()

        if(data.error){
          showToast('Error', data.error, 'error')
          return
        }

        if (data.isFrozen){
          setUser(null)
          return
        }

        setUser(data)
      } catch (error) {
        showToast('Error', error, 'error')

      }finally{
        setIsLoading(false)
      }
    }
    getUser()

    }, [username, showToast]) 
  return {isLoading, user}
}
export default useGetUserProfile