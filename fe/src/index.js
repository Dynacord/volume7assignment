import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './app/authentication/Login'
import SignUpForm from './app/authentication/Signup';
import ForgotForm from './app/authentication/Forgot';
import ResetForm from './app/authentication/Reset'
import Dashboard from './app/dashboard/Dashboard';
import SSO from './app/authentication/SSO'
import {
  HashRouter,
  Route,
  Switch,
} from 'react-router-dom'
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter hashType="noslash">
      <Switch>
        <Route path="/login" exact={true}>
          <LoginForm />
        </Route>
        <Route path="/signup" exact={true}>
          <SignUpForm />
        </Route>
        <Route path="/forgot" exact={true}>
          <ForgotForm />
        </Route>
        <Route path="/reset/:jwt" exact={true}>
          <ResetForm />
        </Route>
        <Route path="/dashboard" exact={true}>
          <Dashboard />
        </Route>
        <Route>
          <SSO />
        </Route>
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

