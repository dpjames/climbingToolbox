import React from 'react';
import './index.css';
import 'ol/ol.css';

import {Map, View} from 'ol';
import {Style, Circle, Fill, Stroke} from 'ol/style'
import {fromLonLat} from 'ol/proj';
import {Vector as VectorLayer, Tile} from 'ol/layer'
import {Vector, XYZ} from 'ol/source'
import {GeoJSON} from 'ol/format'
import {bbox} from 'ol/loadingstrategy'
import {defaults as defaultControls} from 'ol/control'
import {ButtonBar, ButtonStack, Button} from './Util.js'
import Overlay from 'ol/Overlay';


import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faArrowUp, faArrowDown, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
library.add(faArrowRight)
library.add(faArrowUp)
library.add(faArrowDown)
library.add(faArrowLeft)
library.add(faTimes)

const GEO_HOST = "http://raspberrypi:8080";
const MAX_RES = 1000;
//const GEO_HOST = "http://66.214.192.84:8080";
let DAY = 0;
let climbLayer = createClimbLayer();
let baseLayer = createTopoLayer();
let weatherLayer = createWeatherLayer();
let peaksLayer = createPeaksLayer();
let map = undefined;

let IS_MOBILE = () => {
   return window.innerWidth <= 1200;
}

class LegendDot extends React.Component{
   render(){
      let classList = "legendDot legend"+this.props.value;
      return(
         <div>
            <div className={classList}></div>
            <div className="legendLabel">{this.props.value}</div>
         </div>
      );
   }
}
class Legend extends React.Component {
   render(){
      let legendDots = [];
      for(let dot of this.props.dots){
         legendDots.push(<LegendDot key={dot} value={dot}/>);
      }
      return (
         <div id="legend">
            {legendDots}
         </div>
      );
   }
}
class TimeDisplay extends React.Component {
   render(){
      return (
         <div id="curTimeDisplay">Weather Forecast for Nowish</div>
      );
   }
}
class InfoPanel extends React.Component {
   render(){
      return (
         <div id="infoPanel">
            <TimeDisplay />
            <Legend dots={["Rain","Snow","Clear","Sunny","Cloudy","Loading","Unknown"]}/>
         </div>
      );
   }
}
class LayerToggleButton extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         on : props.on
      }
   }
   render(){
      return (
         <Button extraClass={this.state.on ? "on" : "off"} onClick={() => this.props.handler(this, this.props.layer)} text={this.props.text} />
      );
   }
}
class DateControls extends React.Component {
   constructor(props){
      super(props);
      let keyCount = 0;
      this.state = {
         buttons : [
            (<Button key={keyCount++} extraClass="flexFill" onClick={() => this.props.dateFunc(-1)} text={<FontAwesomeIcon icon="arrow-left" /> } />),
            (<Button key={keyCount++} extraClass="flexFill" onClick={() => this.props.dateFunc(1) } text={<FontAwesomeIcon icon="arrow-right" /> } />),
         ]
      }
   }
   render(){
      return (
         <ButtonBar buttons={this.state.buttons} />
      );
   }
}
class Header extends React.Component {
   constructor(props){
      super(props);
      this.updateDate = this.updateDate.bind(this);
      let keyCount = 0;
      console.log(props);
      this.state = {
         buttons : [
            (<LayerToggleButton layer={peaksLayer}   on={false} key={keyCount++} handler={toggleLayer}   text="toggle peaks" />),
            (<LayerToggleButton layer={climbLayer}   on={true}  key={keyCount++} handler={toggleLayer}   text="toggle climb" />),
            (<LayerToggleButton layer={weatherLayer} on={false} key={keyCount++} handler={toggleWeather} text="toggle weather" />)
         ],
      }
   }
   updateDate(dir){
      moveDate(dir);
      this.props.updateCallout({day : DAY});
   }
   render() {
      return (
         <div id="header" >
            <DateControls dateFunc={this.updateDate} />
            <div className={this.props.show ? "" : "hide"}>
               <ButtonStack buttons={this.state.buttons}/>
               <InfoPanel />
            </div>
         </div>
      )
   }
}
class WeatherControls extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         showHeader : !IS_MOBILE()
      }
      this.toggleHeader = this.toggleHeader.bind(this);
   }
   toggleHeader(){
      let newState = this.state;
      newState.showHeader = !newState.showHeader;
      this.setState(newState);
   }
   render(){
      console.log(this.state);
      return (
         <div id="weatherContols"> 
            <Header show={this.state.showHeader} updateCallout={this.props.updateCallout}/>
            <ControlsButton onClick={() => this.toggleHeader()} visible={this.state.showHeader} />
         </div>
      );
   }
}
class ControlsButton extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         show : (
            <div>
                 <FontAwesomeIcon icon="arrow-down" /> 
                 <div className="showHide">show controls</div>
                 <FontAwesomeIcon icon="arrow-down" />
            </div>
         ),
         hide : (
            <div>
                <FontAwesomeIcon icon="arrow-up" /> 
                <div className="showHide">hide controls</div>
                <FontAwesomeIcon icon="arrow-up" />
            </div>
         )
      }
   }
   render(){
      return (
         <Button text={this.props.visible ? this.state.hide : this.state.show } onClick={this.props.onClick}/>
      );
   }
}
class BetaWindow extends React.Component {
   constructor(props){
      super(props);
      this.changeActive = this.changeActive.bind(this);
      this.state={
         show : false,
         activeIndex : 0,
         spurl : "",
         mpurl : "",
         url : ""
      }
   }
   changeActive(index, url){
      this.setState({activeIndex:index, url:url}); 
   }
   render(){
      var classes = "betaWindow " + (this.state.show ? "" : "hide");
      var inum = 0;
      var pages = [
         <Button key={inum} extraClass={this.state.activeIndex === inum++ ? "active" : ""} onClick={() => this.changeActive(0, "spurl")} text="Summit Post" />,
         <Button key={inum} extraClass={this.state.activeIndex === inum++ ? "active" : ""} onClick={() => this.changeActive(1, "mpurl")} text="Mountain Project" />,
      ]
      return (
         <div className={classes}>
            <div className="offsetTop">
               <ButtonBar buttons={pages}/> 
            </div>
            <div className="button close" onClick={() => this.setState({show : false})}>
               <FontAwesomeIcon icon="times" />
            </div>
            <iframe title="betaWindow" src={this.state[this.state.url]}></iframe>
         </div>
      );
   }
}
class WeatherMap extends React.Component {
   constructor(props){
      super(props);
      this.updateCallout = this.updateCallout.bind(this);
      this.showBeta = this.showBeta.bind(this);
   }
   updateCallout(newState){
      this.callout.setState(newState);
   }
   showBeta(summitF, rockF){
      var spurl = "";
      var mpurl = "";
      if(summitF != null){
         spurl = "http://www.summitpost.org" + summitF.getProperties().URL;
      }
      if(rockF != null){
         console.log(rockF.getProperties());
         mpurl = rockF.getProperties().url;
      }
      let curl = this.beta.state.url  == "" ? spurl : this.beta.state.url;
      this.beta.setState({show : true, spurl : spurl, mpurl : mpurl, url : curl});
   }
   render(){
      return(
         <div id="mainContent">
            <WeatherControls updateCallout={this.updateCallout}/>
            <MapContainer />
            <MapCallout ref={c => this.callout = c} showBeta={this.showBeta} />
            <BetaWindow ref={b => this.beta = b} />
         </div>
      );
   }
}

