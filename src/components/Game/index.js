import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

const GamePage = () =>
    <div class="container">
        <div class="row">
            <div class="col-lg-12 text-center">
                <h1 class="mt-5">Quiz Game</h1>
                <p class="lead">Create a Quiz Game</p>
                <ul class="list-unstyled">
                    <li>Bootstrap 4.0.0</li>
                </ul>
                <GameCreation/>
            </div>
        </div>
    </div>
var facultyData = {
    courses : undefined,
    name: undefined,
};
class GameCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedFaculty: "d31b1d9547b0467aa443",
        };
        this.displayFaculty();
    }
    displayFaculty() {
        // db.getQuestionWithID(this.props.selectedQuestionForEditing).once('value', (snapshot) => {
        //     this.setState({questionData : snapshot.val(), questionDataInitialLoad : snapshot.val()});
        //     console.log("2. FB 1!");
        // });
        db.getFacultyCourses(this.props.currentlySelectedFaculty).once('value', (snapshot) => {
            facultyData.courses = (snapshot.val());
        });
        db.getFacultyName(this.props.currentlySelectedFaculty).once('value', (snapshot) => {
            facultyData.name = (snapshot.val());
        });
        // return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        //     var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        //     // ...
        // });
    }
    render() {
        return (
            <form>
                <p>Hello, {facultyData.name}! </p>
                <button class="btn btn-info"> Create Game </button>
            </form>
        )
    }
}

export default GamePage;

export {
    GameCreation,
};