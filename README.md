## ng2-rest ##

Multiendpoint REST api with angular2



To install package run:

    npm install ng2-rest --save


Simple use:

    import { Resource, ENDPOINTS } from '../../../shared/rest';
    import { User } from './user';
    
    @Injectable()
    export class SampleServiceORComponent {
        constructor(private rest: Resource) {
            rest.add<User>(ENDPOINTS.API, 'users'); // define your models
            }
          }
		
		giveMeSampleUsers() {
			// exacly the same as in angular 1.x $resource 
			// ex. get,query,save,update,remove
			this.rest.api(ENDPOINTS.API, 'users')
			 .query() // 
			 .subscribe((users) => {
	            console.log('users', users);
	        })
		}

before that you need to define your endpoints ENUM  (for now inside npm package - endpoints.enum.ts):

    export enum ENDPOINTS {
	    API,
	    OTHER_SUPER_API 
	}

and define endpoinsts url   (for now inside npm package - resource.service.ts): :

    this.endpoints[ENDPOINTS.API] = {
       url: 'http://localhost:3002/api/',
       models: {}
    };

	// and another
	this.endpoints[ENDPOINTS.OTHER_SUPER_API] = {
       url: 'http://super.example.api.com/',
       models: {}
    };
	
and add provider when you bootstrapping your app:

    bootstrap(App, [
        SOME_APP_PROVIDERS, 
        Resource // from ng2-rest
     ]);