class MapContainer extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         show : false
      }
   }
   render(){
      return (
         <div id="map"></div>   
      );
   }
   componentDidMount(){
      initMap();
   }
}

class MapCallout extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         weather : null,
         climb : null,
         peak : null,
      }
      this.updateCallout = this.updateCallout.bind(this);
   }
   render(){
      const convertToClick = (e) => {
         const evt = new MouseEvent('click', { bubbles: true })
         evt.stopPropagation = () => {}
         e.target.dispatchEvent(evt)
      }
      return (
         <div className={this.state.hidden ? "hide" : ""} id="mapCallout" onMouseUp={convertToClick}>
            <div className="button close" onClick={() => this.setState({hidden : true})}>
               <FontAwesomeIcon icon="times" />
            </div>
            <div><strong>Weather: </strong>       {this.state.weather === null ? "N/A" : this.state.weather.getProperties()['sfc' + DAY]}</div>
            <div onClick={() => console.log(this.state.climb)}><strong>Nearest Climb: </strong> {this.state.climb === null ? "N/A" : this.state.climb.getProperties().name}</div>
            <div><strong>Nearest Peak: </strong>  {this.state.peak === null ? "N/A" : this.state.peak.getProperties().NAME}</div>
            <Button extraClass="betaButton" text="Show Beta" onClick={() => this.props.showBeta(this.state.peak, this.state.climb)} />
         </div>
      )
   }

   updateCallout(e){
      if(e !== undefined){
         this.state.callout.setPosition(e.coordinate)
      }
      let newState = this.state;
      newState.weather = weatherLayer.getSource().getClosestFeatureToCoordinate(e.coordinate)
      newState.climb = climbLayer.getSource().getClosestFeatureToCoordinate(e.coordinate)
      newState.peak = peaksLayer.getSource().getClosestFeatureToCoordinate(e.coordinate)
      console.log(this.state.climb.getProperties());
      newState.hidden = false;
      if(!IS_MOBILE()){
         this.props.showBeta(this.state.peak, this.state.climb)
      }
      this.setState(newState);
   }
   componentDidMount(){
      let newState = this.state;
      newState.callout = new Overlay({element : document.getElementById('mapCallout')});
      this.setState(newState);
      map.addOverlay(this.state.callout);
      map.on('click', e => this.updateCallout(e));
   }
}





