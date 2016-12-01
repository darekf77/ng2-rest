## ng2-rest ##

Compatible with

 1. [AngularClass/angular2-webpack-starter](https://github.com/AngularClass/angular2-webpack-starter)
 2. React  - coming soon...

Multi-endpoint REST api with **Angular 2.** 

Alternative to angularjs $resource + extremely useful thing to build/mock frontend app in browser.

NEW FEATURE:
Generate documentation from ng2-rest requests with [ng2-rest-docs-server](https://github.com/darekf77/ng2-rest-docs-server) . 
Also you can generate [Spring Cloud Contracts](https://cloud.spring.io/spring-cloud-contract/spring-cloud-contract.html)  with this tool.


Extremely useful with E2E and mocked all app in frontend with ng2-rest 
- you don't need to make docs for backend... it will be automatically generated
 from request based on E2E tests.

Take advantage of ENUM in typescript and generic class and
define your **multiple endpoints url**. Playing with your REST
API was never so easy...

Also **mocking** data is super nice here. You can use mock controller to randomize
and customize your response data successes and errors ( by returning undefined in
mock controller). 

To install package run:

    npm install ng2-rest --save
   
  
Simple use:
```ts
    import { Resource } from 'ng2-rest/ng2-rest';
```
Put `Resource` in your ngModule:
```ts
@NgModule({
    // ...
    providers: [Resource]
    // ...
})
```

build your enum with endpoints or types

```ts
    enum ENDPOINTS { // enum instead of strings
    	    API,
    	    OTHER_API
    	}
    // or
    type ENDPOINTS = 'http://github.com' | 'http://npmjs.com'
```

Define interfaces for response
```ts
    import { User, Book, Weather } from './models' // interface
```
Map your urls and models
 
```ts
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
                getAllSorted:  this.rest.api(ENDPOINTS.API, '/users/inside').query([{ sorted: true }]),
                getSuperUser: this.rest.api(ENDPOINTS.API, 'users/super').get([{id:0}]),
                saveCurrentUser : this.rest.api(ENDPOINTS.API, 'users').save(this.user)
              };

              // NEW! mock your request
		     users = [ { name:"name1":id:1 }, { name:"name2":id:2 }   ]
			 mock_controller = (request: MockRequest<any> ):MockResponse
			  => { 
				 let user = request.data;
			     user.id = request.params['id'];
			     return { data:user }; 
			 }
             mocked_models = {
                getAllMocks:  this.rest.api(ENDPOINTS.API, 'users')
                  .mock(JSON.stringify(this.users)).query(),
               getFirstMock:  this.rest.api(ENDPOINTS.API, 'users')
                  .mock(require('user.json')), 1000).get([{ id:0 }]), // timeout 1000ms = 1s
                getDataFromController:  this.rest.api(ENDPOINTS.API, 'users')
                  .mock(require('user.json')), 0, mock_controller).get([{id:100}]),
             };

              user:User;
              
             }
```
Use it:
		
```ts
    giveMeSampleUsers() {
    
 		this.rest.api(ENDPOINTS.API, 'users')
		 .query() // 
		 .subscribe((users) => {  // Type of respone wil be User[] 
            console.log('users', users);
        })
        
     }
```


API
-------
Optionally object parameters in methods below are created by encodeURIComponent(JSON.stringif(params)) so **in your backend** 
you need to use function **decodeURIComponent(params) **  to get ids, params from passed url. You don't need to do that in mock controlelrs.

```ts
interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp;
    regex?: RegExp; // internal validation for query params
};

//  [ {  name: 'Dariusz' , regex: /.{255}/g }, { surname: 'Filipiak' }  ]
// it wil generate:
// ?name=Dariusz&regex=.\{255\}&surname=Filipiak

```

| Name | Parameters  | Description | Example | 
| :---: | --- | --- | ---: |
| **query** | `(optional) UrlParams[] ` |  fetch array of your models, optionally with parameters | `getModels()`, `getSortedModels([{sort:true}])` |
| **get** | `UrlParams[] ` |   get model by parameters  | `getUser([{ id: 1 }])`, `getSomeModel([{  color : 'blue' }])` |
| **save** | `model, UrlParams[] ` |   post object model | `saveUser({ name: 'Dario', age: 26 })`  |
| **update** | `model, UrlParams[]` |   put object model | `updateUser(object, [{ id: 1 }])`, `updateUsers([ ... ]. [{  color : 'blue' },  {  banned: true  }] )` |
| **remove** | `UrlParams[]` |   remove object by params | `removeUser([{ id: 1 }])`, `removeModels( [{  color : 'blue'  }])` |
| **jsonp (alpha ver.)** | `(optional) UrlParams[]` |   get jsonp data, optionally with parameters | `getDataFromOtherServer()` |



Mock controller
-------

It is one of the best features here. You don't need a backend for your front-end stuff ! 

 - first argument is data from passed to function **.mock( here, ..., .. )**
 - second arguments are params from 
 - to create error request return undefined or nothing
 - use console.log | console.error | console.info to debug your backend or [ng2-logger](https://github.com/darekf77/ng2-logger)
 - do not use exceptions

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
		
		let user = request.data;
		user.id = request.params.id;
		return { data:user }; 
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


MockAutoBackend
-------

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


