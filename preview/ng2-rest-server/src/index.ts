
import { Resource } from 'ng2-rest';
//#region @backend
import * as express from 'express';
import * as http from 'http';
import * as io from 'socket.io';
const cors = require('cors')
//#endregion

const port = 3000;

const rest = Resource.create(`http://localhost:${port}`, 'users');
export async function start() {

  //#region @backend
  const app = express()

  const h = new http.Server(app)



  let global = io(h)
  global.on('connection', (clientSocket) => {
    console.log('connection from client namespace /')

    clientSocket.on('room', room => {
      console.log(`Joining room ${room} in namespace / `)
      clientSocket.join(room);
      global.sockets.in(room).emit('hello', 'heelo fellows')

    })

    clientSocket.on('disconnect', () => {
      console.log('client disconnected from / ')
    })

  })


  function notifyBUild(buildId) {
    testowa.in(`build${buildId}`).emit(`updatebuild${buildId}`, `updated buld ${buildId} !`)
  }

  const testowa = global.of('/testowa')
  testowa.on('connection', (clientSocket) => {
    console.log('connection from client namespace /testowa')

    clientSocket.on('roomSubscribe', room => {
      console.log(`Joining room ${room} in namespace /testowa `)
      clientSocket.join(room);
    })

    clientSocket.on('roomUnsubscribe', room => {
      console.log(`Leaving room ${room} in namespace /testowa `)
      clientSocket.leave(room);
    })

    setTimeout(() => {
      notifyBUild(12)
      notifyBUild(13)
    }, 2000)

    clientSocket.on('disconnect', () => {
      console.log('client disconnected from /testowa')
    })
  });



  app.use(cors())

  const exampleProjects = [
    { super: 1 }
  ];


  app.get('/projects', (req, res, next) => {
    res.send(exampleProjects)
  })

  app.get('/users', (req, res) => {
    res.json([{ "name": "Bob from mockable.io", "id": 1 }, { "name": "Alice from mockable.io", "id": 2 }])
  })

  h.listen(port, async () => {
    console.log('Example app listening on port 3000!')
    console.log('test')
    try {
      const resp = await rest.model({
        test: 11
      }).array.get()
      console.log(JSON.stringify(resp.headers.toJSON()));
      console.log(JSON.stringify(resp.body.json))
    } catch (error) {
      console.log(error)
    }
  })
  //#endregion

}
