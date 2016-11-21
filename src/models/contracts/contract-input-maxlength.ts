import { Directive, forwardRef, Input, OnInit } from '@angular/core';

import { NG_VALIDATORS, FormControl } from '@angular/forms';
import { FormInputBind } from './generator';
import { MAX_LENGTH_FIELD_NAME, PREFIX } from './consts';

class EmptyValidator {
    public static valid(c: FormControl) { return null; }
}

function validateFactory() {
    return EmptyValidator.valid;
}

@Directive({
    selector: `[${MAX_LENGTH_FIELD_NAME}][ngModel],[${MAX_LENGTH_FIELD_NAME}][formControl]`,
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PostalCodeValidatorDirective), multi: true }
    ]
})
export class PostalCodeValidatorDirective implements OnInit {

    validator: Function;
    @Input(MAX_LENGTH_FIELD_NAME) maxLenght: string;
    @Input('name') name: string;

    constructor() {        
        this.validator = validateFactory();
    }

    validate(c: FormControl) {
        console.log('VALIDATE this. name', this.name);
        console.log('VALIDATE this. input', this.maxLenght);
        c[PREFIX + MAX_LENGTH_FIELD_NAME] = this.maxLenght;
        return this.validator(c);
    }

    ngOnInit() {
        console.log('ngOnInit this. name', this.name);
        console.log('ngOnInit this. input', this.maxLenght);
    }


}
