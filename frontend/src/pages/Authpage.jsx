import { useRecoilValue } from "recoil"
import LoginCard from "../components/LoginCard"
import SignupCard from "../components/SignupCard"
import authScreenAtom from "../atoms/authAtom"

function Authpage() {
  const autScreenState = useRecoilValue(authScreenAtom)
  console.log(autScreenState)
  return (
    <div>
      {autScreenState === 'Login' ? <LoginCard/> : <SignupCard/> }
    </div>
  )
}

export default Authpage