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
                <GameCreation/>
            </div>
        </div>
    </div>

class GameCreation extends Component
{
    constructor() {
        super();
        this.state = {
            currentlySelectedQuiz: "defaultOption",
        };
    }

    render()
    {
        return (
            <form>
                <div class="form-group row">
                    <label for="quizInput" class = "col-form-label">Search for Quiz</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control-plaintext">Start typing...</input>
                    </div>
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