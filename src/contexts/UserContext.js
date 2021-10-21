import React, { createContext, useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
export const UserContext = createContext()

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    }
  }
  return (
    <UserContext.Provider value={{ user, setUser, checkUser }}>
      {props.children}
    </UserContext.Provider>
  )
}
