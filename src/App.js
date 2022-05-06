import logo from './logo.svg';
import { Tabs, Tab } from 'react-bootstrap';
import React, {Component } from "react";
import './App.css';
import { saveAs } from 'file-saver';

const { createCanvas, loadImage } = require("canvas");

function timeout(delay) {
  
  return new Promise( res => setTimeout(res, delay) );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  var d = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
  ].join(' ');

  return d;
}

function mapNumber(number, in_min, in_max, out_min, out_max) {
  return (
      ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  );
}

const SVGCircle = ({ radius }) => (
  <svg className="countdown-svg">
      <path
          fill="none"
          stroke="#333"
          strokeWidth="4"
          d={describeArc(50, 50, 48, 0, radius)}
      />
  </svg>
);

function svgToPng(svg, callback) {
  const url = getSvgUrl(svg)
  svgUrlToPng(url, (imgData) => {
    callback(imgData);
    URL.revokeObjectURL(url);
  });
}

function getSvgUrl(svg) {
  return URL.createObjectURL(new Blob([svg], {
    type: 'image/svg+xml'
  }));
}

function svgUrlToPng(svgUrl, callback) {
  const svgImage = document.createElement('img');
  document.body.appendChild(svgImage);
  svgImage.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgImage.clientWidth;
    canvas.height = svgImage.clientHeight;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.drawImage(svgImage, 25, 25);
    const imgData = canvas.toDataURL('image/png');
    callback(imgData);
    document.body.removeChild(svgImage);
  };
  svgImage.src = svgUrl;
}

class App extends Component {
  

// MENU 1 COUNTDOWN
  async countdown(datetime){

    this.state.i = this.state.i + 1;
    
    if (this.state.i === 2){
      this.state.i = 1;
      clearInterval(this.interval);
    }
    console.log(this.state.i) 

    this.interval = setInterval(() => { 
      const date1 = new Date();
      const date2 = new Date(datetime);

      const  dif = new Date(date2.getTime() - date1.getTime());

      var year = dif.getUTCFullYear() - 1970;
      var month = dif.getUTCMonth() ;
      var day = dif.getUTCDate() - 1;
      var hour = dif.getUTCHours() ;
      var minute = dif.getUTCMinutes() ;
      var second = dif.getUTCSeconds();

      if (dif < 0){
        year = 0;
        month = 0;
        day = 0;
        hour = 0;
        minute = 0;
        second = 0;
      }
    
      this.setState({ year, month, day, hour, minute, second});

    }, 1000);
  }
 
// MENU 2 PINATA AND IMAGEUPLOAD  
  async pinata(name, strength){   
    const pinataApiKey = "5b4324fda5106b24845f";
    const pinataSecretApiKey = "446cc7cb18e03f24097bf3fa3e20aa1a2dd23630df3e41a476b344ed8d5cc871";
    const axios = require("axios");
    const FormData = require("form-data");

    const pinFileToIPFS = async () => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      let data = new FormData();
      data.append("file", this.state.selectedFile);
        
      const res = await axios.post(url, data, {
        maxContentLength: "Infinity", 
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: pinataApiKey, 
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });   
        
      this.state.name = name;
      this.state.strength = strength;
      this.state.ipfshash = res.data.IpfsHash;

      console.log(res.data.IpfsHash);
    };
    pinFileToIPFS();  
  } 

  async pinata2(){  
    const pinataApiKey = "5b4324fda5106b24845f";
    const pinataSecretApiKey = "446cc7cb18e03f24097bf3fa3e20aa1a2dd23630df3e41a476b344ed8d5cc871";
    const axios = require("axios");

    const pinJSONToIPFS = async() => {  

      const metadata = {
        pinataMetadata: {
          name: 'TestArt',
          keyvalues: {
            ItemID: 'Item001',
            CheckpointID: 'Checkpoint001',
            Source: 'CompanyA',
            WeightInKilos: 5.25
          }
        },
        pinataContent: {
          "name": this.state.name,
          "hash": "https://ipfs.io/ipfs/" + this.state.ipfshash, 
          "strength": this.state.strength,
          "by": "Kevin Thamrin"
        }
      }

      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;  
      const res = await axios.post(url, metadata, {
        headers: {
          pinata_api_key: pinataApiKey, 
          pinata_secret_api_key: pinataSecretApiKey,
        },      
      });

      console.log(res.data.IpfsHash);
      this.state.ipfshash2 = res.data.IpfsHash;
    }
      pinJSONToIPFS();  
  } 

  onFileChange = event => {     
    this.setState({ selectedFile: event.target.files[0] });

    let reader = new FileReader();
    reader.onload = (e) => {
      this.setState({image: e.target.result});
    };
    reader.readAsDataURL(event.target.files[0]);

  };

  fileData = () => {
    if (this.state.selectedFile) {      
        
      return (
        <div>
          <h4>File Details:</h4>
            
          <p>File Name: {this.state.selectedFile.name}</p>      
          <p>File Type: {this.state.selectedFile.type}</p>
            
          <p>
            Last Modified:{" "}
            {this.state.selectedFile.lastModifiedDate.toDateString()}   
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h5>Choose before Pressing the Upload button</h5>
        </div>
      );
    }
  };

  
