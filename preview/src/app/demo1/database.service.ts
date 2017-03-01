import { Injectable } from '@angular/core';

import { SimpleResource } from '../../../../src';

export interface User {
    id: number;
    name: string;
}


@Injectable()
export class DatabaseService {

    public users = new SimpleResource<any, any>('https://demo9781896.mockable.io', 'users');

    constructor() {

    }
}