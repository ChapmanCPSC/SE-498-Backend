import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

class QuizzesPage extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return <h1> Quizzes </h1>;
    }
}




export default QuizzesPage;
