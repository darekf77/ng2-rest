import { Component } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  constructor() {

    const global = io('http://localhost:3000')

    global.on('connect', () => {
      console.log('conented to namespace /')
      global.emit('room', 'build')
      global.on('hello', (msg) => {
        console.log(`room message from namespace / `, msg)
      })
    });


    const testowa = io('http://localhost:3000/testowa')
    testowa.on('connect', () => {
      console.log('conented to namespace /testowa')

      testowa.emit('room', 'build')
      testowa.on('hello', (msg) => {
        console.log(`room message from namespace /testowa `, msg)
      })

    });




  }

}
