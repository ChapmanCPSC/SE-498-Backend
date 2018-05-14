import firebase, {auth, provider} from "../../firebase/firebase";
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as routes from '../../constants/routes';
import logo from '../images/LogoLogin.png';



const LandingPage = () =>
    <div align = 'center' className="center-block">
        <main>
            <div>
                <img src={logo} alt="logo"/>
            </div>
            <div className="jumbotron mb-5 bg-info text-white">
                <h1 className="display-4">Welcome!</h1>
		<p className="lead"> This is the QuizEdu Administrative Site.</p>
                <p className="lead">Here, you can manage questions, quizzes, games, and many other aspects of the QuizEdu
                    platform!</p>
            </div>
            <div className='signin mb-5'>
                <SignInForm/>
            </div>
        </main>
        <hr />
        <footer className="container">
            <p>Developed by Chapman University</p>
        </footer>
    </div>;

const updateByPropertyName = (propertyName, value) => () => ({
    [propertyName]: value,
});


class SignInForm extends Component {
    constructor() {
        super();
        this.state = {
            user: null
        }
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount(){
        auth.onAuthStateChanged((user) => {
            if(user){
                this.setState({user});
            }
        })
    }

    login() {
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                this.setState({
                    user
                })
            })
    }

    logout(){
        auth.signOut()
            .then(() => {
                this.setState({
                    user: null
                })
            })
    }

    render() {
        return (
            this.state.user ?
                <button onClick={this.logout} className="btn bg-danger text-white btn-lg" >Log Out</button>
                :
                <button onClick={this.login} className="btn btn-light btn-lg">Log In</button>
        )
    }
}

export default withRouter(LandingPage);

export {
    SignInForm,
};
