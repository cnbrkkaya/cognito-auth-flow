import React, { useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'

const initialFormState = {
  email: '',
  password: '',
  authCode: '',
  formType: 'signIn',
}

const App = () => {
  const [user, setUser] = useState(null)
  const [formState, updateFormState] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    async function checkUser() {
      try {
        const user = await Auth.currentAuthenticatedUser()

        // user.username = user.username.split('_', 1)[0]
        setUser(user)

        updateFormState((prevState) => ({ ...prevState, formType: 'signedIn' }))
      } catch (error) {
        //updateUser(null)
      }
    }
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          console.log('user signed in')
          checkUser()
          break
        case 'signUp':
          console.log('user signed up')
          checkUser()
          break
        case 'signOut':
          updateFormState((prevState) => ({ ...prevState, formType: 'signIn' }))
          setUser(null)
          break
        case 'cognitoHostedUI':
          checkUser()
          break
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data)
          break
        case 'signIn_failure':
          console.log('user sign in failed')
          break
        case 'configured':
          console.log('the Auth module is configured')
          break
        default:
          break
      }
    })

    checkUser()
  }, [])

  const onChange = (e) => {
    e.persist()
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value }))
  }
  const { formType } = formState

  async function signUp() {
    const { email, password } = formState
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email },
      })
      updateFormState(() => ({
        ...formState,
        email,
        formType: 'confirmSignUp',
      }))
      setErrorMessage(null)
    } catch (e) {
      console.log(e)
      setErrorMessage(e.message)
    }
  }
  async function confirmSignUp() {
    const { email, authCode } = formState
    try {
      await Auth.confirmSignUp(email, authCode)
      updateFormState(() => ({ ...formState, formType: 'signIn' }))
    } catch (e) {
      console.log(e)
      setErrorMessage(e.message)
    }
  }
  async function signIn() {
    const { email, password } = formState
    console.log(email)
    console.log(password)
    try {
      await Auth.signIn(email, password)
      const tempUser = await Auth.currentAuthenticatedUser()
      setUser(tempUser)
      setErrorMessage(null)
      updateFormState(() => ({ ...formState, formType: 'signedIn' }))
    } catch (e) {
      console.log(e)
      setErrorMessage(e.message)
    }
  }

  async function forgotPassword() {
    const { email } = formState
    try {
      await Auth.forgotPassword(email)
      updateFormState(() => ({
        ...formState,
        email,
        formType: 'completeForgotPassword',
      }))
      setErrorMessage(null)
    } catch (e) {
      console.log(e)
      setErrorMessage(e.message)
    }
  }
  async function completeForgotPassword() {
    const { email, authCode, password } = formState
    try {
      await Auth.forgotPasswordSubmit(email, authCode, password)
      updateFormState(() => ({
        ...formState,
        formType: 'signIn',
      }))
      setErrorMessage(null)
    } catch (e) {
      console.log(e)
      setErrorMessage(e.message)
    }
  }
  return (
    <div>
      {formType === 'signUp' && (
        <div>
          <input
            type='email'
            name='email'
            onChange={onChange}
            placeholder='Email'
          />
          <input
            name='password'
            type='password'
            onChange={onChange}
            placeholder='password'
          />
          <button onClick={signUp}>Sign Up</button>
          <button
            onClick={() =>
              updateFormState(() => ({
                ...formState,
                formType: 'signIn',
              }))
            }>
            Sign In
          </button>
        </div>
      )}
      {formType === 'confirmSignUp' && (
        <div>
          <input
            type='text'
            name='authCode'
            onChange={onChange}
            placeholder='authCOde'
          />

          <button onClick={confirmSignUp}>Confirm Sign Up</button>
        </div>
      )}
      {formType === 'signIn' && (
        <div>
          <input
            type='mail'
            name='email'
            onChange={onChange}
            placeholder='email'
          />
          <input
            name='password'
            type='password'
            onChange={onChange}
            placeholder='password'
          />

          <button onClick={signIn}>Sign In</button>
          <button
            onClick={() =>
              updateFormState(() => ({
                ...formState,
                formType: 'signUp',
              }))
            }>
            Sign Up
          </button>

          <button
            onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>
            facebook
          </button>
        </div>
      )}
      {formType === 'signedIn' && (
        <div>
          Hello {user.username}
          <button
            onClick={() => {
              Auth.signOut()
            }}>
            Sign Out
          </button>
        </div>
      )}

      {errorMessage !== null ? (
        <div className='auth-err-message'>
          <p>{errorMessage}</p>
        </div>
      ) : null}
    </div>
  )
}

export default App
