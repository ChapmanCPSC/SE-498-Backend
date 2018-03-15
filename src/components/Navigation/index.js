import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import SignOutButton from '../SignOut';
import * as routes from '../../constants/routes';

const Navigation = ({ authUser }) =>
  <div>
    { authUser
        ? <NavigationAuth />
        : <NavigationNonAuth />
    }
  </div>

const NavigationAuth = () =>
  <div>
    <div class = "topnav">
      <Link to={routes.LANDING}>Landing</Link>
      <Link to={routes.HOME}>Home</Link>
      <Link to={routes.ACCOUNT}>Account</Link>
      <SignOutButton />
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
