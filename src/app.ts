
import { isNode, isBrowser } from 'ng2-logger';

//#region @backend
import * as http from 'http';
//#endregion


export default function () {

  //#region @backend
  if (isNode) {

    http.createServer(function (request, response) {
      response.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      response.write('Simple Simple Fun')
      response.end();
    })
      .listen(5000, () => {
        console.log('server is listening')
      });
  }
  //#endregion

}

if (isBrowser) {

  console.log('heloo in the app!!!')

}
