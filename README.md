## ng2-rest ##

Compatible with Angular JS/2/4 and ReactJS

Simple, efficient REST api with **Angular or React**. 
Best way connectapplication with RESTfull backend or JSONP api.

[Plunker ReactJS demo](https://embed.plnkr.co/TDD0Pl/)

[Plunker Angular4 demo](https://embed.plnkr.co/gqygXk/)

[Demo github](https://darekf77.github.io/ng2-rest)

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

Fit you existing API (not only REST) into new fluent objects with **Resource**  class an observables. Use power of **async** in new angular 4 templates;

**template.html**
```html
User books:
<ul *ngIf="model.books | async; else loader; let books">

  <li *ngFor="let book of books  "> {{book.title}} </li>

</ul>

<ng-template #loader> loading user books...  </ng-template>

```
**component.ts**
```ts
// express.js style url endpoint model
const rest = Resource.create("http://localhost:/api","users/:id/books/:bookid")

class BooksComponent { 

	// create your fluent API
	model = {
		books : getAllUserBooks: ()=> rest.model({ id:1  }).query()
	}
	
}
```
SimpleResource
--------
Note: From version 7.1.0 **SimpleResource** has changed and if you are still using it
consider to build your promises api like this  `getMyElements().take(1).toPromies();`



Specification
-------------

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

It is one of the best features here. You don't need a backend for your front-end coding. 

 Simplest way to mocking data:
```ts
	// user.json
	[{ id: 12, name: 'Dariusz' },
	{ id: 15, name: 'Marcin' }]


	// service.ts
	...
	getUsers = () => rest.model()
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

 Sample MockController function to return mocked data based on params:
```ts
import {MockRequest,MockResponse } from 'ng2-rest

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
	
	// SimpleResource
	console.log(SimpleResource.headers.request);
	console.log(SimpleResource.headers.response);
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