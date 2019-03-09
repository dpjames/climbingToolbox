import React from 'react';

class Button extends React.Component {
   render(){
      let classes = "button " + this.props.extraClass;
      return (
         <div className={classes} onClick={this.props.onClick}>{this.props.text}</div>
      )
   }
}
class ButtonBar extends React.Component {
   render(){
      return (
         <div className="buttonBar">
            {this.props.buttons}
         </div>
      );
   }
}
class ButtonStack extends React.Component {
   render(){
      return (
         <div className="buttonStack">
            {this.props.buttons}
         </div>
      );
   }
}
class NavBar extends React.Component {
   constructor(props) {
      super(props);
      let id = 0;
      let buttons = []
      this.props.pages.forEach((p) => {
         buttons.push(<Button key={id++} onClick={() => this.props.navFunc(p)} text={p.props.name} extraClass=""/>);
      });
      this.state = {
         buttons : buttons
      }
   }
   render(){
      return (<ButtonBar buttons={this.state.buttons} />)
   }
}
export {ButtonStack, ButtonBar, Button, NavBar }
       
