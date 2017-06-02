## ng2-rest ##

Compatible with Angular JS/2/4 and other frameworks

Simple, efficient REST api with **Angular or other frameworks**. 
Best way connect your webapp with RESTfull backend or JSONP api.

[Plunker demo](http://embed.plnkr.co/mFhAiV/)

To install package run:

    npm install ng2-rest --save

Import Resource class:
```ts
import { Resource } from 'ng2-rest';
```

If you are Angular 2 or 4 user do this:
```ts
constructor(zone:NgZone) {
    Resource.initNgZone(zone)
}
```


Resource
========

Fit you existing API (not only REST) into new fluent objects with **Resource**  class observables. Use power of **async** in new angular 4 templates;

**template.html**  
```html
Users:
<ul   *ngIf="model.users | async; else loader; let users" >

  <li  *ngFor="let user of users"> {{user.id}} - {{user.name}} </li>

</ul>

<ng-template #loader> loading users...  </ng-template>

```
**component.ts**
```ts
// express.js style url endpoint model
const rest = Resource.create("http://yourbackend.com/api","users/:id")

class UserComponent {

    model = {
        users: rest.model().query()
    }

    constructor(private zone: NgZone) {
        Resource.initNgZone(zone) // int require for 
    }

}
```
SimpleResource
--------
Note: From version 7.1.0 **SimpleResource** has changed and if you are still using it
consider to build your promises api like this  `getMyElements().take(1).toPromies();`



Specification
-------------
Example **UrlParams[]** :
 `[ { sort: true },{ filter: 'id,5' }, { filter: 'name,test' } ]` 
| Name | Parameters  | Description |
| :---: | --- | ---: |
| **query** | `UrlParams[] ` |  fetch array of your models, optionally with parameters |
| **get** | `UrlParams[] ` |   get model by parameters  |
| **save** | `model, UrlParams[] ` |   post object model  |
| **update** | `model, UrlParams[]` |   put object model |
| **remove** | `UrlParams[]` |   remove object by params |
| **jsonp** | `UrlParams[]` |   get jsonp data |


Simple data mocking
============

You don't need a backend for your front-end coding. 
Ng2-rest it is the simplest way to mocking data:

```ts

	let users_mock = ` [ 
		{ "name": "Bob from mockable.io", "id": 1 }, 
		{ "name": "Alice from mockable.io", "id": 2 } 
		]`;

	// service.ts
	...
	getUsers = () => rest.model()
		.mock( users_mock ).
		query()

	// if you finish you app, you can easily comment mock function
	// and use real data
	getUsers = () => rest.model()
		// .mock( users_mock ).
		query()


	// component.ts
	...
	service.getUsers().subscribe( users => {
		console.log( 'users:', users );
	}
```
 

Mock Controller
===============

 Sample MockController function to return mocked data based on params
```ts
import {MockRequest,MockResponse } from 'ng2-rest'

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
		return { data:user }; 
		// return nothing or undefined to propagate error
    }
	
	
	// service.ts
	import { mockController } from './mock-controller';
	...
	data = (id) => rest.model()
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

With **ng2-rest** you can also easily access you response and request headers
```ts
	// Resource
	console.log( Resource.Headers.request  );
	console.log( Resource.Headers.response  );
	console.log( Resource.Headers.response.get('X-Total-Count')  );
	
	Resource.Headers.request.set('Content-type','application/json')
	Resource.Headers.request.set('Authorization','Bearer 189aasda7d8ashd87ahs8da8s7d')
	Resource.Headers.response.get('X-Total-Count')


```

Production mode
---------------
Nice things to do in production mode:

**1. Disable warnings.**

If you don't wanna see warning, disable it like this:
```ts
if (environment.production) {
  Resource.enableWarnings = false;
}
```
**2. Do not use mock data.**
To prevent application from using mock do this:
```ts
Resource.mockingMode.setBackendOnly()
```
