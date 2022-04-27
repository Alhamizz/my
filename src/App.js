import logo from './logo.svg';
import { Tabs, Tab } from 'react-bootstrap';
import React, {Component } from "react";
import './App.css';

function getBase64String(dataURL) {
  var idx = dataURL.indexOf('base64,') + 'base64,'.length;
  return dataURL.substring(idx);
}

function timeout(delay) {
  
  return new Promise( res => setTimeout(res, delay) );
}

/*function generateImage(eyesResult, noseResult, mouthResult) {
  const template = `
  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <bg/>
      <head/>
      <eyes/>
      <nose/>
      <mouth/>
      <hair/>
      <beard/>
  </svg>
` 

  const final = template
  //.replace('<bg/>', await this.getLayer0(this.state.backgroundResult))
  //.replace('<head/>', await this.getLayer1(this.state.headResult))
  .replace('<eyes/>', eyesResult)    
  .replace('<nose/>', noseResult)
  .replace('<mouth/>', mouthResult)
  //.replace('<hair/>', await this.getLayer5(this.state.hairResult))
  //.replace('<beard/>', await this.getLayer6(this.state.beardResult))

  return final;
}

function checkImage(rarity, final, length, eyesLength, noseLength, mouthLength, finish){

    var newFace;
    var possibleCombinations = rarity * (this.state.head.length * eyesLength * noseLength * mouthLength * this.state.hair.length * this.state.beard.length);
    // 9600 combinations

    let reachedEnd = true;

    for (var i=0; i < 100; i++){
      newFace = final;
      var repeated = 0;

      for (var j = 1; j < length - 1; j++){
        console.log(j);
        //console.log(finish[j]);
        //console.log(newFace);

        if (finish[j] == newFace){
          repeated++;  
          console.log(repeated);
        }         
      }
      if(repeated < rarity){
        reachedEnd = false;
        console.log('Continue');
        break;     
      } 
      console.log('Repeat');
    }
  
    if(reachedEnd == true){
      console.log('No more possible combination');
    }

    return newFace; 
}*/
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
    console.log(this.state.finish);
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

  inputLayer = event => {
    var layer = [];
    var layerLength = [];
    layer[this.state.i]= [];
    layerLength[this.state.i] = event.target.files.length;
    this.setState({layerLength});

    for (var i = 0; i < event.target.files.length ; i++){
      layer[i] = event.target.files[i];
      this.setState({layer});
    }
  }

  inputBackground = event => {
    const backgroundLength = event.target.files.length;
    this.setState({backgroundLength});

    for (var i = 0; i < event.target.files.length ; i++){
      this.state.background[i] = event.target.files[i];
 
    }
    //console.log(this.state.background[4]);
    //console.log(this.state.background[5]);
  };

  inputHead = event => {
    const headLength = event.target.files.length;
    this.setState({headLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.head[i] = event.target.files[i];
    }
    //console.log(head[0])
  };

  inputEyes = event => {
    const eyesLength = event.target.files.length;
    this.setState({eyesLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.eyes[i] = event.target.files[i];
    }
    //console.log(eyes[0])
  };

  inputNose = event => {
    const noseLength = event.target.files.length;
    this.setState({noseLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.nose[i] = event.target.files[i];

    }
    //console.log(nose[0])
  };

  inputMouth = event => {
    const mouthLength = event.target.files.length;
    this.setState({mouthLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.mouth[i] = event.target.files[i];

    }
    //console.log(mouth[0])
  };

  inputHair = event => {
    const hairLength = event.target.files.length;
    this.setState({hairLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.hair[i] = event.target.files[i];
    }
    //console.log(hair[0])
  };

  inputBeard = event => {
    const beardLength = event.target.files.length;
    this.setState({beardLength});

    for (var i = 0; i < event.target.files.length; i++){
      this.state.beard[i] = event.target.files[i];
    }
    //console.log(beard[0])
  };

  async generate(prefix, description, url, rarity, items){  

    var brd = document.getElementById("board");
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    var row = document.createElement("tr");
    var i = 0;
    var idx = items ;

    var itemsInput = [
      [ this.state.background ],
      [ this.state.head ],
      [ this.state.eyes ],
      [ this.state.nose ],
      [ this.state.mouth ],
      [ this.state.hair ],
      [ this.state.beard ],
    ];

    this.setState({itemsInput});
    var finish = [];
    this.setState({finish});

    var takenFaces = [].toString();
    this.setState({takenFaces});

    do {
      await this.createImage(idx, prefix, description, url, rarity);
      await timeout(1000); //for 0.4 sec delay
      if ( idx < items && idx > 0){
        if ( i === 0 || i === 4 ){
          i = 1;
          row = document.createElement("tr");
          cell = document.createElement("td");
          cell.innerHTML = `<img src=${this.state.result}  />`;  
          row.appendChild(cell);
          tblBody.appendChild(row);        
          tbl.appendChild(tblBody);
          brd.appendChild(tbl);
  
        }else {
          i = i + 1;
          var cell = document.createElement("td");
          cell.innerHTML = `<img src=${this.state.result}  />`;
          row.appendChild(cell);
          tblBody.appendChild(row);        
          tbl.appendChild(tblBody);
          brd.appendChild(tbl);
        }      
      }
 
      idx--;
    } while (idx >= 0);
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

  async getLayer0(backgroundnum, skip=0.0) {

    const data0 = this.state.background[backgroundnum]; 
    const data0name = data0.name;
    this.setState({data0name});

    const reader = new FileReader();
    reader.readAsText(data0);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer0 = svg.match(re)[0];
      this.setState({layer0});
    };

    return Math.random() > skip ? this.state.layer0 : '';
  }

  async getLayer1(headnum, skip=0.0) {

    const data1 = this.state.head[headnum]; 
    const data1name = data1.name;
    this.setState({data1name});

    const reader = new FileReader();
    reader.readAsText(data1);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer1 = svg.match(re)[0];
      this.setState({layer1});
    };
    return Math.random() > skip ? this.state.layer1 : '';
  }

  async getLayer2(eyesnum, skip=0.0) {

    const data2 = await this.state.eyes[eyesnum];
    const data2name = await data2.name;
    this.setState({data2name});

    const reader = new FileReader();
    reader.readAsText(data2);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer2 = svg.match(re)[0];
      this.setState({layer2});
    };
    return Math.random() > skip ? this.state.layer2 : '';
  }

  async getLayer3(nosenum, skip=0.0) {

    const data3 = await this.state.nose[nosenum];
    const data3name = await data3.name;
    this.setState({data3name});

    const reader = new FileReader();
    reader.readAsText(data3);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer3 = svg.match(re)[0];
      this.setState({layer3});
    };
    return Math.random() > skip ? this.state.layer3 : '';
  }

  async getLayer4(mouthnum, skip=0.0) {

    const data4 = await this.state.mouth[mouthnum];
    const data4name = await data4.name;
    this.setState({data4name});

    const reader = new FileReader();
    reader.readAsText(data4);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer4 = svg.match(re)[0];
      this.setState({layer4});
    };
    return Math.random() > skip ? this.state.layer4 : '';
  }

  async getLayer5(hairnum, skip=0.0) {

    const data5 = this.state.hair[hairnum];
    const data5name = data5.name;
    this.setState({data5name});

    const reader = new FileReader();
    reader.readAsText(data5);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer5 = svg.match(re)[0];
      this.setState({layer5});
    };
    return Math.random() > skip ? this.state.layer5 : '';
  }

  async getLayer6(beardnum, skip=0.0) {

    const data6 = this.state.beard[beardnum]; 
    const data6name = data6.name;
    this.setState({data6name});

    const reader = new FileReader();
    reader.readAsText(data6);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer6 = svg.match(re)[0];
      this.setState({layer6});
    };
    return Math.random() > skip ? this.state.layer6 : '';
  }
  
  async combineImage(eyesResult, noseResult, mouthResult) {
    const template = `
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <bg/>
        <head/>
        <eyes/>
        <nose/>
        <mouth/>
        <hair/>
        <beard/>
    </svg>
  ` 

    const final = template
    //.replace('<bg/>', await this.getLayer0(this.state.backgroundResult))
    //.replace('<head/>', await this.getLayer1(this.state.headResult))
    .replace('<eyes/>', eyesResult)    
    .replace('<nose/>', noseResult)
    .replace('<mouth/>', mouthResult)
    //.replace('<hair/>', await this.getLayer5(this.state.hairResult))
    //.replace('<beard/>', await this.getLayer6(this.state.beardResult))

    return final;
  }
  
  async generateRandomImages() {
    //const backgroundResult = await this.randInt(this.state.backgroundLength);
    //const headResult = await this.randInt(this.state.headLength);
    const eyesResult = await this.getLayer2(await this.randInt(await this.state.eyesLength));
    const noseResult = await this.getLayer3(await this.randInt(await this.state.noseLength));
    const mouthResult = await this.getLayer4(await this.randInt(await this.state.mouthLength));
    //const hairResult = await this.randInt(this.state.hairLength);
    //const beardResult = await this.randInt(this.state.beardLength);

    const final = this.combineImage(eyesResult, noseResult, mouthResult);

    return final;
  }

  async checkImage(rarity, final, length, eyesLength, noseLength, mouthLength, finish){
  
    var newFace;
    var possibleCombinations = rarity * (/*this.state.head.length **/ eyesLength * noseLength * mouthLength /** this.state.hair.length * this.state.beard.length*/);
    // 9600 combinations

    let reachedEnd = true;

    for (var i=0; i < 100; i++){
      newFace = await this.generateRandomImages();
      var repeated = 0;

      for (var j = 0; j < length ; j++){
        console.log(j);
        //console.log(finish[j]);
        //console.log(newFace);

        if (finish[j] == newFace){
          repeated++;  
          console.log(repeated);
        }         
      }
      if(repeated < rarity){
        reachedEnd = false;
        console.log('Continue');
        break;     
      } 
      console.log('Repeat');
    }
  
    if(reachedEnd == true){
      console.log('No more possible combination');
    }

    return newFace; 
  }

  async createImage(idx, prefix, description, url, rarity) {
    const final = await this.generateRandomImages();

    const length = this.state.finish.length;
    var finish = [];
    finish = this.state.finish;
    const eyesLength = this.state.eyes.length;
    const noseLength = this.state.nose.length;
    const mouthLength = this.state.mouth.length;

    var newFace = await this.checkImage(rarity, final, length, eyesLength, noseLength, mouthLength, finish);
    console.log(this.state.finish);

    this.state.finish.push(newFace);
     
    const name = await this.getRandomName();
    //console.log(name);

    /*const meta = {
      name: `${prefix} # ${idx}`,
      description: `${description} ${name.split('-').join(' ')}`,
      image : ``,
      external_url : `${url}`,
      attributes: [
        { 
          head: await this.state.data0name,
          rarity: `${rarity}`
        },
        { 
          eyes: await this.state.data1name,
          rarity: `${rarity}`
        },
        { 
          nose: await this.state.data2name,
          rarity: `${rarity}`
        },
        { 
          mouth: await this.state.data3name,
          rarity: `${rarity}`
        },
        { 
          hair: await this.state.data4name,
          rarity: `${rarity}`
        },
        { 
          beard: await this.state.data5name,
          rarity: `${rarity}`
        }
      ]
    } */

    svgToPng(newFace, (imgData) => {
      let image = new Image();
      image.onload = () => {
            
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, 150, 150);

        let png = canvas.toDataURL();
        this.setState({png});  
      };

      image.src = imgData;
      const result =image.src;
      this.setState({result});
    }); 

    newFace = null;
    
    if(idx < 21 && idx > 0){
      //await this.downloadFile(`${idx}.svg`, final)
      //await this.downloadFile(`${idx}.json`, JSON.stringify(meta))
    }

    if(idx < 20){
      //await this.downloadPNG(`${idx + 1}.png`, this.state.png)
    }      
  } 

 async downloadFile(name, file) {
    var link = document.createElement("a");
    var blob = new Blob([file]);
    var url  = window.URL.createObjectURL(blob);
    link.setAttribute('download', name);
    link.setAttribute('href', url);
    link.click();
    link.remove();
  }

  async downloadPNG(name, png) {

    var link = document.createElement('a');
    link.download = name;
    link.style.opacity = "0";
    link.href = png;
    link.click();
    link.remove();
  }

  /*async downloadzipPNG(name, png) {

    var JSZip = require("jszip");
    let jsZip = new JSZip();
    let folder = jsZip.folder("images");

    let baseString = getBase64String(png);
    folder.file(name, baseString, {base64 : true});

    jsZip.generateAsync({type:"blob"}).then(function (content) {
      content = URL.createObjectURL(content);
      let name = `JSJeep.zip`;
      this.downloadPNG(name, png); // already written above
      console.log('abc')
    });
  }*/

  async addFields(){
    // Generate a dynamic number of inputs
    var number = document.getElementById("Layers").value;
    // Get the element where the inputs will be added to
    var container = document.getElementById("container");

    var layer = [];
    var layerLength = [];

    const inputLayer = event => {

      layer[i]= [];
      layerLength[i] = event.target.files.length;
      this.setState({layerLength});

      console.log(layerLength[0]);
      console.log(this.state.layerLength[1]);
      console.log(layerLength[2]);
  
      for (var m = 0; m < event.target.files.length ; m++){
        layer[i] = event.target.files[m];
        console.log(layer[i]);
      }
    }

 
    // Remove every children it had before
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    for (var i = 0; i <number; i++){

      container.appendChild(document.createTextNode("Layer " + (i+1)));

      var form = document.createElement("form");
      form.method = "post";
      form.encType = "multipart/form-data";

      var input = document.createElement("input");

      input.id = 'Layer' + i;
      input.name = 'layer' + i;
      input.type = 'file';
      input.multiple ='multiple';
      input.className = "form-control form-control-md"; 
      input.onchange = inputLayer;

      container.appendChild(input); 
      container.appendChild(form); 
      container.appendChild(document.createElement("br"));   
    }
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
      layer0: 'undefined',
      layer1: 'undefined',
      layer2: 'undefined',
      layer3: 'undefined',
      layer4: 'undefined',
      layer5: 'undefined',
      layer6: 'undefined',
      layerLength: [],
      imgData: [],
      takenFaces: [],

      background: [],
      head: [],
      eyes: [],
      nose: [],
      mouth: [],
      hair: [],
      beard: [], 
  
      itemsInput: [],
      finish: []

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
                    <main role="main" className="d-flex justify-content-center mb-3 text-black">
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
                                      className="form-control form-control-md"
                                      placeholder='Name..'
                                      required />

                                    <label htmlFor="Strength" style={{float: "left"}}>Strength:</label>
                                    <input
                                      id='Strength'
                                      step="1"
                                      type='number'
                                      ref={(input) => { this.Strength = input }}
                                      className="form-control form-control-md"
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

                              <div>  
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
                                      className="form-control form-control-md"
                                      placeholder='Prefix..' />

                                  <label htmlFor="Description" style={{float: "left"}}>Description:</label> 
                                    <input
                                      id='Description' 
                                      type='text'
                                      ref={(input) => { this.Description = input }}
                                      className="form-control form-control-md"
                                      placeholder='Image of..' />

                                  <label htmlFor="External_Url" style={{float: "left"}}>External_Url:</label>
                                    <input
                                      id='External_Url'
                                      type='text'
                                      ref={(input) => { this.Url = input }}
                                      className="form-control form-control-md"
                                      placeholder='Url..'/> 

                                  <label htmlFor="Rarity" style={{float: "left"}}>Rarity:</label>
                                    <input
                                      id='Rarity'
                                      type='number'
                                      ref={(input) => { this.Rarity = input }}
                                      className="form-control form-control-md"
                                      placeholder='Rarity (1-100)..'/> 

                                  <label htmlFor="Items" style={{float: "left"}}>Number of Items:</label>
                                    <input
                                      id='Items'
                                      type='number'
                                      ref={(input) => { this.Item = input }}
                                      className="form-control form-control-md"
                                      placeholder='Number of Items..'
                                      required/> 

                                  <br></br>  
                                  <h5>Input Layers (folder):</h5>  

                                  <label htmlFor="Background" style={{float: "left"}}>Background:</label>
                                      <input
                                        id='Background' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputBackground}                                       
                                        className="form-control form-control-md"/>  

                                  <label htmlFor="Head" style={{float: "left"}}>Head:</label>
                                      <input
                                        id='Head' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputHead}
                                        className="form-control form-control-md"/>  

                                  <label htmlFor="Eyes" style={{float: "left"}}>Eyes:</label>
                                      <input
                                        id='Eyes' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputEyes}
                                        className="form-control form-control-md"/>  

                                  <label htmlFor="Nose" style={{float: "left"}}>Nose:</label>
                                      <input
                                        id='Nose' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputNose}
                                        className="form-control form-control-md"/>  

                                  <label htmlFor="Mouth" style={{float: "left"}}>Mouth:</label>
                                      <input
                                        id='Mouth' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputMouth}
                                        className="form-control form-control-md"/> 

                                  <label htmlFor="Hair" style={{float: "left"}}>Hair:</label>
                                      <input
                                        id='Hair' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputHair}
                                        className="form-control form-control-md"/> 

                                  <label htmlFor="Beard" style={{float: "left"}}>Beard:</label>
                                      <input
                                        id='Beard' 
                                        multiple directory="" 
                                        webkitdirectory="" 
                                        mozdirectory=""
                                        type='file'
                                        onChange={this.inputBeard}
                                        className="form-control form-control-md"/> 

                                  <br></br>

                                  <button type='submit' className='btn btn-primary'>Generate</button>
                                  <br></br>
                                  <br></br>
                                  <div>
                                    <h4>Images:</h4>                   
                                  </div>
                                  <div id="board"></div>                                
                                  
                                </form>

                                <label htmlFor="Layers" style={{float: "left"}}>Number of layers: (max. 10)</label>
                                      <input
                                        id='Layers' 
                                        type='number'
                                        className="form-control form-control-md"/> 

                                <a href="#" id="filldetails" onClick={this.addFields}>Fill Details</a>
                                <div id="container"/>

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