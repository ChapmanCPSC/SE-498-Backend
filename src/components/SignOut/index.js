import React from 'react';

import { auth } from '../../firebase';

const SignOutButton = () =>
  <button
    class = "customBut"
    onClick={auth.doSignOut}>
    Sign Out
  </button>

export default SignOutButton;
