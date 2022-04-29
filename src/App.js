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

/*function randomGenerator() {
  // generated a random string
  newImage = ""
  for (i = 0, i < layers.length, i++){
      newImage += String(layers[i].length)
  }

  return newImage
}

function generateMetadata()
{
  //....
  return("metadata in json")
}
function createImages(rarityAmount, totalImages, allPossibleCombinations) {

  let allImages = [[]] // array inside an array [["item", rarity], ["10111001", 0], ["1000111", 2] ]

  do {
      newImage = randomGenerator()
      let existed = false
      for (i=0, i< allImages.length, i++){
          if (allImages[i][0] == newImage) {
              existed = true
              if (allImages[i][1] < rarityAmount) {
                  allImages[i][1]++
                  generateMetadata() // generate metadata for the new one, 
                  // you can do this while downloading the files, because each of the rare item has a differentnumber
              }
              break
          }
      }

      if (!existed) {
          allImages.push([newImage,1]) // the minimum rarity is 1 this way we have all of
          generateMetadata() // generate metadata
      }

  } while (allImages.length < totalImages && allImages.length < allPossibleCombinations);

}*/

function downloadFile(name, file) {
  var link = document.createElement("a");
  var blob = new Blob([file]);
  var url  = window.URL.createObjectURL(blob);
  link.setAttribute('download', name);
  link.setAttribute('href', url);
  link.click();
  link.remove();
}

function downloadPNG(name, png) {

  var link = document.createElement('a');
  link.download = name;
  link.style.opacity = "0";
  link.href = png;
  link.click();
  link.remove();
}

