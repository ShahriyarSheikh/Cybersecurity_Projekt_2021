class DiscoveriesModel {
    coinbase: string = null; // this is the eth wallet address of the person who is sending the message
    currentChatUserId: string = null;
    usersChat: { [id: string]: UserChatDetails } = {};
    get totalUnreadMessageCount() {
        let total = 0;
        for (const key in Discoveries.usersChat) {
                total += Discoveries.usersChat[key].unreadCount;
        }
        return total;
    }
}

class UserChatDetails {
    peerInfo: any = null;
    name: string = null;
    userOnlineStatus: boolean;
    chatHistory: Array<ChatHistory> = new Array();
    unreadCount: number = 0;
    addressOfReceiver:string;

}

class ChatHistory {
    msg: string = null;
    type: string = null;
    dateTime: string = null;
    senderAddress: string = null;
    isNameRequired?: boolean;
}

export let Discoveries: DiscoveriesModel = new DiscoveriesModel();
// export var CurrentChatUserId: string = null;
