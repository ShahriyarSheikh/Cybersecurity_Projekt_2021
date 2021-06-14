import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { environment } from "../../../environments/environment";
import { ToastyService } from "ng2-toasty";
import { LocalStorageService } from "./localstorage.service";

@Injectable()
export class SocketService {
    private socket: SocketIOClient.Socket;
    constructor(private toastyService: ToastyService) {
        this.socket = io(environment.socketRoute);
        this.ListenMatchedOrders();
    }

    SendOrderForMatch(order) {
        this.socket.emit("REQUESTMATCHORDERLISTNER", order);
    }

    ListenMatchedOrders() {
        if (!this.socket.hasListeners("REQUESTMATCHORDERRESPONSE")) {
            this.socket.on("REQUESTMATCHORDERRESPONSE", (data: any) => {
                if (data.tradeHashes == "Please deposit security fund.") {
                    this.toastyService.error("Please deposit security fund.");
                }
                else if (data.tradeHashes == "Sorry! Order doesn't match.") {
                    this.toastyService.error("Sorry! Order doesn't match.");
                }
                else {
                    this.toastyService.success("Request matched! Proceed to Ongoing trades to view matched offers.");
                    LocalStorageService.appendRequestMatchNotifications(data);
                }
            });
        }
    }
}