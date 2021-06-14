import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_ABI, EscrowContract_ABI } from '../../../../ABI.const';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { Router, ActivatedRoute } from '@angular/router';
import { Loading } from '../../../../shared/services/emitter.service';
import { ExchangeModel } from '../../../../shared/models/exchangeData.model'
import { ToastyService } from 'ng2-toasty';


declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-selltakeoffer',
    templateUrl: './selltakeoffer.component.html',
    styleUrls: ['./selltakeoffer.component.scss']
})
export class SellTakeOfferComponent implements OnInit {

    contractAbi = DEX_MainContract_ABI;
    contractAddress = DEX_MainContract_Address;
    web3: any;
    contract: any;
    coinbase: string;
    escrowContract: any;
    tradeHash: string = null;
    offer: any;
    isOfferTaken = false;
    releasedFunds: number;
    exchangeData = ExchangeModel

    public owner;
    public sellerAddress;
    public buyerAddress;
    public arbitratorAddress;
    public arbitratorFees;
    public offeredAmount;

    public isBuyerAgreeing;
    public isSellerAgreeing;
    public isArbitratorAgreeingForBuyer;
    public isTransactionSuccessful;
    public fundsReleased;
    public sellerDisputeRaise;
    public buyerDisputeRaise;
    public isArbitratorAgreeingForSeller;
    public buyerSentFiatAmount;
    public sellerAmountDeposit;
    public buyerSecurityDeposit;
    public isSellerDeposit: boolean = false;
    watcherTakeOfferBuyContractAddress = null;

    constructor(private route: ActivatedRoute, private router: Router, private toastyService: ToastyService) {
        this.tradeHash = this.route.snapshot.params.id;
    }

    ngOnInit() {
        if (web3 != undefined) {
            this.web3 = web3;
        }
        else {
            //this.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.20:8545"));
        }
        this.coinbase = this.web3.eth.accounts[0];
        this.LoadContract();
    }

    LoadContract() {
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.web3.eth.defaultAccount = this.coinbase;
        this.watchTakeOfferBuy();
        this.watchTakeOfferBuyAndUpdate();
        this.LoadTradeDetailsFromTradeHash(this.tradeHash);
    }

