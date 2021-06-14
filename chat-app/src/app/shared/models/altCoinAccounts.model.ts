import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Injectable } from "@angular/core";

@Injectable()
export class AltCoinAccounts {

    altCoinAccount: FormGroup;

    constructor(private fb: FormBuilder) {

        this.altCoinAccount = fb.group({
            'paymentMethod': [null, Validators.compose([Validators.required])],
            'altCoinAddress': [null, Validators.compose([Validators.required])],
            'accountName': [null, Validators.compose([Validators.required,Validators.pattern(/^([a-zA-Z ]{3,32})$/)])]
        });

    }
}