function getBase64String(dataURL) {
  var idx = dataURL.indexOf('base64,') + 'base64,'.length;
  return dataURL.substring(idx);
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

    const data0 = await this.state.background[0]; 
    const data0name = data0.name;
    const re = 'svg';
    const imageType = await data0name.match(re);

    console.log(this.state.background);
    console.log(this.state.head);
    console.log(this.state.eyes);
    console.log(this.state.nose);
    console.log(this.state.mouth);
    console.log(this.state.hair);
    console.log(this.state.beard);
    console.log(this.state.layer7items);
    console.log(this.state.layer8items);
    console.log(this.state.layer9items);

    var itemsInput = [
      [ this.state.background ],
      [ this.state.head ],
      [ this.state.eyes ],
      [ this.state.nose ],
      [ this.state.mouth ],
      [ this.state.hair ],
      [ this.state.beard ],
      [ this.state.layer7items ],
      [ this.state.layer8items ],
      [ this.state.layer9items ],
    ];

    this.setState({itemsInput});
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
            var cell = document.createElement("td");
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
            var cell = document.createElement("td");
            cell.innerHTML = `<img src=${this.state.result}  />`;
            row.appendChild(cell);
            tblBody.appendChild(row);        
            tbl.appendChild(tblBody);
            brd.appendChild(tbl);
          } 
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

    const data0 = await this.state.background[backgroundnum]; 
    const data0name = await data0.name.replace('.svg','');
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

    const data1 = await this.state.head[headnum]; 
    const data1name = await data1.name.replace('.svg','');
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
    const data2name = await data2.name.replace('.svg','');
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
    const data3name = await data3.name.replace('.svg','');
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
    const data4name = await data4.name.replace('.svg','');
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

    const data5 = await this.state.hair[hairnum];
    const data5name = await data5.name.replace('.svg','');
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

    const data6 = await this.state.beard[beardnum]; 
    const data6name = await data6.name.replace('.svg','');
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

  async getLayer7(layer7itemsnum, skip=0.0) {

    const data7 = await this.state.layer7items[layer7itemsnum]; 
    const data7name = await data7.name.replace('.svg','');
    this.setState({data7name});

    const reader = new FileReader();
    reader.readAsText(data7);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer7 = svg.match(re)[0];
      this.setState({layer7});
    };
    return Math.random() > skip ? this.state.layer7 : '';
  }

  async getLayer8(layer8itemsnum, skip=0.0) {

    const data8 = await this.state.layer8items[layer8itemsnum]; 
    const data8name = await data8.name.replace('.svg','');
    this.setState({data8name});

    const reader = new FileReader();
    reader.readAsText(data8);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer8 = svg.match(re)[0];
      this.setState({layer8});
    };
    return Math.random() > skip ? this.state.layer8 : '';
  }

  async getLayer9(layer9itemsnum, skip=0.0) {

    const data9 = this.state.layer9items[layer9itemsnum]; 
    const data9name = await data9.name.replace('.svg','');
    this.setState({data9name});

    const reader = new FileReader();
    reader.readAsText(data9);
    reader.onload = (e) => {
      const svg = reader.result;
      const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
      const layer9 = svg.match(re)[0];
      this.setState({layer9});
    };
    return Math.random() > skip ? this.state.layer9 : '';
  }
  
  async combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult, beardResult, layer7Result, layer8Result, layer9Result) {

    if(this.state.number == 1){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
  
      return final;
    } else if(this.state.number == 2){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)

  
      return final;
    } else if(this.state.number == 3){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    

  
      return final;
    } else if(this.state.number == 4){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)

      return final;
    } else if(this.state.number == 5){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
          <mouth/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)

  
      return final;
    } else if(this.state.number == 6){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
          <mouth/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)
      .replace('<hair/>', hairResult)
  
      return final;
    } else if(this.state.number == 7){
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
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)
      .replace('<hair/>', hairResult)
      .replace('<beard/>', beardResult)
  
      return final;
    }else if(this.state.number == 8){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
          <mouth/>
          <hair/>
          <beard/>
          <layer7/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)
      .replace('<hair/>', hairResult)
      .replace('<beard/>', beardResult)
      .replace('<hair/>', layer7Result)
  
      return final;
    }else if(this.state.number == 9){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
          <mouth/>
          <hair/>
          <beard/>
          <layer7/>
          <layer8/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)
      .replace('<hair/>', hairResult)
      .replace('<beard/>', beardResult)
      .replace('<hair/>', layer7Result)
      .replace('<beard/>', layer8Result)
      
  
      return final;
    }else if(this.state.number == 10){
      const template = `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <bg/>
          <head/>
          <eyes/>
          <nose/>
          <mouth/>
          <hair/>
          <beard/>
          <layer7/>
          <layer8/>
          <layer9/>
      </svg>
      ` 
  
      const final = template
      .replace('<bg/>', backgroundResult)
      .replace('<head/>', headResult)
      .replace('<eyes/>', eyesResult)    
      .replace('<nose/>', noseResult)
      .replace('<mouth/>', mouthResult)
      .replace('<hair/>', hairResult)
      .replace('<beard/>', beardResult)
      .replace('<layer7/>', layer7Result)
      .replace('<layer8/>', layer8Result)
      .replace('<layer9/>', layer9Result)

      return final;
    };

  }
  
  async generateRandomImages() {

    if(this.state.number == 1){
      const backgroundResult = await this.getLayer0(this.randInt(this.state.background.length));

      const final = this.combineImage(backgroundResult);

      return final;
    } else if(this.state.number == 2){
      const backgroundResult = await this.getLayer0(this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(this.randInt(this.state.head.length));

      const final = this.combineImage(backgroundResult, headResult);

      return final;
    } else if(this.state.number == 3){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult);

      return final;
    } else if(this.state.number == 4){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult);

      return final;
    } else if(this.state.number == 5){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult);

      return final;
    } else if(this.state.number == 6){
      const backgroundResult = this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));
      const hairResult = await this.getLayer5(await this.randInt(this.state.hair.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult);

      return final;
    } else if(this.state.number == 7){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));
      const hairResult = await this.getLayer5(await this.randInt(this.state.hair.length));
      const beardResult = await this.getLayer6(await this.randInt(this.state.beard.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult, beardResult);

      return final;
    } else if(this.state.number == 8){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));
      const hairResult = await this.getLayer5(await this.randInt(this.state.hair.length));
      const beardResult = await this.getLayer6(await this.randInt(this.state.beard.length));
      const layer7Result = await this.getLayer7(await this.randInt(this.state.beard.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult, beardResult, layer7Result);

      return final;
    } else if(this.state.number == 9){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));
      const hairResult = await this.getLayer5(await this.randInt(this.state.hair.length));
      const beardResult = await this.getLayer6(await this.randInt(this.state.beard.length));
      const layer7Result = await this.getLayer7(await this.randInt(this.state.beard.length));
      const layer8Result = await this.getLayer8(await this.randInt(this.state.beard.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult, beardResult, layer7Result, layer8Result);

      return final;
    } else if(this.state.number == 10){
      const backgroundResult = await this.getLayer0(await this.randInt(this.state.background.length));
      const headResult = await this.getLayer1(await this.randInt(this.state.head.length));
      const eyesResult = await this.getLayer2(await this.randInt(this.state.eyes.length));
      const noseResult = await this.getLayer3(await this.randInt(this.state.nose.length));
      const mouthResult = await this.getLayer4(await this.randInt(this.state.mouth.length));
      const hairResult = await this.getLayer5(await this.randInt(this.state.hair.length));
      const beardResult = await this.getLayer6(await this.randInt(this.state.beard.length));
      const layer7Result = await this.getLayer7(await this.randInt(this.state.layer7items.length));
      const layer8Result = await this.getLayer8(await this.randInt(this.state.layer8items.length));
      const layer9Result = await this.getLayer9(await this.randInt(this.state.layer9items.length));

      const final = this.combineImage(backgroundResult, headResult, eyesResult, noseResult, mouthResult, hairResult, beardResult, layer7Result, layer8Result, layer9Result);

      return final;
    };
  }

  async checkImage(rarity){
  
    var newFace;
    //var possibleCombinations = rarity * (/*this.state.head.length **/ eyesLength * noseLength * mouthLength /** this.state.hair.length * this.state.beard.length*/);
    // 9600 combinations

    let reachedEnd = true;

    for (var i=0; i < 100; i++){
      newFace = await this.generateRandomImages();
      var repeated = 0;

      for (var j = 0; j < this.state.svg.length ; j++){
        //console.log(j);
        //console.log(finish[j]);
        //console.log(newFace);

        if (this.state.svg[j] == newFace){
          repeated++;  
          //console.log(repeated);
        }         
      }
      if(repeated < rarity){
        reachedEnd = false;
        //console.log('Continue');
        break;     
      } 
      //console.log('Repeat');
    }
  
    if(reachedEnd == true){
      //console.log('No more possible combination');
    }

    return newFace; 
  }

  async createImage(idx, prefix, description, url, rarity, items) {

    const final = await this.generateRandomImages();

    var newFace = await this.checkImage(rarity, final);

    this.state.svg.push(newFace);
     
    const name = await this.getRandomName();
    //console.log(name);

    if(this.state.number == 1){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: []
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 2){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          }         
        ]
      } 
      this.state.JSON.push(meta);
      
    } else if(this.state.number == 3){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 4){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 5){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 6){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 7){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 8){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 9){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },          { 
            trait_type: this.state.layerName[9],
            value: await this.state.data8name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 10){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },
          { 
            trait_type: this.state.layerName[9],
            value: await this.state.data8name,
          },
          { 
            trait_type: this.state.layerName[10],
            value: await this.state.data9name,
          }
        ]
      } 
      this.state.JSON.push(meta);
    };

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
    width: 250,
    height: 250 
  };

  const  canvas = createCanvas(imageFormat.width, imageFormat.height);
  const  ctx = canvas.getContext("2d");

    if(this.state.number == 1){
      const backgroundResult = await this.randInt(this.state.background.length);
      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
  
      var blob = new Blob([await this.state.background[backgroundResult]]);
      var url  = window.URL.createObjectURL(blob);

      const  backgroundIm = await loadImage(await url);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});


    } else if(this.state.number == 2){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 3){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url1);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});


    } else if(this.state.number == 4){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 5){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 6){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);
      const hairResult = await this.randInt(this.state.hair.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});
      const data5name = await this.state.hair[hairResult].name.replace('.png','');
      this.setState({data5name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);
      var blob5 = new Blob([await this.state.hair[hairResult]]);
      var url5  = window.URL.createObjectURL(blob5);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      const  hairIm = await loadImage(url5);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(hairIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 7){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);
      const hairResult = await this.randInt(this.state.hair.length);
      const beardResult = await this.randInt(this.state.beard.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});
      const data5name = await this.state.hair[hairResult].name.replace('.png','');
      this.setState({data5name});
      const data6name = await this.state.beard[beardResult].name.replace('.png','');
      this.setState({data6name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);
      var blob5 = new Blob([await this.state.hair[hairResult]]);
      var url5  = window.URL.createObjectURL(blob5);
      var blob6 = new Blob([await this.state.beard[beardResult]]);
      var url6  = window.URL.createObjectURL(blob6);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      const  hairIm = await loadImage(url5);
      const  beardIm = await loadImage(url6);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(hairIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(beardIm,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 8){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);
      const hairResult = await this.randInt(this.state.hair.length);
      const beardResult = await this.randInt(this.state.beard.length);
      const layer7Result = await this.randInt(this.state.layer7items.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});
      const data5name = await this.state.hair[hairResult].name.replace('.png','');
      this.setState({data5name});
      const data6name = await this.state.beard[beardResult].name.replace('.png','');
      this.setState({data6name});
      const data7name = await this.state.layer7items[layer7Result].name.replace('.png','');
      this.setState({data7name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);
      var blob5 = new Blob([await this.state.hair[hairResult]]);
      var url5  = window.URL.createObjectURL(blob5);
      var blob6 = new Blob([await this.state.beard[beardResult]]);
      var url6  = window.URL.createObjectURL(blob6);
      var blob7 = new Blob([await this.state.layer7items[layer7Result]]);
      var url7  = window.URL.createObjectURL(blob7);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      const  hairIm = await loadImage(url5);
      const  beardIm = await loadImage(url6);
      const  layer7Im = await loadImage(url7);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(hairIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(beardIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer7Im,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 9){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);
      const hairResult = await this.randInt(this.state.hair.length);
      const beardResult = await this.randInt(this.state.beard.length);
      const layer7Result = await this.randInt(this.state.layer7items.length);
      const layer8Result = await this.randInt(this.state.layer8items.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});
      const data5name = await this.state.hair[hairResult].name.replace('.png','');
      this.setState({data5name});
      const data6name = await this.state.beard[beardResult].name.replace('.png','');
      this.setState({data6name});
      const data7name = await this.state.layer7items[layer7Result].name.replace('.png','');
      this.setState({data7name});
      const data8name = await this.state.layer8items[layer8Result].name.replace('.png','');
      this.setState({data8name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);
      var blob5 = new Blob([await this.state.hair[hairResult]]);
      var url5  = window.URL.createObjectURL(blob5);
      var blob6 = new Blob([await this.state.beard[beardResult]]);
      var url6  = window.URL.createObjectURL(blob6);
      var blob7 = new Blob([await this.state.layer7items[layer7Result]]);
      var url7  = window.URL.createObjectURL(blob7);
      var blob8 = new Blob([await this.state.layer8items[layer8Result]]);
      var url8  = window.URL.createObjectURL(blob8);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      const  hairIm = await loadImage(url5);
      const  beardIm = await loadImage(url6);
      const  layer7Im = await loadImage(url7);
      const  layer8Im = await loadImage(url8);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(hairIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(beardIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer7Im,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer8Im,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});

    } else if(this.state.number == 10){
      const backgroundResult = await this.randInt(this.state.background.length);
      const headResult = await this.randInt(this.state.head.length);
      const eyesResult = await this.randInt(this.state.eyes.length);
      const noseResult = await this.randInt(this.state.nose.length);
      const mouthResult = await this.randInt(this.state.mouth.length);
      const hairResult = await this.randInt(this.state.hair.length);
      const beardResult = await this.randInt(this.state.beard.length);
      const layer7Result = await this.randInt(this.state.layer7items.length);
      const layer8Result = await this.randInt(this.state.layer8items.length);
      const layer9Result = await this.randInt(this.state.layer9items.length);

      const data0name = await this.state.background[backgroundResult].name.replace('.png','');
      this.setState({data0name});
      const data1name = await this.state.head[headResult].name.replace('.png','');
      this.setState({data1name});
      const data2name = await this.state.eyes[eyesResult].name.replace('.png','');
      this.setState({data2name});
      const data3name = await this.state.nose[noseResult].name.replace('.png','');
      this.setState({data3name});
      const data4name = await this.state.mouth[mouthResult].name.replace('.png','');
      this.setState({data4name});
      const data5name = await this.state.hair[hairResult].name.replace('.png','');
      this.setState({data5name});
      const data6name = await this.state.beard[beardResult].name.replace('.png','');
      this.setState({data6name});
      const data7name = await this.state.layer7items[layer7Result].name.replace('.png','');
      this.setState({data7name});
      const data8name = await this.state.layer8items[layer8Result].name.replace('.png','');
      this.setState({data8name});
      const data9name = await this.state.layer8items[layer9Result].name.replace('.png','');
      this.setState({data9name});

      var blob0 = new Blob([await this.state.background[backgroundResult]]);
      var url0  = window.URL.createObjectURL(blob0);
      var blob1 = new Blob([await this.state.head[headResult]]);
      var url1  = window.URL.createObjectURL(blob1);
      var blob2 = new Blob([await this.state.eyes[eyesResult]]);
      var url2  = window.URL.createObjectURL(blob2);
      var blob3 = new Blob([await this.state.nose[noseResult]]);
      var url3  = window.URL.createObjectURL(blob3);
      var blob4 = new Blob([await this.state.mouth[mouthResult]]);
      var url4  = window.URL.createObjectURL(blob4);
      var blob5 = new Blob([await this.state.hair[hairResult]]);
      var url5  = window.URL.createObjectURL(blob5);
      var blob6 = new Blob([await this.state.bearditems[beardResult]]);
      var url6  = window.URL.createObjectURL(blob6);
      var blob7 = new Blob([await this.state.layer7items[layer7Result]]);
      var url7  = window.URL.createObjectURL(blob7);
      var blob8 = new Blob([await this.state.layer8items[layer8Result]]);
      var url8  = window.URL.createObjectURL(blob8);
      var blob9 = new Blob([await this.state.layer9items[layer9Result]]);
      var url9  = window.URL.createObjectURL(blob9);

      const  backgroundIm = await loadImage(url0);
      const  headIm = await loadImage(url1);
      const  eyesIm = await loadImage(url2);
      const  noseIm = await loadImage(url3);
      const  mouthIm = await loadImage(url4);
      const  hairIm = await loadImage(url5);
      const  beardIm = await loadImage(url6);
      const  layer7Im = await loadImage(url7);
      const  layer8Im = await loadImage(url8);
      const  layer9Im = await loadImage(url9);
      ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(headIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(eyesIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(noseIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(mouthIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(hairIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(beardIm,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer7Im,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer8Im,0,0,imageFormat.width,imageFormat.height);
      ctx.drawImage(layer9Im,0,0,imageFormat.width,imageFormat.height);

      var png = [];

      png = canvas.toDataURL();

      const result = png;
      this.state.finish.push(result);
      this.setState({result});
    };
     
    const name = await this.getRandomName();
    //console.log(name);

    if(this.state.number == 1){
      const meta = {
       
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: []
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 2){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          }         
        ]
      } 
      this.state.JSON.push(meta);
      
    } else if(this.state.number == 3){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 4){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 5){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 6){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 7){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 8){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 9){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },          { 
            trait_type: this.state.layerName[9],
            value: await this.state.data8name,
          }
        ]
      } 
      this.state.JSON.push(meta);

    } else if(this.state.number == 10){
      const meta = {
      
        name: `${prefix} #${idx}`,
        description: `${description} ${name.split('-').join(' ')}`,
        image : ``,
        external_url : `${url}`,
        attributes: [
    
          { 
            trait_type: this.state.layerName[2],
            value: await this.state.data1name,
          },
          { 
            trait_type: this.state.layerName[3],
            value: await this.state.data2name,
          },
          { 
            trait_type: this.state.layerName[4],
            value: await this.state.data3name,
          },
          { 
            trait_type: this.state.layerName[5],
            value: await this.state.data4name,
          },
          { 
            trait_type: this.state.layerName[6],
            value: await this.state.data5name,
          },
          { 
            trait_type: this.state.layerName[7],
            value: await this.state.data6name,
          },
          { 
            trait_type: this.state.layerName[8],
            value: await this.state.data7name,
          },
          { 
            trait_type: this.state.layerName[9],
            value: await this.state.data8name,
          },
          { 
            trait_type: this.state.layerName[10],
            value: await this.state.data9name,
          }
        ]
      } 
      this.state.JSON.push(meta);
    };    
  } 

  async downloadzipPNG() {

    var JSZip = require("jszip");
    let zip = new JSZip();

    var img = zip.folder("Images");

    for (var i = 1; i < (this.state.finish.length - 1); i++){
      const imgData = await this.state.finish[i].replace('data:image/png;base64,','');
      img.file(`${i}.png`, imgData, {base64: true });
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

    for (var i = 1; i < (this.state.finish.length - 1); i++){
      file.file(`${i}.json`, JSON.stringify(this.state.JSON[i]), {base64: false });
    }

    zip.generateAsync({type:"blob"})
    .then(function(content){
      saveAs(content, "JSON.zip");
    });
  }

  async addFields(){
    // Generate a dynamic number of inputs
    var number = document.getElementById("Layers").value;
    this.setState({number});
    // Get the element where the inputs will be added to
    var container = document.getElementById("container");
    var x = 1;
    var y = 0;
    var value = 0; 
    var layerName = [];
    
    const inputLayerName = event => {

      if(x === 1){
        value = this.state.background;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 2){
        value = this.state.head;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 3){
        value = this.state.eyes;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 4){
        value = this.state.nose;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 5){
        value = this.state.mouth;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 6){
        value = this.state.hair;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 7){
        value = this.state.beard;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 8){
        value = this.state.layer7items;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 9){
        value = this.state.layer8items;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };
      if(x === 10){
        value = this.state.layer9items;
        layerName[x] = event.target.value;
        this.setState({layerName});
      };

      x++;
    }

    const inputLayer = event => {

      if(y === 0){
        value = this.state.background;
      };
      if(y === 1){
        value = this.state.head;
      };
      if(y === 2){
        value = this.state.eyes;
      };
      if(y === 3){
        value = this.state.nose;
      };
      if(y === 4){
        value = this.state.mouth;
      };
      if(y === 5){
        value = this.state.hair;
      };
      if(y === 6){
        value = this.state.beard;
      };
      if(y === 7){
        value = this.state.layer7items;
      };
      if(y === 8){
        value = this.state.layer8items;
      };
      if(y === 9){
        value = this.state.layer9items;
      };

      for (var m = 0; m < event.target.files.length ; m++){
        value[m] = event.target.files[m];
      }
      y++;
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
      input.type = 'text';
      input.placeholder = 'Enter Layer Name..'
      input.className = "form-control form-control-md"; 
      input.onchange = inputLayerName;

      container.appendChild(input);     

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
      layer7: 'undefined',
      layer8: 'undefined',
      layer9: 'undefined',

      background: [],
      head: [],
      eyes: [],
      nose: [],
      mouth: [],
      hair: [],
      beard: [], 
      layer7items: [],
      layer8items: [],
      layer9items: [],
      
      layerName: [],
      itemsInput: [],
      finish: [],
      svg: [],
      png: []

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
                                      placeholder='Rarity (1-100)..'
                                      min ="1"
                                      max = "100"
                                      required/> 

                                  <label htmlFor="Items" style={{float: "left"}}>Number of Items:</label>
                                    <input
                                      id='Items'
                                      type='number'
                                      ref={(input) => { this.Item = input }}
                                      className="form-control form-control-md"
                                      placeholder='May not be more than possible combinations..'
                                      required/> 

                                  <br></br>  
                                  <h5>Input Layers:</h5>  

                                  <label htmlFor="Layers" style={{float: "left"}}>Number of layers: (max. 10)</label>
                                      <input
                                        id='Layers' 
                                        type='number'
                                        min ="1"
                                        max = "10"
                                        className="form-control form-control-md"/> 

                                <a href="#" id="filldetails" onClick={this.addFields}>Fill Details</a>
                                <div id="container"/>

                                  <br></br>

                                  <button type='submit' className='btn btn-primary'>Generate</button>
                                  <br></br>
                                  <br></br>
                                  <div>
                                    <h4>Images:</h4>                   
                                  </div>
                                  <div id="board"></div>                                
                                  
                                </form>
                                
                                <form onSubmit={(e) => {
                                  e.preventDefault()
                                  this.downloadzipPNG();
                                  this.downloadzipJSON();
                                  
                                }}>
                                                                 
                                  <button type='submit' className='btn btn-primary'>Download</button>
                                </form>

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

