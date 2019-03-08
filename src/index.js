import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WeatherMap from './WeatherMap.js';
import {NavBar} from "./Util.js";

class Test extends React.Component {
   render(){
      return (<div>hello I am {this.props.name}</div>);
   }
}
class Home extends React.Component {
   constructor(props) {
      super(props);
      let id = 0;
      this.state = {
         pages : [
            <WeatherMap key={id++} name="weather map"/>,
            <Test key={id++} name="Test page"/>,
         ]
      }
   }
   render(){
      return (
         <NavBar navFunc={this.props.navFunc} pages={this.state.pages} />
      );
   }
}
class Display extends React.Component {
   constructor(props){
      super(props);
      let navFunc = (p) => {
         window.history.pushState({index : this.state.index + 1}, p.props.name);
         if(this.state.index + 1 < this.state.history.length 
               && this.state.history[this.state.index + 1] == p){
            this.setState({index : this.state.index + 1});
         } else {
            this.state.history = this.state.history.slice(0,this.state.index + 1);
            this.state.history.push(p);
            this.setState({history : this.state.history, index : this.state.index + 1}) ;
         }
         console.log(this.state);
      }
      let backNavFunc = (e) => {
         debugger;
         console.log(this.state);
         let dir = e.index === null || e.state.index > this.state.index ? 1 : -1;
         console.log(this.state);
         this.setState({index : this.state.index + dir});  
      }
      const initalPage = (<Home navFunc={navFunc}/>);
      this.state = {
         history : [initalPage],
         index : 0
      }
      window.addEventListener("popstate", (e) => backNavFunc(e));
   }
   render(){
      console.log(this.state);
      return this.state.history[this.state.index]
   }
}
ReactDOM.render(
   <Display />,
   document.getElementById('root')
);


