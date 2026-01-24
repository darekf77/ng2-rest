import { _ } from 'tnp-core/src';

import { Mapping } from './mapping';
export namespace Helpers {
  export const getMapping = () => {
    return {
      encode<T = Function>(json: Object, mapping: Mapping.Mapping): T {
        return Mapping.encode(json, mapping);
      },
      decode(json: Object, autodetect = false): Mapping.Mapping {
        return Mapping.decode(json, autodetect);
      },
    };
  };
  export const checkValidUrl = (url: string): boolean => {
    let regex =
      /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(url);
  };
}
