import React, { useContext } from 'react'
import { UserContext } from './contexts/UserContext'

import Amplify from 'aws-amplify'
import awsExports from './aws-exports'
import InnerApp from './InnerApp'
import Authenticator from './auth/Authenticator'

Amplify.configure(awsExports)

const App = () => {
  const { user } = useContext(UserContext)

  if (user) {
    return <InnerApp />
  } else {
    return <Authenticator />
  }
}

export default App
