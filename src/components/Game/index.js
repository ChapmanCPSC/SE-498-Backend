import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'
import '../css/bootstrap/dist/css/bootstrap.min.css';

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

class GameCreation extends Component {
    constructor() {
        super();
        this.state = {
            currentlySelectedQuiz: "defaultOption",
        };
    }

    render() {
        return (
            <button class="btn btn-info"> Create Game </button>
        )
    }
}

export default GamePage;

export {
    GameCreation,
};