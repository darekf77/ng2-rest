import { Helpers } from './helpers';
import { Resource } from 'ng2-rest';
import { Morphi } from 'morphi';


const host = 'http://localhost:3000'
const start = async () => {
  if(Morphi.IsBrowser) {
    const rest = Resource.create(host, '/test');
    console.log('hello');
    await rest.model().get();
  }
}

export default start;

//#region @notForNpm
if (Helpers.isBrowser) {
  start()
}
//#endregion
