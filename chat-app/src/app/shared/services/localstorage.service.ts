export class LocalStorageService {
    private static readonly _userFiatCurrencyAccounts = "_userFiatCurrencyAccounts";
    private static readonly _userAltCoinAccounts = "_userAltCoinAccounts";
    private static readonly _userEthAccounts = "_userEthAccounts";
    private static readonly _userProfileAccount = "_userProfileAccount";
    private static readonly _nickName = "_nickName";
    private static readonly _requestMatchNotifications = "_requestMatchNotifications";



    static appendRequestMatchNotifications(notification: any) {
        let previousData = this.requestMatchNotifications;
        let data = Array();
        if (previousData != null && previousData != undefined) {
            previousData.forEach(element => {
                data.push(element);
            });
        }
        notification.tradeHashes.forEach(element => {
            data.push({type: notification.type, tradeHash: element});
        });
        localStorage.setItem(this._requestMatchNotifications, JSON.stringify(data));
    }
    static appendUserFiatCurrencyAccounts(currencyAccount: any) {
        let previousData = this.userFiatCurrencyAccounts;
        let data = Array();

        if (previousData != null && previousData != undefined) {
            previousData.forEach(element => {
                data.push(element);
            });
        }
        data.push(currencyAccount);
        localStorage.setItem(this._userFiatCurrencyAccounts, JSON.stringify(data));
    }
    static appendUserAltCoinAccounts(altCoinAccount: any) {
        let previousData = this.userAltCoinAccounts;
        let data = Array();

        if (previousData != null && previousData != undefined) {
            previousData.forEach(element => {
                data.push(element);
            });
        }
        data.push(altCoinAccount);
        localStorage.setItem(this._userAltCoinAccounts, JSON.stringify(data));
    }
    static appendUserEthAccounts(model: any) {
        let previousData = this.userEthAccounts;
        let data = Array();

        if (previousData != null && previousData != undefined) {
            previousData.forEach(element => {
                data.push(element);
            });
        }
        data.push(model);
        localStorage.setItem(this._userEthAccounts, JSON.stringify(data));
    }
    static set nickName(nickName: string) {
        if (nickName != null)
            localStorage.setItem(this._nickName, nickName);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static get nickName() {
        return localStorage.getItem(this._nickName);
    }
    static get requestMatchNotifications(): any {
        return JSON.parse(localStorage.getItem(this._requestMatchNotifications)) || new Array();
    }
    static get userFiatCurrencyAccounts(): any {
        return JSON.parse(localStorage.getItem(this._userFiatCurrencyAccounts)) || new Array();
    }
    static get userAltCoinAccounts(): any {
        return JSON.parse(localStorage.getItem(this._userAltCoinAccounts)) || new Array();
    }
    static get userEthAccounts(): any {
        return JSON.parse(localStorage.getItem(this._userEthAccounts)) || new Array();
    }
    static get userProfileAccountInfo(): any {
        return JSON.parse(localStorage.getItem(this._userProfileAccount)) || new Array();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //We cant delete an item this way. It will delete all the accounts. Need to be fixed.
    static removeRequestMatchNotifications() {
        localStorage.removeItem(this._requestMatchNotifications);
    }
    static removeUserFiatCurrencyAccounts() {
        localStorage.removeItem(this._userFiatCurrencyAccounts);
    }
    static removeUserAltCoinAccounts() {
        localStorage.removeItem(this._userAltCoinAccounts);
    }
    static removeUserEthAccounts() {
        localStorage.removeItem(this._userEthAccounts);
    }
    static removeUserProfileAccount() {
        localStorage.removeItem(this._userProfileAccount);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static clearAll(): void {
        localStorage.removeItem(this._userFiatCurrencyAccounts);
        localStorage.removeItem(this._userAltCoinAccounts);
        localStorage.removeItem(this._userEthAccounts);
        localStorage.removeItem(this._userProfileAccount);
        localStorage.removeItem(this._requestMatchNotifications);
    }
}