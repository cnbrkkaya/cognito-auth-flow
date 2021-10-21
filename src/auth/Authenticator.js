import React, { useState, useEffect, useContext } from 'react'
import { Auth, Hub } from 'aws-amplify'
import { UserContext } from '../contexts/UserContext'
import App from '../App'

const Authenticator = (props) => {
  const { user, setUser, checkUser } = useContext(UserContext)
  console.log(user)
  const initialFormState = {
    email: '',
    password: '',
    authCode: '',
    formType: user ? 'signedIn' : 'signIn',
  }
  console.log(initialFormState)
  const [formState, updateFormState] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    checkUser()
    Hub.listen('auth', (data) => {
      console.log(data)
      switch (data.payload.event) {
        case 'signIn':
          // console.log('user signed in')
          checkUser()
          break
        case 'signUp':
          // console.log('user signed up')
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
          // console.log('Sign in failure', data)
          break
        case 'signIn_failure':
          // console.log('user sign in failed')
          break
        case 'signUp_failure':
          // console.log('user sign in failed')
          break
        case 'customState_failure':
          // console.log('customState_failure')
          break
        case 'configured':
          // console.log('the Auth module is configured')
          break
        default:
          break
      }
    })
    return () => Hub.remove('auth')
    // checkUser()
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

  function facebookLogin() {
    Auth.federatedSignIn({ provider: 'Facebook' })
      .then(
        (data) => console.log(data),
        (error) => console.log(error)
      )
      .catch((error) => console.log(error))
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

          <button onClick={(event) => facebookLogin(event)}>facebook</button>
          <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>
            Google
          </button>
        </div>
      )}
      {/* {user && props.children} */}
      {errorMessage !== null ? (
        <div className='auth-err-message'>
          <p>{errorMessage}</p>
        </div>
      ) : null}
    </div>
  )
}

export default Authenticator