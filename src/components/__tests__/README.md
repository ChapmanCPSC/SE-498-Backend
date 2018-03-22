## Build, Deploy, and Test 
# React Framework

> The Web Portal section of the Pharmacy School quiz application is built using the [React Framework](https://reactjs.org/).


* In order to run our web application, you need to install the necessary tools. If you don't already have it, first you need to install [Node.js](https://nodejs.org/en/download/).

* Also, install [Yarn](https://yarnpkg.com/lang/en/docs/install/).

* Once you have these, you can now install, run, and build React!
```
npm install -g create-react-app
```
* Now, cd into the repo directory. It's time to install npm dependencies associated with our project! (Note: this can take a while).

```
npm install
```

* You can now build and run our application locally!

```
yarn build
yarn start
```

* That's it!

# Firebase

> Our database and hosting service is running on Google's [Firebase](https://firebase.google.com). Though you are able to run our project locally, we deploy our website using the [Firebase CLI](https://firebase.google.com/docs/cli/)

* Before deploying, use a Google account to create a project in [Firebase](https://console.firebase.google.com/u/0/)! You will need to use this to sign into Firebase and deploy your website to use its free hosting service!

* Now, we can get started. Since you already should have Node.js installed due to installing the React framework in the previous section, we can begin installing Firebase!

* Open a command window type the following:
```
npm install -g firebase-tools
```
* Now log in!
```
firebase login
```

* If you take a look at the repo, you will notice that our firebase.json and database.rules.json is all set up and ready to be deployed! The only thing you will have to change is the project name in the .firebaserc file.

```js
	{
	  "projects": {
	    "default": "cusp-quiz-app"
	  }
	}
```

* Change the "cusp-quiz-app" to the name of the project you made in the previous steps!

* Once that is taken care of, cd into the repo directory and run the following command. When prompted for user input, just enter all the way through, as the necessary .jsons already exist in the repo.

```
firebase init
```
* Once this is set up, we are ready to deploy!

```
firebase deploy
```

* And that is it! You should be able to see your website at <yourprojectname>.firebaseapp.com


# CircleCI Intergration Testing [![build](https://circleci.com/gh/ChapmanCPSC/SE-498-Backend.png?style=shield&circle-token=76c4b73a28b85f2ccdc01619ca1bf04babbd5f0a)](https://circleci.com/gh/ChapmanCPSC/SE-498-Backend)

> For this project, we are using CircleCI [CircleCI](https://circleci.com/), which is a tool that directly interfaces with a github repo for fast and easy testing that can be automated.
> Using the React framework, we will be following closely how to run builds based on this [document](https://medium.com/@Zaccc123/https-medium-com-zaccc123-continuous-integration-and-deployment-setup-for-react-app-7b5f4bd76cdd).

* CircleCI is set up to run tests everytime a merge occurs within the github repo. It takes instructions from your config.yml file and runs the unit tests you specify.

* The config.yml has already been made and it exists within the .circleci directory, in which CircleCI searches for testing instruction.

* Since we are using react, which is built from node.js, within your .yml, make sure yarn install is included. If not, the dependcies will not be installed and your code tests will fail!

* When running tests, there are two changes to this config file that may need to be made. Make sure the working_directory is set to the specified location where the test code is. Second, the "jest -u" command is set to this current folder. If your test code exists in another folder, change this.

* Regarding the structure of the config.yml file and extra capabilities, please refer to this [document](https://circleci.com/docs/2.0/sample-config/)



