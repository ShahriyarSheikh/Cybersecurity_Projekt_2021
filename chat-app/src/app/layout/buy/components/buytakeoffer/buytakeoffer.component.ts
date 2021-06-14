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
    selector: 'app-buytakeoffer',
    templateUrl: './buytakeoffer.component.html',
    styleUrls: ['./buytakeoffer.component.scss']
})
export class BuyTakeOfferComponent implements OnInit {

    contractAbi = DEX_MainContract_ABI;
    contractAddress = DEX_MainContract_Address;
    web3: any;
    contract: any;
    escrowContract: any;
    coinbase: string;
    tradeHash: string = null;
    offer: any;
    isOfferTaken = false;
    isBuyerDeposit: boolean = false;
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
    public isTransactionSuccessful;
    public fundsReleased;
    public isArbitratorAgreeingForBuyer;
    public sellerDisputeRaise;
    public buyerDisputeRaise;
    public isArbitratorAgreeingForSeller;
    public buyerSentFiatAmount;
    public sellerAmountDeposit;
    public buyerSecurityDeposit;
    watcherTakeOfferSellContractAddress = null;

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
        this.watchTakeOfferSell();
        this.watchTakeOfferSellAndUpdate();
        this.LoadTradeDetailsFromTradeHash(this.tradeHash);
    }

    async LoadTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getSellOfferFromTradeHash(hash, cb));
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

    async takeSellOfferInContract() {
        Loading.emit(true);
        if (this.offer.tradeHash != undefined && this.offer.tradeHash != null && this.offer.tradeHash != "") {
            if (this.contract != undefined) {
                await promisify(cb => this.contract.takeSellOffer(this.offer.tradeHash, cb)).catch(error => Loading.emit(false));

            }
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
                if (this.buyerSecurityDeposit != 0 && this.buyerSecurityDeposit != undefined && this.buyerSecurityDeposit != null) {
                    this.isBuyerDeposit = true;
                }
                Loading.emit(false);
                this.toastyService.success("Deposit for buyer successful");
            }
            else {
                this.toastyService.error("transaction failed");
            }
        });
    }


    watchSignForBuyer() {
        this.escrowContract.SignerForBuyer({ fromBlock: 0, toBlock: 'latest', caller: this.buyerAddress }).watch((err, result) => {
            if (err) {
                this.toastyService.error("transaction failed");
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.isBuyerAgreeing = true;
                Loading.emit(false);
                this.toastyService.success("Sign for buyer successful");
            }
        })
    }

    WatchBuyerDispute() {
        this.escrowContract.RaiseDisputeForBuyer({ fromBlock: 0, toBlock: 'latest', caller: this.buyerAddress }).watch((err, result) => {
            if (err) {
                this.toastyService.error("transaction failed");
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.buyerDisputeRaise = true;
                Loading.emit(false);
                this.toastyService.success("Dispute for buyer raised successfuly");
            }

        })
    }


    watchReleaseFunds() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.escrowContract.address,
            topics: [web3.sha3("ReleaseFundsForBuyer(address,address,uint256)"), null, this.ConvertAddressToBase64(this.buyerAddress), null]
        });

        filter.watch((error, result) => {
            if (!error) {
                this.releasedFunds = parseInt(result.topics[3], 16);
                this.fundsReleased = true;
                this.isBuyerDeposit = true;
                this.isBuyerAgreeing = true;
                this.buyerDisputeRaise = true;
                this.isTransactionSuccessful = true;
                Loading.emit(false);
                this.toastyService.success("Funds released for buyer successful");
                this.router.navigateByUrl(`/buy`);
            }
            else {
                this.toastyService.error("transaction failed");
            }
        });
    }

    watchTakeOfferSell() {
        const filter = web3.eth.filter({
            fromBlock: 0,
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("EscrowContractCreatedForTrade(address,address,address,bytes32)"), null, null, this.tradeHash]
        })
        filter.watch(async (error, result) => {
            this.watcherTakeOfferSellContractAddress = result.data;
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
        this.router.navigateByUrl(`/buy`);
    }

    takeOffer() {
        this.takeSellOfferInContract();
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
            this.buyerSecurityDeposit = values[11];
            if (this.buyerSecurityDeposit == 0 || this.buyerSecurityDeposit == undefined || this.buyerSecurityDeposit == null) {
                this.isBuyerDeposit = false;
            }
            else {
                this.isBuyerDeposit = true;
            }
            this.sellerDisputeRaise = values[12];
            this.buyerDisputeRaise = values[13];
            this.buyerSentFiatAmount = values[14];
            this.watchSellerDeposit();
            this.WatchSellerDispute();
            this.watchSignForSeller();
            this.watchReleaseFundsBySeller();
        });
    }




    watchTakeOfferSellAndUpdate() {
        setInterval(async () => {
            if (this.watcherTakeOfferSellContractAddress != null) {
                this.web3.eth.defaultAccount = this.coinbase;
                await this.loadEscrowContract(this.RemoveExtraZeroFromAddress(this.watcherTakeOfferSellContractAddress));
                this.watcherTakeOfferSellContractAddress = null;
                this.isOfferTaken = true;
                Loading.emit(false);
            }
        }, 1000);
    }







    async signerForBuyer() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.signerForBuyer(cb)).catch(error => {
                Loading.emit(false);
            });//in wei;
            this.watchSignForBuyer();
        }
    }

    async  releaseFundsToBuyer() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.releaseFundsToBuyer(cb)).catch(error => {
                Loading.emit(false);
            });//in wei;
            this.watchReleaseFunds();
        }
    }

    async raiseDisputeForBuyer() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            await promisify(cb => this.escrowContract.raiseDisputeForBuyer(cb)).catch(error => {
                Loading.emit(false);
            });//in wei; //this.web3.toBigNumber(10),
            this.WatchBuyerDispute();
        }
    }

    async depositForBuyer() {
        Loading.emit(true);
        if (this.escrowContract != undefined) {
            this.exchangeData.amountLockedInBuyOffers += Number(web3.fromWei(this.offeredAmount, 'ether'));
            localStorage.setItem("amountLockedInBuyOffers", JSON.stringify(this.exchangeData.amountLockedInBuyOffers));
            await promisify(cb => this.escrowContract.depositForBuyer({ value: this.offeredAmount }, cb)).catch(error => {
                Loading.emit(false);
                this.exchangeData.amountLockedInBuyOffers -= Number(web3.fromWei(this.offeredAmount, 'ether'));
                localStorage.setItem("amountLockedInBuyOffers", JSON.stringify(this.exchangeData.amountLockedInBuyOffers));
            });//in wei;//in wei
            this.watchBuyerDeposit();
        }
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
                this.toastyService.success("Seller has deposited.")
            }
        });
    }


    WatchSellerDispute() {
        this.escrowContract.RaiseDisputeForSeller({ fromBlock: 0, toBlock: 'latest', caller: this.sellerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.sellerDisputeRaise = true;
            }
        })
    }

    watchSignForSeller() {
        this.escrowContract.SignerForSeller({ fromBlock: 0, toBlock: 'latest', caller: this.sellerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined) {
                this.isSellerAgreeing = true;
                this.toastyService.success("Seller has signed.")
            }
        })
    }

    watchReleaseFundsBySeller() {
        this.escrowContract.ReleaseFundsForSeller({ fromBlock: 0, toBlock: 'latest', buyerAddress: this.buyerAddress }).watch((err, result) => {
            if (err) {
                return err;
            }
            if (result.args.caller != null && result.args.caller != undefined && result.args.value != null && result.args.value != undefined) {
                this.fundsReleased = true;
                this.isBuyerAgreeing = true;
                this.buyerDisputeRaise = true;
                this.isTransactionSuccessful = true;
                Loading.emit(false);
                this.toastyService.success("Seller has released funds.")
                this.router.navigateByUrl(`/buy`);
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
