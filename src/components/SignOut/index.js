import React from 'react';
import { Link } from 'react-router-dom';
import * as routes from '../../constants/routes';
import { auth } from '../../firebase';

const SignOutButton = () =>
  <Link
    to={routes.LANDING}
    onClick={auth.doSignOut}>
    Sign Out
  </Link>

export default SignOutButton;
