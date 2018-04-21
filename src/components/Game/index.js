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

                <GameCreation/>
            </div>
        </div>
    </div>

class GameCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedFaculty: "d31b1d9547b0467aa443",
            currentName: '',
            courses: []
        };
        //this.handleSubmit = this.handleSubmit.bind(this);
        this.createGame = this.createGame.bind(this);
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
        db.getFacultyCourses(this.state.currentlySelectedFaculty).once('value', (snapshot) => {
            let classes = snapshot.val();
            console.log(classes);
            this.setState({
                courses: classes
            })
        });
        db.getFacultyName(this.state.currentlySelectedFaculty).on('value', (snapshot) => {
            let name = snapshot.val();
            console.log(name);
            this.setState({
                currentName: name
            });
        });
    }
    createGame(){

    }
    render() {
        return (
            <form>
                <p>Hello, {this.state.currentName}! </p>
                <div class="form-group">
                    <select class="form-control" id="selectCourse" data-width="fit">
                        <option>Select a Course</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                    </select>
                </div>
                <button class="btn btn-info"> Create Game </button>
            </form>
        )
    }
}

export default GamePage;

export {
    GameCreation,
};
