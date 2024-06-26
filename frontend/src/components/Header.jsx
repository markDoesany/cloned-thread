import { Flex, Image, Link, useColorMode,Button } from "@chakra-ui/react"
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink} from 'react-router-dom'
import { AiFillHome } from 'react-icons/ai'
import { RxAvatar } from 'react-icons/rx' 
import {FiLogOut} from 'react-icons/fi'
import {BsFillChatQuoteFill} from 'react-icons/bs'
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import {MdOutlineSettings} from 'react-icons/md'

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom)
  const logout = useLogout()
  const [, setAuthScreenAtom] = useRecoilState(authScreenAtom)

  return (
    <Flex justifyContent={'space-between'} mt={6} mb='12'>
     
      {user && (
        <Link as={RouterLink} to='/'>
            <AiFillHome size={24}/>
        </Link>
      )} 

      {!user && (
        <Link as={RouterLink} to={'/auth'} onClick={
          () => setAuthScreenAtom('Login')
        }> Login</Link>
      )}

      <Image
        cursor={'pointer'}
        alt='logo'
        w={6}
        src={colorMode === 'dark' ? '/light-logo.svg' : '/dark-logo.svg'}
        onClick={toggleColorMode}
      />

       {!user && (
        <Link as={RouterLink} to={'/auth'} onClick={
          () =>  setAuthScreenAtom('Signup')
        }>Signup</Link>
      )}

      {user && (
        <Flex gap={5} alignItems={'center'}>
          <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={20}/>
          </Link>
          <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24}/>
          </Link>
          <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={20}/>
          </Link>
          <Button size={'xs'} onClick={logout}>
            <FiLogOut/>
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default Header