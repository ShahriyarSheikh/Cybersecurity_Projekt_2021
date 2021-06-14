import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';

declare var require: any;
var keythereum = require("keythereum");

@Component({
  selector: 'app-walletmanagment',
  templateUrl: './walletmanagment.component.html',
  styleUrls: ['./walletmanagment.component.scss']
})
export class WalletmanagmentComponent implements OnInit {

  showWalletForm: boolean = false;
  walletRecoveryOption: string;
  walletName: string;
  walletpassword: string;
  walletDetailsList: any = new Array();
  RecoveryWalletName: string;

  privateKeyRecoveryPassword: string;
  privateKeyRecoveryValue: string;

  constructor() { }

  ngOnInit() {
    this.walletDetailsList = LocalStorageService.userEthAccounts;
  }

  public recoverWalletUsingPrivateKey() {
    //restore using private key
    var options = {
      kdf: "pbkdf2",
      cipher: "aes-128-ctr",
      kdfparams: {
        c: 262144,
        dklen: 32,
        prf: "hmac-sha256"
      }
    };
    let dk = keythereum.create();
    keythereum.dump(this.privateKeyRecoveryPassword, this.privateKeyRecoveryValue, dk.salt, dk.iv, options, (keyObject)=> {
      var walletDetails = {
        walletName: this.RecoveryWalletName,
        publicAddress: "0x" + keyObject.address
      };
      LocalStorageService.appendUserEthAccounts(walletDetails);
      this.walletDetailsList.unshift(walletDetails);
      this.RecoveryWalletName = undefined;
      this.privateKeyRecoveryPassword = undefined;
      this.privateKeyRecoveryValue = undefined
      return "0x" + keyObject.address;
    });
  }

  public recoverWalletUsingJSONFile(event) {
    var reader = new FileReader();
    reader.onload = () => {
      let keyObject = JSON.parse(atob(reader.result.split(',')[1]));
      var walletDetails = {
        walletName: this.RecoveryWalletName,
        publicAddress: "0x" + keyObject.address
      };
      LocalStorageService.appendUserEthAccounts(walletDetails);
      this.walletDetailsList.unshift(walletDetails);
      this.RecoveryWalletName = undefined;
      return "0x" + keyObject.address;
      //console.log(keythereum.recover("mparsec123", keyObject).toString('HEX'));  //recovery of private key
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  public generateNewEthWallet() {
    var params = { keyBytes: 32, ivBytes: 16 };
    keythereum.create(params, (dk) => {
      var options = {
        kdf: "pbkdf2",
        cipher: "aes-128-ctr",
        kdfparams: {
          c: 262144,
          dklen: 32,
          prf: "hmac-sha256"
        }
      };

      keythereum.dump(this.walletpassword, dk.privateKey, dk.salt, dk.iv, options, (keyObject) => {
        //Download JSON FILE
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keyObject));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "NewEthAccount" + ".json");
        document.body.appendChild(downloadAnchorNode);// required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        var walletDetails = {
          walletName: this.walletName,
          publicAddress: "0x" + keyObject.address
        };
        LocalStorageService.appendUserEthAccounts(walletDetails);
        this.walletDetailsList.unshift(walletDetails);

        this.showWalletForm = false;
        this.walletName = undefined;
        this.walletpassword = undefined;
        return "0x" + keyObject.address;
      });
    });

  }

}
