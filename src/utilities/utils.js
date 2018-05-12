import uuidv1 from 'uuid/v1';
import { db } from '../firebase';

export function generateAnswerID() {
    return uuidv1();
}

export function generatePIN(){
    return Math.floor(1000 + Math.random() * 9000);
}