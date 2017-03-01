import { Directive, forwardRef, Input, OnInit } from '@angular/core';

import { NG_VALIDATORS, FormControl, FormGroup, FormArray } from '@angular/forms';
import { Log, Level } from 'ng2-logger/ng2-logger';
const log = Log.create('contracts')


export namespace Contracts {

    export const MAX_LENGTH_FIELD_NAME = 'contractMaxLength';
    export const PREFIX = '$$';


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
            log.d('VALIDATE this. name', this.name);
            log.d('VALIDATE this. input', this.maxLenght);
            c[PREFIX + MAX_LENGTH_FIELD_NAME] = this.maxLenght;
            return this.validator(c);
        }

        ngOnInit() {
            log.d('ngOnInit this. name', this.name);
            log.d('ngOnInit this. input', this.maxLenght);
        }


    }


    export interface FormGroupArrays {
        [arrayFiledName: string]: FormGroup;
    };

    export interface FormInputBind {
        length: number;
        path: string;
        temp?: any;
    };

    export function prepareForm(form: FormGroup | FormArray, arr: FormInputBind[] = [], path: string = '', ): FormInputBind[] {

        for (let p in form.controls) {
            let c = form.controls[p];
            if (c instanceof FormGroup || c instanceof FormArray) {
                prepareForm(c, arr, p + '.');
            } else {
                arr.push({
                    length: parseInt(c[PREFIX + MAX_LENGTH_FIELD_NAME]),
                    path: p,
                });
            }
        }

        return arr;
    }


    export function prepareFormArrays(arrays: FormGroupArrays): FormInputBind[] {
        let arr: FormInputBind[] = []
        for (let p in arrays) {
            let form = arrays[p];
            let c = prepareForm(form, [], p + '[0].'); // for every
            arr = arr.concat(c);
        }
        return arr;
    }


}

