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
   render(){
      return (
         <div> hello main page </div>
      );
   }
}
class Display extends React.Component {
   
   
   constructor(props){
      super(props);
      this.navFunc = this.navFunc.bind(this);
      this.backNavFunc = this.backNavFunc.bind(this);
      const initalPage = (<Home navFunc={this.navFunc}/>);
      let id = 0;
      this.state = {
         history : [initalPage],
         index : 0,
         pages : [
            <WeatherMap key={id++} name="weather map"/>,
            <Test key={id++} name="Test page"/>,
         ]
      }
      window.addEventListener("popstate", (e) => this.backNavFunc(e));
   }

   navFunc(p){
         window.history.pushState({index : this.state.index + 1}, p.props.name);
         if(this.state.index + 1 < this.state.history.length 
               && this.state.history[this.state.index + 1] == p){
            this.setState({index : this.state.index + 1});
         } else {
            this.state.history = this.state.history.slice(0,this.state.index + 1);
            this.state.history.push(p);
            this.setState({history : this.state.history, index : this.state.index + 1}) ;
         }
   }
   backNavFunc(e) {
         let dir = -1; 
         if(e.state === undefined || e.state === null){
            dir = -1; 
         } else {
            dir = e.state.index > this.state.index ? 1 : -1;
         }
         this.setState({index : this.state.index + dir});  
   }

   render(){
      return (
         <div>
            <NavBar navFunc={this.navFunc} pages={this.state.pages} />
            {this.state.history[this.state.index]}
         </div>
      )
   }
}
ReactDOM.render(
   <Display />,
   document.getElementById('root')
);


