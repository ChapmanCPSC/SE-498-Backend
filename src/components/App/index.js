import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import HomePage from '../Home';
import AccountPage from '../Account';
import withAuthentication from '../Session/withAuthentication';
import QuestionsPage from '../Questions/questions';
import QuizzesPage from '../Quizzes/quizzes';
import GamePage from '../Game';
import * as routes from '../../constants/routes';

import './index.css';

const App = () =>
  <Router>
    <div className="app">
      <Navigation />

      <Route exact path={routes.LANDING} component={() => <LandingPage />} />
      <Route exact path={routes.HOME} component={() => <HomePage />} />
      <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />
      <Route exact path={routes.QUESTIONS} component = { () => <QuestionsPage />} />
      <Route exact path={routes.QUIZZES} component = { () => <QuizzesPage />} />
      <Route exact path={routes.GAME} component = { () => <GamePage />} />



    </div>
  </Router>

export default withAuthentication(App);