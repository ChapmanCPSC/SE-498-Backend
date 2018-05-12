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
            currentScreen : 1, // 1: Main Screen - 2: PIN Screen - 3: Game Screen
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedCourse: "defaultOption",
            currentFaculty: "d31b1d9547b0467aa443",
            currentName: '',
            currentGame: {},
            currentGameRef: {},
            courses: {},
            courseNames: {},
            allQuizNames: {},
            linkedQuizzes: []
        };
        //this.handleSubmit = this.handleSubmit.bind(this);
        this.createGame = this.createGame.bind(this);
        this.handleFilterByCourse = this.handleFilterByCourse.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.beginGame = this.beginGame.bind(this);
        this.displayPin = this.displayPin.bind(this);
        this.removeStudent = this.removeStudent.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleFilterByCourse (e) {
        e.preventDefault();

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

    beginGame(event) {
        event.preventDefault();
        let that = this;
        if (!this.state.currentGame.started) {
            // Because this whole page uses a live, continuous listener for the game, we have to update it via the reference

            let startedUpdate = {};
            startedUpdate['/started'] = true; // Set started equal to true
            this.state.currentGameRef.update(startedUpdate).then(function() { // Commit updates
                // Switch to live game screen
                that.setState ({
                    currentScreen : 3
                });
            });


        }

    }

    displayPin(event) {
        event.preventDefault();

        let that = this;

        if (this.state.currentlySelectedQuiz !== "defaultOption") {
            // Generate a PIN
            const gameRef = db.getGames(); // set reference to the full list of games
            let pushedKey = gameRef.push(); // push a new game key to the Firebase Realtime Database

            let currDate = new Date();
            let dateAdd = currDate.toISOString().split('T')[0]; // Get current date
            let timeAdd = currDate.toTimeString().split(' ')[0]; // Get current time

            let keyVal = pushedKey.key; // save the actual key as a variable, for later use (maybe set it into state?)

            // Create the new data to put in the new Game object (no students yet)
            let newGameData = {
                datecreated : dateAdd, // Current date
                gamepin : utils.generatePIN(), // Generate a new PIN for the game
                quiz : that.state.currentlySelectedQuiz, // Set the current quiz
                started : false, // the quiz hasn't started yet, so we set this value to false
                timecreated : timeAdd // Current time
            };

            pushedKey.set(newGameData).then(function (snapshot) { // Go and push all the new data to the database
                pushedKey.on('value', (snapshot) => {
                    that.setState({
                        currentGame : snapshot.val(), // Set into state the current game object (will update live!)
                        currentScreen : 2, // Move over to the PIN Display screen,
                        currentGameRef : pushedKey
                    });
                })
            });
        }


    }

    // TODO: Not implemented yet. This function should remove the studentID passed into it from this.state.game.students
    removeStudent(event, studentID) {
        event.preventDefault();
    }

    componentDidMount () {
        let that = this; // Required for accessing 'this' in nested scopes

        db.getFacultyCourses(this.state.currentFaculty).on('value', (snapshot) => {
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

    }

    componentWillUnmount() {
        db.getFacultyCourses().off();
        db.getCourseNames().off();
        db.getAllQuizNames().off();
        // Need to also unmount the listener you set up in the function called 'Display Pin'
        // Use this.state.currentGameRef
    }

    createGame(){
        Randomizer.createPin(this.currentlySelectedQuiz);
    }

    render() {
        if(this.state.currentScreen === 1) { // If page has just been opened, and no quiz game is currently in progress
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
                    displayPin={this.displayPin}
                />
            )
        }
        else if (this.state.currentScreen === 2 || this.state.currentScreen === 3) {
            return (
                <div className="mb-3">
                    {this.state.currentScreen === 2 &&
                        <PINScreen
                            game={this.state.currentGame}
                            beginGame={this.beginGame}
                        />
                    }
                    {this.state.currentScreen === 3 &&
                        <LiveGameInfo

                        />
                    }
                    <StudentsInGame
                        game={this.state.currentGame}
                        removeStudent={this.removeStudent}
                    />
                </div>

            )
        }
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

                        <button onClick={this.props.displayPin} className="btn btn-primary btn-block">
                            Display PIN!
                        </button>
                    </div>
                }
                </div>
        )
    }


}

class GameScreen extends Component {
    constructor (props) {
        super(props);

    }
}

class PINScreen extends Component {
    constructor (props) {
        super(props);

    }

    render() {
        // {this.props.game.key} --- USE THIS IF YOU WANT TO GET THE KEY FOR THE GAME OBJECT
        return (
            <div>
                <div className="form-group row mb-3">
                    <div className="jumbotron mx-auto">
                        <h1 className="display-1"> {this.props.game.gamepin} </h1>
                        <p> Please enter the above PIN into your app</p>
                    </div>
                </div>
                <div className="form-group row mb-3">
                    <button onClick={this.props.beginGame} className="btn btn-primary btn-lg mx-auto">
                        Start Game
                    </button>
                </div>
            </div>
        )
    }
}

class LiveGameInfo extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        return null;
    }
}

// Component which displays students within a quiz game (live!)
class StudentsInGame extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        if(this.props.game.students) { // If students exists
            return (
                <div className="container">
                    <h1 className="display-4"> Students In Game </h1>
                    <div className="list-group">
                        {Object.keys(this.props.game.students).map((studentID) => {
                            return (
                                <a onClick={(event) => this.props.removeStudent(event, studentID)} className = "list-group-item list-group-item-action"> {studentID} </a>
                            )
                        }) }
                    </div>
                </div>

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
