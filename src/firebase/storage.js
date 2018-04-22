import { storage } from "./firebase";

// Storage Functions

export function getStorageRef() { // Root reference
    return storage.ref();
}

export function getQuestionImagesFolderRef() { // Images for question. Need to ensure you add specific sub-directory for the question (id), then place the images there
    return storage.ref().child('images/questionimages');
}

export function getAnswerImagesFolderRef() { // Images for answers. Need to ensure you add specific sub-directory for the question (id), then place the images there
    return storage.ref().child('images/answerimages');
}
