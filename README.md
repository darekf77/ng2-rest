## ng2-rest ##

Compatible with Angular JS/2/4 and other frameworks

Simple, efficient REST api with **Angular or other frameworks**. 


Nice way to connect your webapp with RESTfull backend or JSONP api.

[Plunker demo](http://embed.plnkr.co/mFhAiV/)

To install package run:

    npm install ng2-rest --save

Import Resource class:
```ts
import { Resource } from 'ng2-rest';
```

Resource
========

Fit you existing API (not only REST) into new fluent objects with **Resource**  class observables. Use power of **async** in new angular templates;

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
const rest = Resource.create<User>("http://yourbackend.com/api","users/:id", User)

class UserComponent {

   // Prepare your beautiful interface
    model = {
	 allUsers: () => rest.model()
		 .array
		 .get()
		 .map({ body } => body.json)  , // get all users, body.json => User[] 

	 userBy: (id) => rest.model({id})
		 .get()
		 .map({ body } => body.json) // get user by id,  body.json => User

	 update: async (user:User) =>{
		 try {
			rest.model({id:user.id})
			.put(user)
			.toPromise()

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
| **.array.** | get,post,put,delete,jsonp |  for everything, but with arrays |
| **get** | `UrlParams[] ` |   get model by parameters  |
| **post** | `model, UrlParams[] ` |   post object model  |
| **put** | `model, UrlParams[]` |   put object model |
| **delete** | `UrlParams[]` |   remove object by params |
| **jsonp** | `UrlParams[]` |   get jsonp data |



Production mode
===
Nice things to do in production mode:

**1. Disable warnings.**

If you don't wanna see warning, disable it like this:
```ts
if (environment.production) {
  Resource.enableWarnings = false;
}
```