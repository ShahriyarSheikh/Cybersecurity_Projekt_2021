import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Injectable } from "@angular/core";

@Injectable()
export class FiatCurrencyAccounts {

    aliPayAccount: FormGroup;
    cashAppAccount: FormGroup;
    cashDepositeAccount: FormGroup;
    perfectMoneyAccount: FormGroup;
    venmoAccount: FormGroup;
    westernUnionAccount: FormGroup;
    alphaRegex = /^([a-z A-Z]{3,32})$/;

    constructor(private fb: FormBuilder) {

        this.aliPayAccount = fb.group({
            'accountNumber': [null, Validators.compose([Validators.required])],
            'currency': ['', Validators.compose([Validators.required])],
            'accountName': ["AliPay Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["AliPay", Validators.compose([Validators.required])]
        });

        this.cashAppAccount = fb.group({
            'cashTag': [null, Validators.compose([Validators.required,Validators.pattern(/^((?=(.*[a-zA-Z]){1})(?=.*[a-zA-Z0-9@\"|!#$%&/*^\-_\+`~:\[\]()=?»«@£§€{}.;'<>_,])).{2,20}$/)])], 
            'currency': ['', Validators.compose([Validators.required])],
            'accountName': ["Cash App Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["Cash App", Validators.compose([Validators.required])]
        });

        this.perfectMoneyAccount = fb.group({
            'accountNumber': [null, Validators.compose([Validators.required])],
            'currency': ['', Validators.compose([Validators.required])],
            'accountName': ["Perfect Money Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["Perfect Money", Validators.compose([Validators.required])]
        });
    
        this.venmoAccount = fb.group({
            'accountOwnerFullName': [null, Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'venmoUsername': [null, Validators.compose([Validators.required])],
            'currency': ['', Validators.compose([Validators.required])],
            'accountName': ["Venmo Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["Venmo", Validators.compose([Validators.required])]
        });

        this.westernUnionAccount = fb.group({
            'countryRegion': [null, Validators.compose([Validators.required])],
            'country': [null, Validators.compose([Validators.required])],
            'currency': ['', Validators.compose([Validators.required])],
            'accountOwnerFullName': [null, Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'city': [null, Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'email': [null, Validators.compose([Validators.required,Validators.pattern(/^[a-zA-Z]+[a-zA-Z0-9_-]*@([a-zA-Z0-9]+){1}(\.[a-zA-Z0-9]+){1,2}/)])],
            'accountName': ["Western Union Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["Western Union", Validators.compose([Validators.required])]
        });

        this.cashDepositeAccount = fb.group({
            'countryRegion': [null, Validators.compose([Validators.required])],
            'country': [null, Validators.compose([Validators.required])],
            'currency': ['', Validators.compose([Validators.required])],
            'accountOwnerFullName': [null, Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'email': [null, Validators.compose([Validators.required,Validators.email])],
            'bankName': [null, Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'bankId': [null, Validators.compose([Validators.required,Validators.pattern(/^([a-zA-Z]{4})([a-zA-Z]{2})(([2-9a-zA-Z]{1})([0-9a-np-zA-NP-Z]{1}))((([0-9a-wy-zA-WY-Z]{1})([0-9a-zA-Z]{2}))|([)xX]{3})|)$/)])],
            'BranchNumber': [null, Validators.compose([Validators.required,Validators.pattern(/\d/g)])],
            'accountNumber': [null, Validators.compose([Validators.required,Validators.pattern(/^[A-Z]{2}\d{2} ?\d{4} ?\d{4} ?\d{4} ?\d{4} ?[\d]{0,2}$/)])],
            'accountType': [null, Validators.compose([Validators.required])],
            'extraRequirements': [null, Validators.compose([Validators.required])],
            'accountName': ["Cash Deposit Account", Validators.compose([Validators.required,Validators.pattern(this.alphaRegex)])],
            'paymentMethod': ["Cash Deposit", Validators.compose([Validators.required])]
        });
    }
}