//LOGIC BELOW
function getColorForDescription(desc){
   desc = desc.toLowerCase()
   if(desc.indexOf("snow") > -1 ||
      desc.indexOf("frost") > -1){
      return "rgba(0,0,255,.5)";
   } else if(desc.indexOf("shower") > -1 ||
             desc.indexOf("rain") > -1 || 
             desc.indexOf("storm") > -1){
      return "rgba(0,255,0,.5)";
   } else if(desc.indexOf("sun") > -1){
      return "rgba(255,255,0,.5)";
   } else if(desc.indexOf("cloud") > -1 ||
             desc.indexOf("fog") > -1){
      return "rgba(100,100,100,.5)";
   } else if(desc.indexOf("clear") > -1){
      return "rgba(0,0,0,0)";
   } else if(desc.indexOf("loading") > -1){
      return "rgba(0,0,0,1)";
   }
   console.log(desc);
   return "red";
}
let staticWeatherStyle = new Style({
   image : new Circle({
      fill : new Fill({color : "blue"}),
      stroke : new Stroke({color : "black", width : "2"}),
      radius : 15
   })
});

function weatherStyle(f, r) {
   const props = f.getProperties();
   const weatherColor = getColorForDescription(props['sfc' + DAY]);
   staticWeatherStyle.getImage().getFill().setColor(weatherColor);
   staticWeatherStyle.setImage(staticWeatherStyle.getImage().clone());
   return staticWeatherStyle;
}
function getIntersectingDescription(f){
   const c = f.getGeometry().getCoordinates();
   const w = weatherLayer.getSource().getClosestFeatureToCoordinate(c); 
   if(w == null){
      return "loading";
   }
   return w.getProperties()['sfc' + DAY]
}
let staticClimbStyle = new Style({
   image : new Circle({
      fill : new Fill({color : "blue"}),
      stroke : new Stroke({color : "black", width : "2"}),
      radius : 8
   })
});

