import React, { Component } from 'react';
import { db } from '../../firebase';
import { firebase } from '../../firebase';
import { time } from 'react-time';
export class Randomizer extends Component{
    constructor(){
        super();
        this.state = {
            newquizID: 0,
            newGamePin : 0
        }
        this.generatePin = this.generatePin.bind(this);
        this.updatePin = this.updatePin.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    generatePin(){
        var val = Math.floor(1000 + Math.random() * 9000);
        return val;
    }
    updatePin(quizID){
        this.setState = {
            newquizID: quizID
        };
        var val = this.generatePin();
        this.setState = {
            newGamePin: val
        }
        this.handleSubmit();
    }
    handleSubmit(e){
        e.preventDefault();
        const ref = db.getGames();
        let currentTime = new Date();
        const newGame = {
            datecreated: currentTime,
            gamepin: this.state.newGamePin,
            quiz: this.state.newquizID,
            students: [] //fix this later, neeed to get students from course info
        }
        ref.push(newGame);
        this.setState({
            newquizID: 0,
            newGamePin : 0
        })
    }
}
