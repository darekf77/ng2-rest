import * as _ from 'lodash';

import { Helpers as HelpersLogger } from 'ng2-logger';
import { describeFromClassStringify, describeByDefaultModelsAndMapping } from './describe-class';
import { CLASS } from 'typescript-class-helpers'

import { Models } from 'typescript-class-helpers/models'
import { Mapping } from './mapping';
import { JSON10 } from 'json10';

export class Helpers extends HelpersLogger {

  static JSON = JSON10;

  static Class = CLASS;

  static get Mapping() {
    return {
      encode<T = Function>(json: Object, mapping: Mapping.Mapping): T {
        return Mapping.encode(json, mapping);
      },
      decode(json: Object, options?: Mapping.MapingDecodeOptions): Mapping.Mapping {
        return Mapping.decode(json, options)
      }
    }
  }

  static checkValidUrl(url: string): boolean {
    let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(url);
  }



}