    async LoadTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getBuyOfferFromTradeHash(hash, cb));
        this.offer = {
            tradeHash: hash,
            fiatCurrency: offerDetails[0],
            paymentMethod: offerDetails[1],
            ethQuantity: offerDetails[2],
            fiatQuantity: offerDetails[3],
            sellerAddress: offerDetails[4],
            buyerAddress: offerDetails[5],
            arbitratorAddress: offerDetails[6]
        }
    }

    async takeBuyOfferInContract() {
        Loading.emit(true);
        if (this.tradeHash != null && this.tradeHash != undefined && this.offer.tradeHash != "") {
            if (this.contract != undefined) {
                await promisify(cb => this.contract.takeBuyOffer(this.tradeHash, cb)).catch(error => Loading.emit(false));
            }
        }
    }

    watchTakeOfferBuy() {
        const filter = web3.eth.filter({
            fromBlock: 0,
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("EscrowContractCreatedForTrade(address,address,address,bytes32)"), null, null, this.tradeHash]
        })
        filter.watch(async (error, result) => {
            this.watcherTakeOfferBuyContractAddress = result.data;
        });
    }

    private RemoveExtraZeroFromAddress(address: string) {
        if (address == undefined || address == null)
            return address;
        var splittedAddress = address.split("x");
        address = "0x" + splittedAddress[1].replace(/^(0+)/g, '');
        return address;
    }

    cancelTakingOffer() {
        this.router.navigateByUrl(`/sell`);
    }

    takeOffer() {
        this.takeBuyOfferInContract();
    }

    async loadEscrowContract(contractAddress: string) {
        this.escrowContract = (this.web3.eth.contract(EscrowContract_ABI)).at(contractAddress);

        this.owner = promisify(cb => this.escrowContract.owner.call(cb));
        this.arbitratorAddress = promisify(cb => this.escrowContract.arbitratorAddress.call(cb))
        this.sellerAddress = promisify(cb => this.escrowContract.sellerAddress.call(cb));
        this.buyerAddress = promisify(cb => this.escrowContract.buyerAddress.call(cb));
        this.arbitratorFees = promisify(cb => this.escrowContract.arbitratorFees.call(cb));
        this.offeredAmount = promisify(cb => this.escrowContract.offeredAmount.call(cb));
        this.isBuyerAgreeing = promisify(cb => this.escrowContract.isBuyerAgreeing.call(cb));
        this.isSellerAgreeing = promisify(cb => this.escrowContract.isSellerAgreeing.call(cb));
        this.isArbitratorAgreeingForBuyer = promisify(cb => this.escrowContract.isArbitratorAgreeingForBuyer.call(cb));
        this.isArbitratorAgreeingForSeller = promisify(cb => this.escrowContract.isArbitratorAgreeingForSeller.call(cb));
        this.sellerAmountDeposit = promisify(cb => this.escrowContract.sellerAmountDeposit.call(cb));
        this.buyerSecurityDeposit = promisify(cb => this.escrowContract.buyerSecurityDeposit.call(cb));
        this.sellerDisputeRaise = promisify(cb => this.escrowContract.sellerDisputeRaise.call(cb));
        this.buyerDisputeRaise = promisify(cb => this.escrowContract.buyerDisputeRaise.call(cb));
        this.buyerSentFiatAmount = promisify(cb => this.escrowContract.buyerSentFiatAmount.call(cb));
        await Promise.all([
            this.owner,
            this.arbitratorAddress,
            this.sellerAddress,
            this.buyerAddress,
            this.arbitratorFees,
            this.offeredAmount,
            this.isBuyerAgreeing,
            this.isSellerAgreeing,
            this.isArbitratorAgreeingForBuyer,
            this.isArbitratorAgreeingForSeller,
            this.sellerAmountDeposit,
            this.buyerSecurityDeposit,
            this.sellerDisputeRaise,
            this.buyerDisputeRaise,
            this.buyerSentFiatAmount
        ]).then(values => {
            this.owner = values[0];
            this.arbitratorAddress = values[1];
            this.sellerAddress = values[2];
            this.buyerAddress = values[3];
            this.arbitratorFees = values[4];
            this.offeredAmount = values[5];
            this.isBuyerAgreeing = values[6];
            this.isSellerAgreeing = values[7];
            this.isArbitratorAgreeingForBuyer = values[8];
            this.isArbitratorAgreeingForSeller = values[9];
            this.sellerAmountDeposit = values[10];
            if (this.sellerAmountDeposit == 0 || this.sellerAmountDeposit == undefined || this.sellerAmountDeposit == null) {
                this.isSellerDeposit = false;
            }
            else {
                this.isSellerDeposit = true;
            }
            this.buyerSecurityDeposit = values[11];
            this.sellerDisputeRaise = values[12];
            this.buyerDisputeRaise = values[13];
            this.buyerSentFiatAmount = values[14];
            this.watchBuyerDeposit();
            this.WatchBuyerDispute();
            this.watchSignForBuyer();
            this.watchReleaseFundsByBuyer();
        });
    }

    watchSellerDeposit() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.escrowContract.address,
            topics: [web3.sha3("RecievedFromSeller(address,address,uint256)"), null, this.ConvertAddressToBase64(this.sellerAddress), null]
        });
        filter.watch((error, result) => {
            if (!error) {
                this.sellerAmountDeposit = parseInt(result.topics[3], 16);
                if (this.sellerAmountDeposit != 0 && this.sellerAmountDeposit != undefined && this.sellerAmountDeposit != null) {
                    this.isSellerDeposit = true;
                }
                Loading.emit(false);
                this.toastyService.success("Deposit for seller successful");
            }
            else if (error) {
                this.toastyService.error("transaction failed");
            }
        });
    }

    watchSignForSeller() {
        this.escrowContract.SignerForSeller({ fromBlock: 0, toBlock: 'latest', caller: this.sellerAddress }).watch((err, result) => {
            if (err) {
                this.toastyService.error("transaction failed");
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.isSellerAgreeing = true;
                Loading.emit(false);
                this.toastyService.success("Sign for Seller successful");
            }
        })
    }

    WatchSellerDispute() {
        this.escrowContract.RaiseDisputeForSeller({ fromBlock: 0, toBlock: 'latest', caller: this.sellerAddress }).watch((err, result) => {
            if (err) {
                this.toastyService.error("transaction failed");
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.sellerDisputeRaise = true;
                Loading.emit(false);
                this.toastyService.success("Dispute for seller raised successfuly");
            }

        })
    }

    watchReleaseFunds() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.escrowContract.address,
            topics: [web3.sha3("ReleaseFundsForSeller(address,address,uint256)"), null, this.ConvertAddressToBase64(this.sellerAddress), null]
        });

        filter.watch((error, result) => {
            if (!error) {
                this.releasedFunds = parseInt(result.topics[3], 16);
                this.fundsReleased = true;
                this.isSellerDeposit = true;
                this.isBuyerAgreeing = true;
                this.buyerDisputeRaise = true;
                this.isTransactionSuccessful = true;
                Loading.emit(false);
                this.toastyService.success("Funds released for seller successful");
                this.router.navigateByUrl(`/sell`);
            }
            else {
                this.toastyService.error("transaction failed");
            }
        });
    }

    watchTakeOfferBuyAndUpdate() {
        setInterval(async () => {
            if (this.watcherTakeOfferBuyContractAddress != null) {
                this.web3.eth.defaultAccount = this.coinbase;
                await this.loadEscrowContract(this.RemoveExtraZeroFromAddress(this.watcherTakeOfferBuyContractAddress));
                this.watcherTakeOfferBuyContractAddress = null;
                Loading.emit(false);
                this.isOfferTaken = true;
            }
        }, 1000);
    }

    async signerForSeller() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.signerForSeller(cb)).catch(error => {
                Loading.emit(false);
            });//in wei;
            this.watchSignForSeller();
        }
    }

    async  releaseFundsToSeller() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.releaseFundsToSeller(cb)).catch(error => {
                Loading.emit(false);
            });//in wei;
            this.watchReleaseFunds();
        }
    }

    async raiseDisputeForSeller() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.raiseDisputeForSeller(cb)).catch(error => {
                Loading.emit(false);
            });//in wei; //this.web3.toBigNumber(10), 
            this.WatchSellerDispute();
        }
    }

    async depositForSeller() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            this.exchangeData.amountLockedInSellOffers += Number(web3.fromWei(this.offeredAmount, 'ether'));
            localStorage.setItem("amountLockedInSellOffers", JSON.stringify(this.exchangeData.amountLockedInSellOffers));
            await promisify(cb => this.escrowContract.depositForSeller({ value: this.offeredAmount }, cb)).catch(error => {
                Loading.emit(false);
                this.exchangeData.amountLockedInSellOffers -= Number(web3.fromWei(this.offeredAmount, 'ether'))
                localStorage.setItem("amountLockedInSellOffers", JSON.stringify(this.exchangeData.amountLockedInSellOffers));
            });//in wei
            this.watchSellerDeposit();

        }
    }

    watchBuyerDeposit() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.escrowContract.address,
            topics: [web3.sha3("RecievedFromBuyer(address,address,uint256)"), null, this.ConvertAddressToBase64(this.buyerAddress), null]
        });
        filter.watch((error, result) => {
            if (!error) {
                this.buyerSecurityDeposit = parseInt(result.topics[3], 16);
                this.toastyService.success("Buyer has deposited.")
            }
        });
    }

    WatchBuyerDispute() {
        this.escrowContract.RaiseDisputeForBuyer({ fromBlock: 0, toBlock: 'latest', caller: this.buyerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.buyerDisputeRaise = true;
            }
        })
    }

    watchSignForBuyer() {
        this.escrowContract.SignerForBuyer({ fromBlock: 0, toBlock: 'latest', caller: this.buyerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.isBuyerAgreeing = true;
                this.toastyService.success("Buyer has signed.")
            }
        })
    }

    watchReleaseFundsByBuyer() {
        this.escrowContract.ReleaseFundsForBuyer({ fromBlock: 0, toBlock: 'latest', buyerAddress: this.buyerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined && result.args.value != null && result.args.value != undefined) {
                this.fundsReleased = true;
                this.isBuyerAgreeing = true;
                this.buyerDisputeRaise = true;
                this.isTransactionSuccessful = true;
                Loading.emit(false);
                this.toastyService.success("Buyer has released funds.");
                this.router.navigateByUrl(`/sell`);
            }
        });
    }

    private ConvertAddressToBase64(address: string) {
        if (address == undefined || address == null)
            return address;
        var splittedAddress = address.split("x");
        address = "0x000000000000000000000000" + splittedAddress[1];
        return address;
    }
}
