import firebase, {auth, provider} from "../../firebase/firebase";
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as routes from '../../constants/routes';
import logo from '../images/LogoLogin.png';

const LandingPage = () =>
    <div align = 'center'>
        <div>
            <img src = {logo} alt="logo"/>
        </div>
        <div class = 'signin'>
        	<SignInForm />
        </div>
    </div>

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
                <button onClick={this.logout} className="btn btn-light btn-lg" >Log Out</button>
                :
                <button onClick={this.login} className="btn btn-light btn-lg">Log In</button>
        )
    }
}

export default withRouter(LandingPage);

export {
    SignInForm,
};

