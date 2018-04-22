import uuidv1 from 'uuid/v1';
import { db } from '../firebase';

export function generateAnswerID() {
    return uuidv1();
}
