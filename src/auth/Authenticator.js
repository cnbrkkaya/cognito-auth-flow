import React, { useState, useContext } from 'react'
import { Auth, Hub } from 'aws-amplify'
import { UserContext } from '../contexts/UserContext'
import Error from './components/Error/Error'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

const Authenticator = () => {
  const { setUser, checkUser } = useContext(UserContext)
  const initialFormState = {
    email: '',
    password: '',
    authCode: '',
    formType: 'signIn',
    //user ? 'signedIn' :
  }

  const [formState, updateFormState] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState(null)

  Hub.listen('auth', (data) => {
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
        console.log('hosted UI')
        setErrorMessage(data.payload.data.message)
        break
      case 'signIn_failure':
        // console.log('user sign in failed')
        break
      case 'signUp_failure':
        console.log('hosted UI')
        console.log(data)
        break
      case 'customState_failure':
        console.log('hosted UI')
        console.log(data)
        break
      case 'configured':
        // console.log('the Auth module is configured')
        break
      default:
        break
    }
  })
  // useEffect(() => {
  //   return () => Hub.remove('auth')
  // }, [])

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

  return (
    <div>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to='/'>Home</Link>
              </li>
              <li>
                <Link to='/admin'>Admin Login</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path='/admin'>
              <AdminLogin />
            </Route>
            <Route path='/'>
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
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
          <button onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>
            Google
          </button>
        </div>
      )}
      {/* {user && props.children} */}
      {errorMessage !== null && <Error message={errorMessage} />}
    </div>
  )
}

export default Authenticator

// async function forgotPassword() {
//   const { email } = formState
//   try {
//     await Auth.forgotPassword(email)
//     updateFormState(() => ({
//       ...formState,
//       email,
//       formType: 'completeForgotPassword',
//     }))
//     setErrorMessage(null)
//   } catch (e) {
//     console.log(e)
//     setErrorMessage(e.message)
//   }
// }
// async function completeForgotPassword() {
//   const { email, authCode, password } = formState
//   try {
//     await Auth.forgotPasswordSubmit(email, authCode, password)
//     updateFormState(() => ({
//       ...formState,
//       formType: 'signIn',
//     }))
//     setErrorMessage(null)
//   } catch (e) {
//     console.log(e)
//     setErrorMessage(e.message)
//   }
// }
function Home() {
  return <h2>Home</h2>
}

function AdminLogin() {
  return <h2>Admin Login</h2>
}
