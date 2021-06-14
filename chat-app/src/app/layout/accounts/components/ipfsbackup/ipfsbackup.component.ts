import { Component, OnInit } from '@angular/core';

declare var require: any;
var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('localhost', '5001', { protocol: 'http', })
const Buffer = ipfs.Buffer
@Component({
  selector: 'app-ipfsbackup',
  templateUrl: './ipfsbackup.component.html',
  styleUrls: ['./ipfsbackup.component.scss']
})
export class IpfsbackupComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.exportKey();
  }

  saveToIPFS(){
    var oJson = {};
    var storageKey;
    
    for(var i=0; storageKey = window.localStorage.key(i); i++){
      oJson[storageKey] = window.localStorage.getItem(storageKey);
    }
    delete oJson['pb_exceptions'];
    delete oJson['pb_forms'];
    delete oJson['pb_user_activity'];


    const buffer = Buffer.from(JSON.stringify(oJson));

    ipfs.files.add(buffer, (err, res) => {
      if (err) {
        debugger;
          console.log(err);
      }
      if (res) {
          ipfs.cat(res[0].hash,(err,result)=>{
            localStorage.setItem("_ipfshash",res[0].hash);

            ipfs.name.publish(res[0].hash, function (err, res) {
              console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
          })
          });
      }


  });


  }


  exportKey(){
    ipfs.key.export('testkey','mparsec123',(err,pem)=>{
      // console.log(pem);
    });
  }

}
