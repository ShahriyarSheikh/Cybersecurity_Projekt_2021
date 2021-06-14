import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Injectable } from "@angular/core";

@Injectable()
export class CreateNewOffer {

    form: FormGroup;
    formForRequestMatch: FormGroup;
    constructor(fb: FormBuilder) {
        this.form = fb.group({
            'ethQuantity': [null, Validators.compose([Validators.required, validateNumber,Validators.pattern(/\d/g)])],
            'fiatQuantity': [null, Validators.compose([Validators.required, validateNumber,Validators.pattern(/\d/g)])],
            'arbitratorAddress': [null, Validators.compose([Validators.required])]
        });

        this.formForRequestMatch = fb.group({
            'ethQuantity': [null, Validators.compose([Validators.required, validateNumber, Validators.pattern(/\d/g)])],
            'fiatQuantity': [null, Validators.compose([Validators.required, validateNumber,Validators.pattern(/\d/g)])],
            'deviationAllowedForFiatQuantityInPercentage': [null, Validators.compose([Validators.required,Validators.pattern(/\d/g)])],
            'deviationAllowedForEthQuantityInPercentage': [null, Validators.compose([Validators.required,Validators.pattern(/\d/g)])]
        });
    }
}

function validateNumber(ctrl: FormControl) {
    let _msg = {
        validateNumber: { valid: false }
    };

    if (ctrl.value == null)
        return _msg;

    try {
        return ctrl.value > 0 ? null : _msg;
    }
    catch{
        return _msg;
    }
}