// MENU 3 NFT FACTORY

  async generate(prefix, description, url, rarity, items){  

    var brd = document.getElementById("board");
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    var row = document.createElement("tr");
    var i = 0;
    var idx = items ;

    const data0 = await this.state.layer[1][0]; 
    const data0name = data0.name;
    const re = 'svg';
    const imageType = await data0name.match(re);
    this.setState({imageType})

    var svg = [];
    this.setState({svg});
    var finish = [];
    this.setState({finish});
    var JSON = [];
    this.setState({JSON});

    do {

      if(imageType == 'svg'){
        await this.createImage(idx, prefix, description, url, rarity, items);
        await timeout(500); //for 0.5 sec delay
        if ( idx < items && idx > 0){
          if ( i === 0 || i === 2 ){
            i = 1;
            row = document.createElement("tr");
            var cell = document.createElement("td");
            cell.innerHTML = `<img src=${this.state.result}  />`;  
            //console.log(this.state.result);
            row.appendChild(cell);
            tblBody.appendChild(row);        
            tbl.appendChild(tblBody);
            brd.appendChild(tbl);
    
          }else {
            i = i + 1;
            cell = document.createElement("td");
            cell.innerHTML = `<img src=${this.state.result}  />`;
            row.appendChild(cell);
            tblBody.appendChild(row);        
            tbl.appendChild(tblBody);
            brd.appendChild(tbl);
          }      
        }
      } else {

        await this.createPNG(idx, prefix, description, url, rarity, items);
        await timeout(500); //for 0.5 sec delay

        if ( idx < items && idx > 0){
          if ( i === 0 || i === 4 ){
            i = 1;
            row = document.createElement("tr");
            cell = document.createElement("td");
            cell.innerHTML = `<img src=${this.state.result}  />`;  
            //console.log(this.state.result);
            row.appendChild(cell);
            tblBody.appendChild(row);        
            tbl.appendChild(tblBody);
            brd.appendChild(tbl);
    
          }else {
            i = i + 1;
            cell = document.createElement("td");
            cell.innerHTML = `<img src=${this.state.result}  />`;
            row.appendChild(cell);
            tblBody.appendChild(row);        
            tbl.appendChild(tblBody);
            brd.appendChild(tbl);
          } 
        }     
      }   
      idx--;

      if(idx == 0){
        var containerButton = document.getElementById("containerButton");
        containerButton.appendChild(document.createElement("br"));   
        var button = document.createElement("button");
        button.innerHTML = 'Download'
        button.className='btn btn-primary'

        button.onclick = function (){
          this.downloadzipJSON();
          this.downloadzipPNG();
      }.bind(this);
        containerButton.appendChild(button);
        
      }
    } while (idx >= 0 && this.state.end === 0);
  }

  async randInt(max ) {
    return Math.floor(Math.random() * (max));
  }

  async randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async getRandomName() {
    const takenNames = {};
      const adjectives = 'fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical'.split(' ');
      const names = 'aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis'.split(' ');
        
      const randAdj = await this.randElement(adjectives);
      const randName = await this.randElement(names);
      const name = `${randAdj}-${randName}`;

      if (takenNames[name] || !name) {
        return this.getRandomName();
      } else {
        takenNames[name] = name;
        return name;
      }
  }

  async combineImage(layer) {

      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <layer/>
      </svg>
      ` 
  
      const final = template
      .replace('<layer/>', await layer)
  
      return final;
  }
  
  async generateRandomImages() {
    var layerImage = [null];
    var itemsName = [];

    for(var i = 0; i < (this.state.layer.length - 1); i++){
      const randomNumber = await this.randInt(this.state.layer[i + 1].length);
      console.log(randomNumber)
      itemsName[i + 1] = await this.state.layer[i + 1][randomNumber].name.replace('.svg','');
      this.setState({itemsName})

      const data0 = await this.state.layer[i+1][randomNumber]; 

      const reader = new FileReader();
      reader.readAsText(data0);
      reader.onload = (e) => {
        const svg = reader.result;
        const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
        const layerResult = svg.match(re)[0];
        layerImage.push(layerResult);
        const final = this.combineImage(layerImage);
        this.setState({final});
      };     
    }
    
    return this.state.final;
  }

  async checkImage(rarity){
  
    //var possibleCombinations = rarity * (this.state.head.length * this.state.eyes.length /* this.state.nose.length  * this.state.mouth.length  * this.state.hair.length * this.state.beard.length*/);
    // 9600 combinations
  
    var rarityCombinations = rarity * this.state.possibleCombinations;

    let reachedEnd = false;

    for (var i=0; i < rarityCombinations; i++){
      var newFace = await this.generateRandomImages();

      var repeated = 0;

      for (var j = 0; j < this.state.svg.length ; j++){
        console.log(j);
        console.log(this.state.svg.length);
        //console.log(this.state.svg[j]);
        //console.log(await newFace);

        if (this.state.svg[j] == await newFace){
          repeated++;  
          //console.log("Repeat");
        }         
      }         
      if(repeated < rarity){
        reachedEnd = false;
        //console.log('Continue');
        return newFace;   
      }
      if(reachedEnd == true){
        //console.log('No more possible combination');
      } 
      //console.log('end'); 
    } 
  }

  async createImage(idx, prefix, description, url, rarity, items) {

    var newFace = await this.generateRandomImages();

    this.state.svg.push(newFace);
     
    const name = await this.getRandomName();
    //console.log(name);

    const attributes = [];

    for(var i = 0; i < (this.state.layer.length - 1); i++){
      attributes[i] = { 
        trait_type: await this.state.layerName[(i+1)],
        value: await this.state.itemsName[i+1]
      }
    }

    const meta = {      
      name: `${prefix} #${idx}`,
      description: `${description} ${name.split('-').join(' ')}`,
      image : ``,
      external_url : `${url}`,
      attributes: attributes
    } 
    this.state.JSON.push(meta);

    svgToPng(newFace, (imgData) => {
      let image = new Image();
      image.onload = () => {
            
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, 150, 150);
        var png = [];

        png = canvas.toDataURL().toString();
        //this.setState({png});
        this.state.finish.push(png) ;
      };

      image.src = imgData;
      const result =image.src;
      this.setState({result});
    }); 
  } 

  async createPNG(idx, prefix, description, url, rarity, items) {
    
    const  imageFormat = {
      width: 300,
      height: 300 
    };

    var itemsName = [];
    var randomNumber = [];

    const  canvas = createCanvas(imageFormat.width, imageFormat.height);
    const  ctx = canvas.getContext("2d");


    var rarityCombinations = rarity * this.state.possibleCombinations;

    for(var l = 0; l < (rarityCombinations+1); l++){
      if (l === rarityCombinations){
        console.log('end');
        this.state.end = 1;
        console.log(this.state.finish.length);
        break;
      }
      var repeated = 0;

      console.log('start')
      for(var i = 0; i < (this.state.layer.length - 1); i++){
        randomNumber[i] = await this.randInt(this.state.layer[i+1].length);
        //console.log(randomNumber)
      }

      for(var k = 0; k < (this.state.takenImage.length - 1); k++){
        console.log(randomNumber.join(''))
        console.log(this.state.takenImage[k+1])
        if(randomNumber.join('') === this.state.takenImage[k+1]){
          repeated = repeated + 1;
          console.log(repeated);
        }
      }

      if (repeated < rarity){
        this.state.takenImage.push(randomNumber.join(''));

        for(var i = 0; i < (this.state.layer.length - 1); i++){
          itemsName[i+1] = await this.state.layer[i+1][randomNumber[i]].name.replace('.png','');
          //console.log(itemsName)
    
          var blob = new Blob([await this.state.layer[i+1][randomNumber[i]]]);
          var bloburl  = window.URL.createObjectURL(blob);
    
          const  layerImage = await loadImage(bloburl);
          ctx.drawImage(layerImage,0,0,imageFormat.width,imageFormat.height);
        }

        var png = undefined;
        png = canvas.toDataURL();
    
        const result = png;
        this.state.finish.push(result);
    
        this.setState({result});
          
        const name = await this.getRandomName();
        //console.log(name);
    
        const attributes = [];
    
        for(var j = 0; j < (this.state.layer.length - 1); j++){
          attributes[j] = { 
            trait_type: await this.state.layerName[(j+1)],
            value: await itemsName[j+1]
          }
        }
    
        const meta = {      
          name: `${prefix} #${idx}`,
          description: `${description} ${name.split('-').join(' ')}`,
          image : ``,
          external_url : `${url}`,
          attributes: attributes
        } 
        this.state.JSON.push(meta);
        break;  
      } 
      else {
      console.log('repeat');
      }
    } 

  }

  async downloadzipPNG() {

    var JSZip = require("jszip");
    let zip = new JSZip();

    var img = zip.folder("Images");

    if(this.state.imageType == 'svg'){
      for (var i = 0; i < (this.state.finish.length -1); i++){
        const imgData = await this.state.finish[i].replace('data:image/png;base64,','');
        img.file(`${i+1}.png`, imgData, {base64: true });
      }
    }else {
      for (var j = 1; j < (this.state.finish.length ); j++){
        const imgData = await this.state.finish[j].replace('data:image/png;base64,','');
        img.file(`${j}.png`, imgData, {base64: true });
      }
    }

    zip.generateAsync({type:"blob"})
    .then(function(content){
      saveAs(content, "Images.zip");
    });
  }

  async downloadzipJSON() {

    var JSZip = require("jszip");
    let zip = new JSZip();

    var file = zip.folder("JSON");

    if(this.state.imageType == 'svg'){
      for (var i = 0; i < (this.state.finish.length -1); i++){
        file.file(`${i+1}.json`, JSON.stringify(this.state.JSON[i + 1]), {base64: false });
      }
    }else {
      for (var j = 1; j < (this.state.finish.length ); j++){
        file.file(`${j}.json`, JSON.stringify(this.state.JSON[j]), {base64: false });
      }
    }

    zip.generateAsync({type:"blob"})
    .then(function(content){
      saveAs(content, "JSON.zip");
    });
  }

  inputLayer = event => {
    var number = this.state.number;
    number = number + 1;
    this.setState({number});
    var layerItems = [];

    for (var m = 0; m < event.target.files.length ; m++){
      layerItems[m] = event.target.files[m];
    }

    this.state.layer[number] = layerItems;
    console.log(this.state.layer)
    
    var possibleCombinations = this.state.possibleCombinations;
    possibleCombinations = possibleCombinations * this.state.layer[number].length;
    this.setState({possibleCombinations});
    //console.log(possibleCombinations)
  }

  async addFields(){
    var number = this.state.number;
    //console.log(number);
    number = number + 1;
    this.setState({number});

    var container = document.getElementById("container");
    
    const inputLayerName = event => {

      this.state.layerName[number] = event.target.value;
    }

    const inputLayer = event => {
      var layerItems = [];

      for (var m = 0; m < event.target.files.length ; m++){
        layerItems[m] = event.target.files[m];
      }

      this.state.layer[number] = layerItems;
      console.log(this.state.layer)
      
      var possibleCombinations = this.state.possibleCombinations;
      possibleCombinations = possibleCombinations * this.state.layer[number].length;
      this.setState({possibleCombinations});
      //console.log(possibleCombinations)
    }
 
    container.appendChild(document.createTextNode("Layer " + (number) + ":"));

    var input0 = document.createElement("input");

    input0.id = 'Layer' + number;
    input0.name = 'layer' + number;
    input0.type = 'text';
    input0.placeholder = 'Enter Layer Name..'
    input0.className = "form-control form-control-md"; 
    input0.onchange = inputLayerName;

    container.appendChild(input0);     

    var input1 = document.createElement("input");

    input1.id = 'Layer' + number;
    input1.name = 'layer' + number;
    input1.type = 'file';
    input1.multiple ='multiple';
    input1.webkitdirectory = 'webkitdirectory';
    input1.className = "form-control form-control-file"; 
    input1.onchange = inputLayer;

    container.appendChild(input1);  
    container.appendChild(document.createElement("br"));   
  }


  constructor(props) {
    super(props)
    this.state = {
      i : 0,
      input: null,
      selectedFile: null,
      year: '0',
      month: '0',
      day: '0',
      hour: '0',
      minute: '0',
      second: '0',
      name: 'undefined',
      description: 'undefined',

      number : 0,
      possibleCombinations: 1,

      layerName: [],
      layer:[],
      
      itemsInput: [],
      finish: [],
      svg: [],
      png: [],

      takenImage: [],
      end: 0

    }
      this.addFields = this.addFields.bind(this);
      //this.downloadzipPNG = this.downloadzipPNG.bind(this);
  }

  render() {

    const monthsRadius = mapNumber(this.state.month, 12, 0, 0, 360);
    const daysRadius = mapNumber(this.state.day, 30, 0, 0, 360);
    const hoursRadius = mapNumber(this.state.hour, 24, 0, 0, 360);
    const minutesRadius = mapNumber(this.state.minute, 60, 0, 0, 360);
    const secondsRadius = mapNumber(this.state.second, 60, 0, 0, 360);
    return (
      <div className='text-monospace'>
          <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div>
            <img src={logo} className="App-logo" alt="logo" height="10"/>     
            <b className="navbar-brand" style={{float: "Middle", lineHeight: "35px"}}>NFT</b>
          </div>
          </nav>
          

          <div className="container-fluid mt-5 text-center">
              <br></br>
                <h1>Welcome to Dapps</h1>
                <br></br>
                <div className="row">
                    <main role="main" className="d-flex justify-content-center mb-3 text-black" >
                        <div className="content mr-auto ml-auto">
                          <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" >

                            <Tab eventKey="CountDown" title="CountDown">

                            <div>
                                <br></br>
                              Input Date and Time?
                                <form onSubmit={(e) => {
                                  e.preventDefault()
                                  let datetime = this.datetime.value
                                  
                                  this.countdown(datetime)
                                
                                }}>
                                  <div className='form-group mr-sm-2'>

                                    <label htmlFor="DateTime" style={{float: "left"}}>Date & Time:</label>
                                    <input
                                      id='DateTime'
                                      type='datetime-local'
                                      ref={(input) => { this.datetime = input }}
                                      className="form-control form-control-sm"
                                      placeholder='dd/mm/yyyy'
                                      required />   

                                  </div>
                                  <button type='submit' className='btn btn-primary'>Countdown</button>
                                </form>
                              </div>

                              <br></br>
                                <h1>Countdown until{" "} </h1>
                                <div className="countdown-wrapper">
                                    <div className="countdown-item">
                                      {this.state.year}
                                        <span>years</span>
                                    </div>
                                    <div className="countdown-item">
                                      <SVGCircle radius={monthsRadius} />
                                      {this.state.month}
                                        <span>months</span>
                                    </div>
                                    <div className="countdown-item">
                                      <SVGCircle radius={daysRadius} />
                                      {this.state.day}
                                        <span>days</span>
                                    </div>
                                  </div>

                                  <div className="countdown-wrapper">
                                    <div className="countdown-item">
                                     <SVGCircle radius={hoursRadius} />
                                      {this.state.hour}
                                        <span>hours</span>
                                    </div>
                                    <div className="countdown-item">
                                     <SVGCircle radius={minutesRadius} />
                                      {this.state.minute}
                                        <span>minutes</span>
                                    </div>
                                    <div className="countdown-item">
                                     <SVGCircle radius={secondsRadius} />
                                      {this.state.second}
                                        <span>seconds</span>
                                    </div>
                                  </div>
                            </Tab>

                            <Tab eventKey="NFT Mint" title="NFT Mint">

                            <div>

                            <form onSubmit={(e) => {
                                  e.preventDefault()
                                  let name = this.Name.value
                                  let strength = this.Strength.value
                                  this.pinata(name,strength)
                                }}>
                                  <div className='form-group mr-sm-2'>
                                  <br></br> 
                                    

                                    <label htmlFor="Name" style={{float: "left"}}>Name:</label> 
                                    <input
                                      id='Name' 
                                      type='text'
                                      ref={(input) => { this.Name = input }}
                                      className="form-control input-sm"
                                      placeholder='Name..'
                                      required />

                                    <label htmlFor="Strength" style={{float: "left"}}>Strength:</label>
                                    <input
                                      id='Strength'
                                      step="1"
                                      type='number'
                                      ref={(input) => { this.Strength = input }}
                                      className="form-control input-sm"
                                      placeholder='1'
                                      required />                
                                    
                                  </div>
                                  <div>
                                    <br></br>
                                        <h4>
                                          Image Upload 
                                        </h4>
                                        <img id="target" src={this.state.image}/>
                                        <div>
                                            <input type="file" onChange={this.onFileChange} />
                                        </div>
                                      {this.fileData()}
                                  </div>
                                  <button type='submit' className='btn btn-primary'>Upload</button>
                                  
                                </form>

                                  <br></br>

                              <form onSubmit={(e) => {
                                  e.preventDefault()
                                  this.pinata2()
                                }}>
                                  <div>
                                    <h5>
                                      Wait until hash updated, then press Mint : {this.state.ipfshash}
                                    </h5>   
                                    <br></br>                        
                                    <button type='submit' className='btn btn-primary'>Mint</button>
                                    <br></br>
                                    <br></br>
                                    <h5>
                                      JSON Hash : {this.state.ipfshash2}
                                    </h5>   
                                  </div>
                                  
                              </form>
                                      
                            </div>

                            </Tab>  
                            <Tab eventKey="NFT Factory" title="NFT Factory">

                              <div >  
                                <br></br> 
                                <h5 >Input Layers: </h5> 

                                <label htmlFor="Background" style={{float: "center"}}>Background:</label>
                                      <input
                                        id='Background' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputLayer}                                       
                                        className="form-control form-control-md"/> 

                                <br></br> 
                                <div id="container"/>
                                <button id="addFields" onClick={this.addFields} className='btn btn-primary'>Add Layer</button> 

                                <br></br> 
                                <br></br> 

                                <form method="post" encType="multipart/form-data" action="#" onSubmit={(e) => {
                                  e.preventDefault()  
                                  let prefix = this.Prefix.value;
                                  let description = this.Description.value;
                                  let url = this.Url.value;
                                  let rarity = this.Rarity.value;
                                  let item = this.Item.value;

                                  let items = +item + 1;

                                  this.generate(prefix, description, url, rarity, items);                         
                                }}>

                                  <h5>Metadata:</h5>     

                                  <label htmlFor="Name" style={{float: "left"}}>Name:</label> 
                                    <input
                                      id='Name'                                      
                                      type='text'
                                      ref={(input) => { this.Prefix = input }}
                                      className="form-control input-sm"
                                      placeholder='Prefix..' />

                                  <label htmlFor="Description" style={{float: "left"}}>Description:</label> 
                                    <input
                                      id='Description' 
                                      type='text'
                                      ref={(input) => { this.Description = input }}
                                      className="form-control input-sm"
                                      placeholder='Image of..' />

                                  <label htmlFor="External_Url" style={{float: "left"}}>External_Url:</label>
                                    <input
                                      id='External_Url'
                                      type='url'
                                      ref={(input) => { this.Url = input }}
                                      className="form-control input-sm"
                                      placeholder='https://example.com'/> 

                                  <label htmlFor="Rarity" style={{float: "left"}}>Rarity: </label>

                                  <span id="hoverText"title="Rarity must be between 1-100">&#8505;</span>

                                    <input
                                      id='Rarity'
                                      type='number'
                                      defaultValue='1'
                                      ref={(input) => { this.Rarity = input }}
                                      className="form-control input-sm"
                                      min ="1"
                                      max = "100"
                                      required/> 

                                  <label htmlFor="Items" style={{float: "left"}}>Number of Items: </label>

                                  <span id="hoverText" title="May not be more than possible combinations..">&#8505;</span>

                                    <input
                                      id='Items'
                                      type='number'
                                      defaultValue='1'
                                      ref={(input) => { this.Item = input }}
                                      className="form-control input-sm"
                                      min ="1"
                                      max = {this.state.possibleCombinations}
                                      required/> 
                              
                                <br></br>

                                <button type='submit' className='btn btn-primary'>Generate</button>

                                <br></br>
                                <br></br>
                                <div>
                                  <h4>Images:</h4>                   
                                </div>
                                <div id="board"></div>                                
                                  
                                </form>

                                <div id="containerButton"/>

                              </div>

                            </Tab>                       

                          </Tabs>
                          </div>
                    </main>
                </div>
          </div>
      </div>
    ); 
  }
}
export default App;

