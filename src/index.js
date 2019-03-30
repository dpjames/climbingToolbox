import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WeatherMap from './WeatherMap.js';
import {NavBar} from "./Util.js";
import {Home} from "./Home.js";

class Display extends React.Component {
   
   
   constructor(props){
      super(props);
      this.navFunc = this.navFunc.bind(this);
      this.backNavFunc = this.backNavFunc.bind(this);
      const home = (<Home name="home"/>);
      let id = 0;
      this.state = {
         history : [home],
         index : 0,
         pages : [
            <Home key={id++} name="Home" />,
            <WeatherMap key={id++} name="Map" />,
         ]
      }
      window.addEventListener("popstate", (e) => this.backNavFunc(e));
   }

   navFunc(p){
         window.history.pushState({index : this.state.index + 1}, p.props.name);
         if(this.state.index + 1 < this.state.history.length 
               && this.state.history[this.state.index + 1] === p){
            this.setState({index : this.state.index + 1});
         } else {
            let newState = this.state;
            newState.history = this.state.history.slice(0,this.state.index + 1);
            newState.history.push(p);
            newState.index++;
            this.setState(newState);
         }
   }
   backNavFunc(e) {
         let dir = -1; 
         if(e.state === undefined || e.state === null){
            dir = -1; 
         } else {
            dir = e.state.index > this.state.index ? 1 : -1;
         }
         let newState = this.state;
         newState.index = this.state.index + dir;
         this.setState(newState);  
   }

   render(){
      let activeIndex = -1;
      let cpage = this.state.history[this.state.index];
      this.state.pages.forEach((p, i) => {
         if(p.type === cpage.type){
            activeIndex = i;
         }
      });
      return (
         <div>
            <NavBar active={activeIndex} navFunc={this.navFunc} pages={this.state.pages} />
            {this.state.history[this.state.index]}
         </div>
      )
   }
}
ReactDOM.render(
   <Display />,
   document.getElementById('root')
);


