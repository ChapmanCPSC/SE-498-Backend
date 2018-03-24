import uuidv1 from 'uuid/v1';
import { db } from '../firebase';

export function generateAnswerID() {
    return uuidv1();
}

export function calculatePoints(questions) {
    let total = 0;
    Object.keys(questions).forEach(quesID => {
        db.getQuestionPoints(quesID).once('value').then(function(snapshot) {
            total += snapshot.val();
            console.log(total);
        });
    });
    return total;
}