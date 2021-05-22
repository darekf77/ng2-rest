import { _ } from 'tnp-core';
import { Helpers as HelpersLogger } from 'ng2-logger';
import { Mapping } from './mapping';
import { JSON10 } from 'json10';

export class Helpers extends HelpersLogger {

  static JSON = JSON10;

  static get Mapping() {
    return {
      encode<T = Function>(json: Object, mapping: Mapping.Mapping): T {
        return Mapping.encode(json, mapping);
      },
      decode(json: Object, autodetect = false ): Mapping.Mapping {
        return Mapping.decode(json, autodetect)
      }
    }
  }

  static checkValidUrl(url: string): boolean {
    let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(url);
  }



}
