import * as firebase from 'firebase';

const prodConfig = {
    apiKey: "AIzaSyAWJEhgK19vZkUH4jWRCmDnrmlrWycgPug",
    authDomain: "cusp-quiz-app.firebaseapp.com",
    databaseURL: "https://cusp-quiz-app.firebaseio.com",
    projectId: "cusp-quiz-app",
    storageBucket: "cusp-quiz-app.appspot.com",
    messagingSenderId: "678976715567"
};

const devConfig = {
    apiKey: "AIzaSyAWJEhgK19vZkUH4jWRCmDnrmlrWycgPug",
    authDomain: "cusp-quiz-app.firebaseapp.com",
    databaseURL: "https://cusp-quiz-app.firebaseio.com",
    projectId: "cusp-quiz-app",
    storageBucket: "cusp-quiz-app.appspot.com",
    messagingSenderId: "678976715567"
};

const config = process.env.NODE_ENV === 'production'
  ? prodConfig
  : devConfig;

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();

export {
    provider,
    db,
    storage,
    auth,
};
