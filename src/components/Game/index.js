import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'
import {getFacultyName} from "../../firebase/db";

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
let facultyData = {
    courses : [],
    name: undefined,
};
class GameCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedFaculty: "d31b1d9547b0467aa443",
            currentName: ''
        };
        //this.handleSubmit = this.handleSubmit.bind(this);

    }
    // handleSubmit(e){
    //     e.preventDefault();
    //     const ref = db.getFacultyName(this.state.currentlySelectedFaculty);
    //     const fac = {
    //         name : this.state.currentName
    //     }
    //     ref.push(fac);
    //     this.setState({
    //        currentName: ''
    //     });
    // }
    componentDidMount () {


        // db.getFacultyCourses(this.state.currentlySelectedFaculty).once('value', (snapshot) => {
        //     facultyData.courses = (snapshot.val());
        // });
        db.getFacultyName(this.state.currentlySelectedFaculty).on('value', (snapshot) => {
            let name = snapshot.val();
            console.log(name);
            this.setState({
                currentName: name
            });
        });
    }

    render() {
        return (
            <form>
                <p>Hello, {this.state.currentName}! </p>
                <button class="btn btn-info"> Create Game </button>
            </form>
        )
    }
}

export default GamePage;

export {
    GameCreation,
};