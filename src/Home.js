import React from 'react';

class Home extends React.Component {
   render(){
      return (
         <div className="intro">
            <div>
            Welcome to my website. Theres not much here yet, but I'll 
            be developing it more in my free time.
            As of right now the main funcitonality centers around weather forecasts.
            Specifically weather forecasts for rock climbing areas and summits. 
            This project aims to answer the question "where will the weather be good enough to climb this weekend?".
            Hopefully the interface is self-explanatory
            but if not I'd 
            love feedback. 
            The arrows let you step through time. Clicking on the map will let you view information about where you clicked, 
            and show beta about the nearest points of interest. 
            </div>
            <br></br>
            <div>
            <strong>Only Washington, Oregon, and California have climbing data right now (this will soon be updated to include the entire west).
            Weather data is only from Eastern Colorado border to the west coast. Eventually it will be updated to include the entire US.</strong>
            </div>
            <br></br>
            Shoot me emails at climbingToolbox@gmail.com
         </div>
      );
   }
}
export {Home};
