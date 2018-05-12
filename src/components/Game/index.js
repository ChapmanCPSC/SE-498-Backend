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

class GameCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedCourse: "defaultOption",
            currentFaculty: "d31b1d9547b0467aa443",
            currentName: '',
            courses: {},
            courseNames: {},
            allQuizNames: {},
            linkedQuizzes: []
        };
        //this.handleSubmit = this.handleSubmit.bind(this);
        this.createGame = this.createGame.bind(this);
        this.validate = this.validate.bind(this);
        this.handleFilterByCourse = this.handleFilterByCourse.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.startGame = this.startGame.bind(this);
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
        let global = data;
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleFilterByCourse (e) {
        e.preventDefault();
        console.log("ewe tonight");
        let that = this;
        if (this.state.currentlySelectedCourse !== "defaultOption") {
            db.getCourseWithID(this.state.currentlySelectedCourse).once('value', (snapshot) => {
                let tempState = snapshot.val();
                let stateToSet = [];
                for (let quizID in tempState.quizzes) {

                    stateToSet.push( {
                        id : quizID,
                        quizText : that.state.allQuizNames[quizID].name
                    });
                    console.log(that.state.allQuizNames);
                    console.log(quizID);
                }

                if (stateToSet === undefined || stateToSet.length === 0) { // If no tags returned, we automatically just display All Quiz Names and select the highlighted option
                    // TODO: Alert user that filter returned no results
                }
                else { // we have found at least one quiz with the tag! So auto select the first
                    that.setState({
                        linkedQuizzes: stateToSet,
                        currentlySelectedQuiz: stateToSet[0].id // Set to first item (keeps it in line with *select* box display of the first option)
                    });
                }
            });

        }
    }

    startGame(event) {
        event.preventDefault();
        
    }

    componentDidMount () {
        let that = this; // Required for accessing 'this' in nested scopes

        db.getFacultyCourses(this.state.currentFaculty).on('value', (snapshot) => { // Problem: this is not a constant listener :/
            //console.log('courses: ' + courses);
            let tempState = snapshot.val();
            that.setState({
                courses: tempState,
                currentlySelectedCourse: Object.keys(tempState)[0]
            });
            console.log("1");
        });
        db.getCourseNames().on('value', (snapshot) => {
            that.setState({
                courseNames: snapshot.val()
            });
            console.log("2");
        });
        db.getAllQuizNames().on('value', (snapshot) => {
            that.setState({
                allQuizNames: snapshot.val()
            });
            console.log("3");
        });

            /*
            for (let course in courses) { // for each course key in the returned courses snapshot
                if (courses.hasOwnProperty(course)) {
                    console.log(courses[course]);
                    if(courses[course].faculty === that.state.currentFaculty) {
                        console.log(that.state.currentFaculty);
                        specificCourses.push(course);
                    }
                }
            }
            that.setState({
                courses: specificCourses
            }); */
            /* this.setState({
                courses: snapshot.val()
            }); */
            /*
            let formatted = [];
            for (let x in newState) { //iterates through found course list
                db.getCourseWithID(newState[x]['id']).once('value', (snapshot) => { // uses course id
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
                    that.validate(this.state.selectedCourses);
                });
            }
        }).then(function(readCountTxn) {
            // All promises succeeded.
            renderBlog({
                article: article,
                readCount: readCountTxn.snapshot.val()
            });
        }

        db.getFacultyName(this.state.currentFaculty).on('value', (snapshot) => {
            let name = snapshot.val();
            console.log(name);
            this.setState({
                currentName: name
            });
            */

    }
    createGame(){
        Randomizer.createPin(this.currentlySelectedQuiz);
    }

    render() {
            return (
                <FilterQuiz
                    handleChange={this.handleChange}
                    currentlySelectedCourse={this.state.currentlySelectedCourse}
                    currentlySelectedQuiz={this.state.currentlySelectedQuiz}
                    courses={this.state.courses}
                    courseNames={this.state.courseNames}
                    allQuizNames={this.state.allQuizNames}
                    quizzesInCourse={this.state.linkedQuizzes}
                    findQuizzesInCourse={this.handleFilterByCourse}
                />

            )
    }
}

class FilterQuiz extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event);
    }
    render () {
        return (
                <div className="mb-3">
                    <div className="form-group row mb-3">
                        <select name="currentlySelectedCourse" className="form-control"
                                value={this.props.currentlySelectedCourse}
                                onChange={this.handleChange} >
                            {Object.keys(this.props.courseNames).length && Object.keys(this.props.courses).map(key => {
                                return (<option name="courseOption"
                                                key={key}
                                                value={key}>{this.props.courseNames[key].name}</option>
                                )
                            })}
                        </select>
                    </div>
                    <button onClick={this.props.findQuizzesInCourse} className="btn btn-success btn-block">
                        Find Quizzes!
                    </button>

                {this.props.quizzesInCourse.length > 0 && // Only display this select dropdown when there are quizzes to display
                    <div className="mt-3">
                        <div className="form-group row mb-3">
                            <select name="currentlySelectedQuiz" className="form-control"
                                    value={this.props.currentlySelectedQuiz}
                                    onChange={this.handleChange}>
                                {this.props.quizzesInCourse.map(item => {
                                    return (<option name="quizOption"
                                                    key={item.id}
                                                    value={item.id}>{item.quizText}</option>
                                    )
                                })}
                            </select>
                        </div>

                        <button onClick={this.props.findQuizzesInCourse} className="btn btn-primary btn-block">
                            Start Quiz Game!
                        </button>
                    </div>
                }
                </div>
            /*
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
         */
        )
    }


}

export default GamePage;

export {
    GameCreation,
};
