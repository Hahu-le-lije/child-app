import {Redirect} from 'expo-router'

const index = () => {
  return (
    <Redirect
    href={'/(auth)/log-in'}
    />
  )
}

export default index