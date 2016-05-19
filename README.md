## ng2-rest ##

Multi-endpoint REST api with **Angular 2.** Alternative to angularjs $resource.

Take advantage of ENUM in typescript and generic class and
define your **multiple endpoints url**. Playing with your REST
API was never so easy...



To install package run:

    npm install ng2-rest --save




Simple use:


    import { Resource } from 'ng2-rest/ng2-rest';
    import { JSONP_PROVIDERS } from '@angular/http';
    
and class to your bootstrap:

    bootstrap(App, [
              SOME_APP_PROVIDERS, 
              JSONP_PROVIDERS // required  
              Resource // our ng2-rest
           ]);

build your enum with endpoints ( you can also use strings, but enum's are better !) :
	
    enum ENDPOINTS { // enum instead of strings
    	    API,
    	    OTHER_API
    	}


Define interfaces for response

    import { User, Book, Weather } from './models' // interface

Map your urls and models
   
     @Injectable()
        export class SampleServiceORComponent { 
                        // < enum or 'string', single_model, query_model>
            constructor(private rest: Resource<ENDPOINTS,User,User[]>) {
            
	            // map endpoints and urls
                Resource.map(ENDPOINTS.API.toString(), 'http://localhost:/api');
				Resource.map(ENDPOINTS.OTHER_API.toString(), 'http://example.com/api');
				
				// define your models  
                rest.add(ENDPOINTS.API, 'users'); 
                
                
              }
                    // create your fluent API
              model = {
                getAll:  this.rest.api(ENDPOINTS.API, 'users').query(),
                getAllSorted:  this.rest.api(ENDPOINTS.API, 'users').query({ sorted: true }),
                getSuperUser: this.rest.api(ENDPOINTS.API, 'users').get(0),
                saveCurrentUser : this.rest.api(ENDPOINTS.API, 'users').save(this.user)
              };
              user:User;
              
             }

Use it:
		

    giveMeSampleUsers() {
    
 		this.rest.api(ENDPOINTS.API, 'users')
		 .query() // 
		 .subscribe((users) => {  // Type of respone wil be User[] 
            console.log('users', users);
        })
        
     }
		

Available methods:
- **query** ( fetch array of your models )
- **get** ( get model by id )
- **save** ( post your model )
- **update** ( put model by id )
- **remove** ( delete model by id )
    
Additional methods ( in nearest future )
- **jsonp** ( get jsonp data )
    

