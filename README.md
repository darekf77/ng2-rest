## ng2-rest ##

Compatible with

 1. [AngularClass/angular2-webpack-starter](https://github.com/AngularClass/angular2-webpack-starter)
 2. [Angular CLI](https://github.com/angular/angular-cli)

Simple, efficient REST api with **Angular 2**. 
Best way connect Angular2 application with restfull backend.

[Demo github](https://darekf77.github.io/ng2-rest)

To install package run:

    npm install ng2-rest --save

Import module



```ts
import {Ng2RestModule} from 'ng2-rest';

@NgModule({
	bootstrap: [AppComponent],
	imports: [ 
		Ng2RestModule
	])
export class AppModule { }
```

SimpleResource
==============

Quicket way to use your REST API. \

```ts
import { DatabaseService } from './database.service';

@Component({
...
})
export class DemoComponent implements OnInit, OnDestroy {
  
  // normaly you should use SimpleResource:
  // - by extending service class (inheritance)
  // - or having instance inside service class (composition)
   
  public usersService = new SimpleResource<any, any> // <single,array> type
	  ('http://demo9781896.mockable.io', 'users/:id');
	  
  constructor() {
		SimpleResource.mockingMode.setBackendOnly();
		
		// OR if you wanna mock your data
		// SimpleResource.mockingMode.setMocksOnly();
		// this.db.users.mock.data = [
		// 	{"name":"Bob mock","id":1},
		// 	{"name":"Alice mock","id":2}
		// ];
	    // this.db.users.mock.controller = (r) => {
	    //   return { data: r.data }
	    // }
	    
  }

  users = [];

  public ngOnInit() { }

 async getData() { // you can also use normal promises insted of async/await
    try {
    
      let users = await this.usersService.model().query();
	  
	  // soring in query params
	  // let users = await this.usersService.model().query({ sort:'asc' });
      if (users) {
        this.users = users;
      }
	  
	  // users manipulation GET, PUT, DELETE, POST
	  let user = await this.usersService.model({ id:3 }).get();	
      let user = await this.usersService.model({ id:3 }).update(users[0]);
      await this.usersService.model({ id:3 }).remove();
      await this.usersService.model().save({ name: 'Dariusz' });

    } catch (e) {
      console.error(e)
    }
  }

  public ngOnDestroy() {
    this.usersService.destroy();
  }

}




```
Specification
| Name | Parameters  | Description
| :---: | --- | ---: |
| **query** | `(optional) UrlParams[] ` |  fetch array of your models, optionally with parameters |
| **get** | `UrlParams[] ` |   get model by parameters  |
| **save** | `model, UrlParams[] ` |   post object model  |
| **update** | `model, UrlParams[]` |   put object model |
| **remove** | `UrlParams[]` |   remove object by params |parameters |

Resource
========

Fit you existing API (not only REST) into new fluent objects...
**Resource** it is more advance version of **SimpleResource** and
also SimpleResource is the wrap of Resource.

Examples:

**service.ts**

```ts
     @Injectable()
        export class DatabaseService { 
                        // < enum or 'string', single_model, query_model>
            constructor(private rest: Resource<ENDPOINTS,User,User[]>) {
            
	            // map endpoints and urls
                Resource.map(ENDPOINTS.API.toString(),
	                'http://localhost:/api');
				Resource.map(ENDPOINTS.OTHER_API.toString(),
					'http://example.com/api');
				
				// define your models  
				rest.add(ENDPOINTS.API, 'users'); 
                rest.add(ENDPOINTS.API, 'users/:some_param'); 
                rest.add(ENDPOINTS.API, 'users/:some_param/books/:bookid'); 
                
              }
              
              // create your fluent API
              get model() {
                return {
					getAll:  this.rest
		                .api(ENDPOINTS.API, 'users')
		                .query(),
	                getAllSorted:  this.rest
		                .api(ENDPOINTS.API, '/users/inside')
		                .query([{ sorted: true }]),
	                getSuperUser: this.rest
		                .api(ENDPOINTS.API, 'users/super')
		                .get([{id:0}]),
	                saveCurrentUser : this.rest
		                .api(ENDPOINTS.API, 'users')
		                .save(this.user)
				}
              };

		     
		     
			 mock_controller = (request: MockRequest<any> ):MockResponse
			  => { 
				 let user = request.data;
			     user.id = request.params['id'];
			     return { data:user }; 
			 }
			 
			 users = [ { name:"name1":id:1 }, { name:"name2":id:2 }   ]
             get mocked_models() {
                return {
					getAllMocks:  this.rest
	                .api(ENDPOINTS.API,'users')
	                .mock(JSON.stringify(this.users))
	                .query(),
               getFirstMock:  this.rest
	               .api(ENDPOINTS.API, 'users')
	               .mock(require('user.json')), 1000)
	               .get([{ id:0 }]), // timeout 1000ms = 1s
                getDataFromController:  this.rest
	                .api(ENDPOINTS.API, 'users')
	                .mock(require('user.json')), 0, mock_controller)
	                .get([{id:100}])
				}
             };

              user:User;
              
             }
```
**component.ts**		
```ts
...

import { Subscription } from 'rxjs';
import { Resource } from 'ng2-rest';

import { DatabaseService } from './service';

@Component({
  ..
})
export class DemoComponent implements OnInit, OnDestroy {

  constructor(public db: DatabaseService, private snackBar: MdSnackBar) {
    Resource.mockingMode.setMocksOnly();
  }

  handlers: Subscription[] = [];
  users = [];

  public ngOnInit() {
	this.handlers.push(this.db.models.users.subscribe(data => {
      this.users = data;
    }));
  }

 
  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe())
  }

}
	
```

Simple data mocking
============

It is one of the best features here. You don't need a backend for your front-end coding. 

 Simplest way to mocking data:
```ts
	// user.json
	[{ id: 12, name: 'Dariusz' },
	{ id: 15, name: 'Marcin' }]


	// service.ts
	...
	getUsers = () => this.rest.api( ENDPOINT.API, modelName )
		.mock( require('./user.json') ).
		query()


	// component.ts
	...
	service.getUsers().subscribe( users => {
		console.log( 'users:', users ); 
		// users: [{ id: 12, name: 'Dariusz' }, { id: 15, name: 'Marcin' }]
	}
```
 

Mock Controller
===============

 Sample MockController function to just return mocked data based on params:
```ts
	// mock-controller.ts
    export function mockController(
	    request: MockRequest<User> ): MockResponse 
    { 
		// request.data ->   { id: 10, name: 'Dariusz'  }
		// request.params -> {  id: 23 }
		// request.body -> undefined -> only with .save(), update() 
		// request.backend - MockAutoBackend<User>
		// request.method 
		
		let user = request.data;
		user.id = request.params.id;
		return { data:user }; // return nothing or undefined to propagate error
    }
	
	
	// service.ts
	import { mockController } from './mock-controller';
	...
	data = (id) => this.rest.api( ENDPOINT.API, modelName )
		.mock( { id: 10, name: 'Dariusz'  }, mockController).
		get([{ id: id }] )) 


	// component.ts
	...
	service.data(23).subscribe( user => {
		console.log( 'user:', user ); // user: { id: 23, name: 'Dariusz'  }
	}
```


MockAutoBackend
===============

#### generators [$]

If you wanna ***generate, filter, order, sort*** sample data try third options in controller - 
MockAutoBackend.  It is perfect thing for mocking pagination in your MockController.

By building sample json data object with $ prefix property
 now it is possible to generate very nice random data.
 
###### Array

If value of property is an array, the generator will pick one at random:
 
```js
    {
        "$id" : [1,2,3],
        "name": "Dariusz"
    }
```

The output will be: 
```js
    {
        "id": 2,            // or 1 or 3  - it's random thing,
        "name": "Dariusz"   // property without $ stays the same 
    }
```
Of course it is possible to create json with nested $ fields.

###### String

You also can generate values using [Faker mustache string](https://github.com/marak/Faker.js/#fakerfake) as value.


```js
{
    "$fullTitle" : "{{name.lastName}}, {{name.firstName}} {{name.suffix}}"
}
```

Outputs:

```json
{
    "fullTitle": "Marks, Dean Sr."
}
```

Pagination example
------------------

 Sample MockController generating pagination data with MockAutoBackend:
```ts
	// model.json
	{
        $id : [1,2,3],
        name: 'Dariusz'
    }
	
	// mock-controller.ts
	export function mockController( request: MockRequest<T> ):MockResponse 
    { 
	    console.log(request.backend.models); /// generated models
	    let pageNumber = request.params.pageNumber;
	    let pageSize = request.params.pageSize;
	    let data = request.backend.getPagination( pageNumber, pageSize );
		return { data: data, code: 200 }; // code is optional, 200  is default
    }
	
	// example.service.ts
	import { mockController } from './mock-controller';
	
	...	
	numberOfGeneratedPaginartionModels = 400;	
	getPaginartion =  (params) => this.rest.api( ENDPOINT.API, modelName)
		.mock( requre('./model.json'), 
		mockController,
		this.numberOfGeneratedPaginartionModels).query()
	...


	// component.ts
	...
	currentDisplayedModels = []
	pageSize = 10;
	pageChanged = ( n ) => {
		this.service.getPagination({ pageNumber:n, pageSize: this.pageSize  })
			.subscribe(  partOfMockedPaginationModels => {
				currentDisplayedModels = partOfMockedPaginationModels;
			}) 
	}
    
```

Headers
-------

With ng2-rest you can also easly acces you response and request headers
```ts
	// you can also use class Resource for that
	console.log(SimpleResource.headers.request);
	console.log(SimpleResource.headers.response);

```

