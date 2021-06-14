import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { LocalStorageService } from '../../services/localstorage.service';

declare var window: any;
const web3 = window.web3;

declare var Gun: any;
const gun = Gun({ init: true });

declare var require: any;
var IPFS = require('ipfs');
var Room = require('ipfs-pubsub-room');

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

    coinbase: string = null;
    web3 = window.web3;

    currentMessage: string = null;
    currentPeer: string = null;
    isChatOpen: boolean = false;
    peersDiscovered: {
        [id: string]: {
            address: string,
            name: string,
            status: string,
            unreadCount: number,
            chatHistory: Array<{ type: string, msg: string }>
        }
    } = {};

    //IPFS related variables
    room: any;
    @ViewChild('chatWrapper') chatWrapper: ElementRef;

    ngOnInit(): void {
        if (web3 !== undefined) {
            this.web3 = web3;
            this.coinbase = this.web3.eth.accounts[0];
        }
        if (this.coinbase !== null) {
            this.authorizeCurrentUserInGunDB();
            this.loadIpfs();
        }
    }

    ///////////////////////////////////GUN DB FUNCTIONS///////////////////////////////////////
    private authorizeCurrentUserInGunDB() {
        let user = gun.user();
        user.create(this.coinbase, 'password', (ack) => { });
        user.auth(this.coinbase, 'password', (ack) => {
            if (ack) {
                console.log('GunDB auth was successful');
            }
            else {
                console.log('GunDB auth was failed');
            }
        });
    }
    updateChatInGunDb(currentPeer: string, msgObject) {
        var chat = gun.get("chat/" + this.peersDiscovered[currentPeer].address + '_' + this.coinbase);
        var currentCompleteChatHistory = this.peersDiscovered[currentPeer].chatHistory;
        chat.set(msgObject);
    }
    loadChatHistoryFromGunDb(currentPeer: string) {
        this.peersDiscovered[this.currentPeer].chatHistory = new Array();
        var chat = gun.get("chat/" + this.peersDiscovered[currentPeer].address + '_' + this.coinbase);
        chat.map().once((message, ID) => {
            this.peersDiscovered[currentPeer].chatHistory.push(message);
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////

    loadIpfs() {
        let ipfs = new IPFS({
            repo: 'ipfs/dex/',
            EXPERIMENTAL: {
                pubsub: true
            },
            config: {
                Addresses: {
                    Swarm: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                    ]
                }
            }
        });

        ipfs.once('ready', () => ipfs.id((err, info) => {
            if (err) { throw err }
            console.log('IPFS node ready with address ' + info.id);

            this.room = Room(ipfs, 'ipfs-pubsub-demo');
            this.room.on('peer left', (peer) => this.peerDisconnected(peer));

            // send and receive messages
            this.room.on('peer joined', (peer) => this.doHandshake(peer));
            this.room.on('message', (message) => this.recieveMessage(message));

            // broadcast message every 2 seconds
            //setInterval(() => room.broadcast('hey everyone!'), 2000)
        }))
    }
    doHandshake(peer) {
        console.log("Sending handshake message to ", peer);
        this.room.sendTo(peer, JSON.stringify({
            protocol: "handshake",
            address: this.coinbase,
            name: LocalStorageService.nickName
        }));
    }
    recieveMessage(message) {
        let messageObj = JSON.parse(message.data.toString());
        if (messageObj.protocol == "handshake") {
            let details = { address: messageObj.address, name: messageObj.name, status: "online", unreadCount: 0, chatHistory: new Array() };
            this.peersDiscovered[message.from] = details;
            console.log("Got handshake from " + this.peersDiscovered[message.from].name + "(" + this.peersDiscovered[message.from].address + ")");
        }
        else if (messageObj.protocol == "message") {
            this.peersDiscovered[message.from].unreadCount++;
            this.updateChatInGunDb(message.from, { type: "in", msg: messageObj.message });
            if (this.currentPeer != null) this.chatWrapperReScroll();
        }
    }
    sendMsg() {
        this.room.sendTo(this.currentPeer, JSON.stringify({
            protocol: "message",
            message: this.currentMessage
        }));
        this.updateChatInGunDb(this.currentPeer, { type: "out", msg: this.currentMessage });
        this.currentMessage = "";
        this.chatWrapperReScroll();
    }
    broadcastMsg() {
        this.room.broadcast(JSON.stringify({
            protocol: "message",
            message: this.currentMessage
        }));
        console.log("Broadcasting message: " + this.currentMessage);
    }
    peerDisconnected(peer) {
        this.peersDiscovered[peer].status = "offline";
        console.log('peer ' + this.peersDiscovered[peer].name + ' left');
    }
    startChat(peer: string) {
        this.isChatOpen = true;
        this.currentPeer = peer;
        this.loadChatHistoryFromGunDb(peer);
    }
    chatWrapperReScroll() {
        setTimeout(() => {
            let wrap = this.chatWrapper.nativeElement;
            wrap.scrollTop = wrap.scrollHeight;
        }, 500)
    }
    closeChat() {
        this.isChatOpen = false;
        this.currentMessage = "";
        this.peersDiscovered[this.currentPeer].unreadCount = 0;
        this.currentPeer = null;
    }
}
