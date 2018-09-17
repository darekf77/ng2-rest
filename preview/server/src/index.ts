import { Resource } from 'ng2-rest';
import * as express from "express";
import * as http from 'http';
import * as io from 'socket.io';

const cors = require('cors')
const port = 3000;

const rest = Resource.create(`http://localhost:${port}`, 'users');
export async function start() {

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


  const testowa = global.of('/testowa')
  testowa.on('connection', (clientSocket) => {
    console.log('connection from client namespace /testowa')

    clientSocket.on('room', room => {
      console.log(`Joining room ${room} in namespace /testowa `)
      clientSocket.join(room);
      testowa.in(room).emit('hello', 'heelo testowa!')

    })

    clientSocket.on('disconnect', () => {
      console.log('client disconnected from /testowa')
    })
  });



  app.use(cors())

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



}
start();
