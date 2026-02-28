import { Component } from '@angular/core';
import * as io from 'socket.io-client';

const port = ENV.workspace.projects.find(p => p.name === 'ng2-rest-server').port;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  constructor() {

    const global = io(`http://localhost:${port}`);

    global.on('connect', () => {
      console.log('conented to namespace /')
      global.emit('room', 'build')
      global.on('hello', (msg) => {
        console.log(`room message from namespace / `, msg)
      })
    });

    function subsciberBuild(namespace, buildId) {
      namespace.emit('roomSubscribe', `build${buildId}`)
      namespace.on(`updatebuild${buildId}`, (msg) => {
        console.log(`build ${buildId} updated `, msg)
      })
    }

    function unsubscribeBuild(namespace, buildId) {
      namespace.emit('roomUnsubscribe', `build${buildId}`)
      namespace.on(`unsubscribedRoom`, (msg) => {
        console.log(`unsubscribed from room ${buildId} `, msg)
      })
    }

    const testowa = io(`http://localhost:${port}/testowa`)
    testowa.on('connect', () => {
      console.log('conented to namespace /testowa')

      subsciberBuild(testowa, 12)

      subsciberBuild(testowa, 13)

      setTimeout(() => {
        unsubscribeBuild(testowa, 12)
        unsubscribeBuild(testowa, 13)
      }, 4000)

    });




  }

}
