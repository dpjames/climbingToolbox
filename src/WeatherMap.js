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

import {ButtonBar, Button} from './Util.js'

let DAY = 0;
let climbLayer = createClimbLayer();
let baseLayer = createTopoLayer();
let weatherLayer = createWeatherLayer();
let peaksLayer = createPeaksLayer();
let map = undefined;



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
         <Button extraClass={this.state.on ? "on" : "off"} onClick={() => this.props.handler(this, this.props.layer)} text={this.props.text}/>
      );
   }
}
class Header extends React.Component {
   constructor(props){
      super(props);
      let keyCount = 0;
      this.state = {
         buttons : [
            (<Button key={keyCount++} onClick={() => moveDate(-1)} text="prev 12 hrs" />),
            (<Button key={keyCount++} onClick={() => moveDate(1)} text="next 12 hrs" />),
            (<LayerToggleButton layer={peaksLayer} on={false} key={keyCount++} handler={toggleLayer}   text="toggle peaks layer" />),
            (<LayerToggleButton layer={climbLayer} on={true}  key={keyCount++} handler={toggleLayer}   text="toggle climb layer" />),
            (<LayerToggleButton layer={weatherLayer} on={false} key={keyCount++} handler={toggleWeather} text="toggle weather overlay" />)
         ],
      }
   }
   render() {
      return (
         <div id="header">
            <ButtonBar buttons={this.state.buttons}/>
            <InfoPanel />
         </div>
      )
   }
}
class WeatherMap extends React.Component {
   render(){
      return(
         <div id="mainContent">
            <Header />
            <MapContainer />
         </div>
      );
   }
   componentDidMount(){
      initMap();
   }
}
class MapContainer extends React.Component {
   render(){
      return (
         <div id="map">this will be the map</div>   
      );
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


function weatherStyle(f) {
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
         return "/geoserver/climbing/climbs/wfs?service=WFS&version=1.1&typename=climbs&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      format: new GeoJSON(),
      strategy: bbox
   });
   const climbLayer = new VectorLayer({
      title:"climbs",
      source:src,
      style : climbStyle
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
         return "/geoserver/climbing/weather/wfs?service=WFS&version=1.1&typename=weather&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      format: new GeoJSON(),
      strategy: bbox
   });
   //maybe cluster
   const weatherlayer = new VectorLayer({
      title:"weather",
      source:src,
      style : nostyle
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
   });
}
function moveDate(delta){
   DAY+=delta;
   DAY = DAY < 0 ? 0 : DAY;
   DAY = DAY > 13 ? 13 : DAY;
   const times = weatherLayer.getSource().getFeatures()[0].getProperties();
   let daystr = times['name'+DAY];
   document.getElementById("curTimeDisplay").innerHTML = "Weather Forecast for " + daystr;
   map.getLayers().forEach(l => l.get('title') !== "OSM" ? l.getSource().refresh() : undefined);
}

function createPeaksLayer(){
   const src = new Vector({
      format: new GeoJSON(),
      url:function(extent){
         return "/geoserver/climbing/peaks/wfs?service=WFS&version=1.1&typename=peaks&request=GetFeature&outputFormat=application/json&srsname=EPSG:3857&bbox="
            +extent.join(",")+",EPSG:3857";
      },
      strategy: bbox});
   let peaksLayer = new VectorLayer({
      title: "peaks layer",
      source: src,
      style: climbStyle
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

