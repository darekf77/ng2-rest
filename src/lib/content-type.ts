import { RestHeaders } from "./rest-headers";


export const CONTENT_TYPE = {
  APPLICATION_JSON: RestHeaders.from({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }),
  APPLICATINO_VND_API_JSON: RestHeaders.from({
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json'
  }),
}
