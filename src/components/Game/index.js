import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'
import {getFacultyName} from "../../firebase/db"
import { Randomizer } from "./Randomizer"

const GamePage = () =>
    <div>
        <main role = "main">
            <div className="jumbotron">
                <div className="container">
                    <h1 className="display-3">Quiz Game Creation</h1>
                    <p>Welcome to the Game Creation page. Here, you can schedule a quiz to be played by students in a given course. </p>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 text-center">
                        <GameCreation/>
                    </div>
                </div>
            </div>
        </main>
    </div>
let global = [];
class GameCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "L98Of2v1Q1E6fSFFg6g",
            currentFaculty: "d31b1d9547b0467aa443",
            currentName: '',
            courses: [],
            selectedCourses: []
        };
        //this.handleSubmit = this.handleSubmit.bind(this);
        this.createGame = this.createGame.bind(this);
        this.validate = this.validate.bind(this);
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
    validate(data){
        global = data;
    }
    componentDidMount () {
        db.getFacultyCourses(this.state.currentFaculty).once('value', (snapshot) => {
            //console.log('courses: ' + courses);

            this.setState({
                courses: snapshot.val()
            });
            let formatted = [];
            //for (let x in newState) { //iterates through found course list
            db.getCourseWithID(newState[0]['id']).once('value', (snapshot) => { // uses course id
                let dbcourse = snapshot.val();
                console.log("db course elemnt: " + dbcourse);
                this.state.selectedCourses.push({
                    id: dbcourse,
                    quizzes: dbcourse.quizzes,
                    students: dbcourse.students,
                    coursecode: dbcourse.coursecode,
                    title: dbcourse.title,
                    yearrank: dbcourse.yearrank
                });
                console.log("selectedCourseinLoop: " + this.state.selectedCourses);
                this.validate(this.state.selectedCourses);
            });
            // }
        });

        db.getFacultyName(this.state.currentFaculty).on('value', (snapshot) => {
            let name = snapshot.val();
            console.log(name);
            this.setState({
                currentName: name
            });
        });

    }
    createGame(){
        Randomizer.createPin(this.currentlySelectedQuiz);
    }

    render() {
        if(this.state.selectedCourses !== undefined || this.state.selectedCourses.length > 0) {
            return (
                <form>
                    <p>Hello, {this.state.currentName}! </p>
                    <p> Please select a course below: </p>
                    <div className="form-group">
                        <select className="form-control" id="selectCourse" data-width="fit">
                            <option>Select a Course</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                    </div>
                    <ul>
                        {this.state.courses.map((course) => {
                            return (
                                <li key={course.id}>
                                    <h3>{course.id}</h3>
                                </li>
                            )
                        })}

                        {console.log("render selected Courses: " + this.state.selectedCourses)}


                    </ul>
                    <button className="btn btn-info" onClick={this.createGame}> Create Game</button>
                </form>
            )
        }
        else {
            return null;
        }
    }
}

export default GamePage;

export {
    GameCreation,
};
