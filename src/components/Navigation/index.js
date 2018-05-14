import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Favicon from 'react-favicon';
import SignOutButton from '../SignOut';
import * as routes from '../../constants/routes';
import { auth } from '../../firebase';
import withAuthorization from '../Session/withAuthorization';

const Navigation = ({ authUser }) =>
  <div>
    <Favicon url="http://oflisback.github.io/react-favicon/public/img/github.ico"/>
    { authUser
        ? <NavigationAuth />
        : <NavigationNonAuth />
    }
  </div>

const NavigationAuth = () =>
  <div>
    <div className = "topnav">
      <Link to={routes.LANDING}>Landing</Link>
      <Link to={routes.ACCOUNT}>Account</Link>
      <Link to={routes.QUIZZES}>Quizzes</Link>
      <Link to={routes.QUESTIONS}>Questions</Link>
      <Link to={routes.GAME}>Game</Link>
      <div class = "right">
        
        <Link to={routes.LANDING} onClick={auth.doSignOut}>Log Out</Link>
      </div>
    </div>
  </div>
const NavigationNonAuth = () =>
  <div>
      <div class = "topnav">
          <Link to={routes.LANDING}>Landing</Link>
      </div>
  </div>

const mapStateToProps = (state) => ({
  authUser: state.sessionState.authUser,
});

export default connect(mapStateToProps)(Navigation);
