import { db } from '../../firebase';
import { firebase } from '../../firebase';

var val = Math.floor(1000 + Math.random() * 9000);
console.log(val);
class Randomizer {
    constructor(){

        this.generatePin = this.generatePin.bind(this);
    };

    generatePin(){
        var val = Math.floor(1000 + Math.random() * 9000);
        return val;
    }
    updatePin(quizID){
        //check if game exists
        //create game
        var val = this.generatePin();


    }
}