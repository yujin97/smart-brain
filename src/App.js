import React from 'react';
import { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai'
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceReconition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';


const app = new Clarifai.App({
 apiKey: '6190b1cecaf64ffca4c8e58ad5af934c'
});


const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable:true,
        value_area:800
      }
    }
  } 
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route:'signin',
  isSignedIn: false,
  user: {
  id: '',
  name: '',
  email: '',
  entries: 0,
  joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route:'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  componentDidMount() {
    fetch('http://localhost:3003')
      .then(response => response.json())
      .then(data => console.log(data))
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }    
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }  

  onSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('http://peaceful-refuge-09887.herokuapp.com/imageurl', {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({
      input: this.state.input
      })
    })  
    .then( response => response.json()) 
    .then( (response) => {
        console.log(response)
        if(response) {
          fetch('https://peaceful-refuge-09887.herokuapp.com/image', {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
           .then(response => response.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, { entries: count}))
              })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))

      })
      .catch(err => console.log(err));       
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn : true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box, user } = this.state;
    return (
      <div className="App">
        <Particles className = 'particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn = {isSignedIn}onRouteChange = { this.onRouteChange }/>
        { this.state.route === 'home' 
          ?  <div>
              <Logo />
              <Rank name = {user.name} entries = {user.entries}/>
              <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = {this.onSubmit}/>
              <FaceReconition box = { box }imageUrl = {imageUrl}/>
            </div>
          : (
              this.state.route === 'signin'
              ? <Signin onRouteChange = {this.onRouteChange} loadUser = {this.loadUser}/>
              : <Register onRouteChange = {this.onRouteChange} loadUser = {this.loadUser}/>
            )
        }
      </div>
    );
}
}

export default App;
