import { Injectable } from '@angular/core';


import { Resource } from '../../../../src'; //###import { Resource } from 'ng2-rest';###
const rest = Resource.create<User, User[]>('https://demo9781896.mockable.io/', 'users');

import { User } from './user';
import { mockController } from './mock.controller';



@Injectable()
export class DatabaseService2 {

    get models() {
        Resource.Headers.request
        return {
            users: rest.model().mock(require('!raw-loader!./data.json'), 0, mockController)
                .query()
        }
    }





}