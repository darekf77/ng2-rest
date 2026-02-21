
## ng2-rest ##

Robust isomorphic REST framework
- for browser (Angular, React etc.) 
- for backend Taon apps/libs (NodeJS/TypeScript) 
(part of [taon.dev](https://github.com/darekf77/taon)).

Features:
- Compatible with Angular (2+) (newest 13,14 also...) , React, Vue , NodeJS (works everywhere)
- Compatible with RxJS operators (exhaustMap, switchMap, request cancelation etc.)
- Based on [axios](https://axios-http.com/) => excellent alternative to  Angular's [HttpClient](https://angular.io/api/common/http/HttpClient)
- JSONP api request handling
- Transfer class instance from server to client and back
- Elegant way of dealing with REST api ( *similar to ExpressJS routes definitions* )

(more documentation soon... )

To install this package run:

    npm install ng2-rest --save

Import Resource class:
```ts
import { Resource } from 'ng2-rest/browser';
```

Resource
========

Fit you existing API (not only REST) into new fluent objects with **Resource** 
 class observables. Use power of **async** in new angular templates;

**template.html**  
```html
Users:
<ul   *ngIf="model.allUsers() | async; else loader; let users" >

  <li  *ngFor="let user of users"> 
  		{{user.id}} {{user.fullName()}} 
		  <br>
		<input type="name" [(NgModel)]="user.name" >
		<button (click)="model.update(user)" > Update </button>
  </li>

</ul>

<ng-template #loader> loading users...  </ng-template>

```
**component.ts**
```ts
class User {
	name: string;
	surname: string;
	id: number;

	fullName() {
		return `Surname: ${this.surname}, Name: ${this.name}`;
	}
}

// Express.js style url endpoint model
// you can ommit "<User>" part is you don't wanna see response interface
// also you can ommit third argument ",User" is you don't wanna
// map response object to User class objects
const rest = Resource.create<User>("http://yourbackend.com/api","users/:id",{'':User} )

class UserComponent {

   // Prepare your beautiful interface
    model = {
	 allUsers: () => rest.model()
		 .array
		 .get()
		 .observable // Observable resposnse (useful for Angular 2+ html templates)
     .pipe( map({ body } => body.json) ) // get all users, body.json => User[] 

	 userBy: (id) => rest.model({id})
		 .get() // Promise response by default
		 .then({ body } => console.log(body.json)) // get user by id,  body.json => User

	 update: async (user:User) =>{
		 try {
			await rest.model({id:user.id}).put(user) // Promise response by default

			alert('Update sucess')
		 } catch(e) {
			alert(e)
		 }	
	 	}
    }

	constructor() { }

}
```

Specification
============
Example **UrlParams[]** :
 `[ { sort: true },{ filter: 'id,5' }, { filter: 'name,test' } ]` 
 
 
| Name | Parameters  | Description |
| :---: | --- | ---: |
| **array** |  changes response type to array |
| **get** | `model, UrlParams[] ` |   get data  |
| **post** | `model, UrlParams[] ` |  create data  |
| **patch** | `model, UrlParams[] ` | change data <br>(effect of changing data may be diffrent with each request)  |
| **put** | `model, UrlParams[]` |   change data <br>(can be done multiple times with same effect) |
| **head** | `model, UrlParams[]` |   check data  |
| **delete** | `model, UrlParams[] ` |   remove data |
| **jsonp** | `model, UrlParams[] ` |   get jsonp data |



# Production mode
===
Nice things to do in production mode:

**1. Disable warnings.**

If you don't wanna see warning, disable it like this:
```ts
if (environment.production) {
  Resource.enableWarnings = false;
}
```


