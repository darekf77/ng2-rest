import { Injectable } from '@angular/core';


import { Resource } from '../../../../src';
import { ENDPOINTS } from './endpoints';
import { User } from './user';
import { mockController } from './mock.controller';



@Injectable()
export class DatabaseService2 {

    get models() {
        return {
            users: this.rest.api(ENDPOINTS.API_ONE, 'users')
                .mock(require('!raw-loader!./data.json'), 0, mockController)
                .query()
        }
    }

    constructor(
        public rest: Resource<ENDPOINTS, User, User[]>
    ) {
        Resource.map(ENDPOINTS.API_ONE.toString(), 'https://demo9781896.mockable.io/')
        rest.add(ENDPOINTS.API_ONE, 'users');
    }




}