function climbStyle(f){
   let desc = getIntersectingDescription(f);
   staticClimbStyle.getImage().getFill().setColor(getColorForDescription(desc));
   staticClimbStyle.setImage(staticClimbStyle.getImage().clone());
   return staticClimbStyle
}
function createClimbLayer(){
   const src = new Vector({
      url:function(extent){
         return GEO_HOST + "/geoserver/climbing/climbs/wfs?service=WFS&version=1.1&typename=climbs&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      format: new GeoJSON(),
      strategy: bbox,
      crossOrigin: 'anonymous'
   });
   const climbLayer = new VectorLayer({
      title:"climbs",
      source:src,
      style : climbStyle,
      maxResolution : MAX_RES,
   });
   return climbLayer;
}
function createWeatherLayer(){
   const src = new Vector({
      url:function(extent){
         let bufferX = Math.abs(extent[0] - extent[2])/4;
         let bufferY = Math.abs(extent[1] - extent[3])/4;
         extent[0]-=bufferX
         extent[1]-=bufferY 
         extent[2]+=bufferX
         extent[3]+=bufferY 
         return GEO_HOST + "/geoserver/climbing/weather/wfs?service=WFS&version=1.1&typename=weather&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      format: new GeoJSON(),
      strategy: bbox
   });
   //maybe cluster
   const weatherlayer = new VectorLayer({
      title:"weather",
      source:src,
      style : nostyle,
      maxResolution : MAX_RES,
   });
   return weatherlayer;
}
function nostyle(f){
   return undefined;
}
function createTopoLayer(){
   return new Tile({
       title: 'OSM',
       type: 'base',
       visible: true,
       source: new XYZ({
           url: '//{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
           //url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
           //url: 'http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
           //url: 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
           //url: 'http://tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
       })
   });   
}
function initMap(){
   const mapel = document.getElementById("map");
   mapel.innerHTML = "";
   const layers = [
      baseLayer,
      weatherLayer,
      climbLayer,
   ];
   const view = new View({
      center : fromLonLat([-122.44, 40.25]),
      zoom: 8
   });
    map = new Map({
      target:"map",
      layers:layers,
      view:view,
      controls : defaultControls({
         zoom : false,
      }),
   });
}
function moveDate(delta){
   DAY+=delta;
   DAY = DAY < 0 ? 0 : DAY;
   DAY = DAY > 13 ? 13 : DAY;
   let f = weatherLayer.getSource().getFeatures()[0]
   let times = [];
   let daystr = "zoom for dates";
   console.log(f);
   if(f){
      times = f.getProperties();
      daystr = times['name'+DAY];
   } 
   document.getElementById("curTimeDisplay").innerHTML = "Weather Forecast for " + daystr;
   map.getLayers().forEach(l => l.get('title') !== "OSM" ? l.getSource().refresh() : undefined);
}

function createPeaksLayer(){
   const src = new Vector({
      format: new GeoJSON(),
      url:function(extent){
         return GEO_HOST + "/geoserver/climbing/peaks/wfs?service=WFS&version=1.1&typename=peaks&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      strategy: bbox});
   let peaksLayer = new VectorLayer({
      title: "peaks layer",
      source: src,
      style: climbStyle,
      maxResolution : MAX_RES,
   });
   return peaksLayer;
}
function toggleOn(caller){
   let on = caller.state.on;
   caller.setState({on : !caller.state.on});
   return on;
}
function toggleLayer(caller, l){
   let on = toggleOn(caller);
   on ? map.removeLayer(l) : map.addLayer(l);
}
function toggleWeather(caller){
   let on = toggleOn(caller);
   on ? weatherLayer.setStyle(nostyle) : weatherLayer.setStyle(weatherStyle);
}

export default WeatherMap;

