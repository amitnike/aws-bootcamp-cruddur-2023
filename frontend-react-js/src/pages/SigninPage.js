import './SigninPage.css';
import React from "react";
import {ReactComponent as Logo} from '../components/svg/logo.svg';
import { Link } from "react-router-dom";

import { Auth } from 'aws-amplify';


export default function SigninPage() {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState('');

  const onsubmit = async (event) => {
    setErrors('')
    event.preventDefault();
      Auth.signIn(email, password)
        .then(user => {
          console.log('user',user)
          if (
            user.challengeName === 'SOFTWARE_TOKEN_MFA'
          ) {
            // You need to get the code from the UI inputs
            // and then trigger the following function with a button click
            const code = prompt('Please enter your MFA code')
            // If MFA is enabled, sign-in should be confirmed with the confirmation code
            const loggedUser =  Auth.confirmSignIn(
              user, // Return object from Auth.signIn()
              code, // Confirmation code
              'SOFTWARE_TOKEN_MFA' // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
            );
            console.log('loggedUser',loggedUser)
            console.log('jwttoken',loggedUser.signInUserSession.accessToken.jwtToken)
            localStorage.setItem("access_token", loggedUser.signInUserSession.accessToken.jwtToken)
          }  else {
            localStorage.setItem("access_token", user.signInUserSession.accessToken.jwtToken)
          } 
          window.location.href = "/"
        })
        .catch(error => { 
          if (error.code === 'UserNotConfirmedException') {
            window.location.href = "/confirm"
          }
          setErrors(error.message)
        });
      return false
  }

  const email_onchange = (event) => {
    setEmail(event.target.value);
  }
  const password_onchange = (event) => {
    setPassword(event.target.value);
  }

  let el_errors;

  if (errors){
    el_errors = <div className='errors'>{errors}</div>;
  }


  return (
    <article className="signin-article">
      <div className='signin-info'>
        <Logo className='logo' />
      </div>
      <div className='signin-wrapper'>
        <form 
          className='signin_form'
          onSubmit={onsubmit}
        >
          <h2>Sign into your Cruddur account</h2>
          <div className='fields'>
            <div className='field text_field username'>
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={email_onchange} 
              />
            </div>
            <div className='field text_field password'>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={password_onchange} 
              />
            </div>
          </div>
          {el_errors}
          <div className='submit'>
            <Link to="/forgot" className="forgot-link">Forgot Password?</Link>
            <button type='submit'>Sign In</button>
          </div>

        </form>
        <div className="dont-have-an-account">
          <span>
            Don't have an account?
          </span>
          <Link to="/signup">Sign up!</Link>
        </div>
      </div>

    </article>
  );
}