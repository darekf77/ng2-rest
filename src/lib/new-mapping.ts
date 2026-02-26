import { Circ, JSON10 } from 'json10/src';
import { walk } from 'lodash-walk-object/src';
import { _ } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';

const mappingStore = new WeakMap<
  Function,
  {
    defaults?: any;
    mapping?: EncodeSchema<any>;
  }
>();

export type ModelValue<T> = {
  /**
   * Inside models types
   */
  [propName in keyof T]?: T[propName];
};

type Constructor<T = any> = new (...args: any[]) => T;

export function DefaultModelWithMapping<T>(
  defaultModelValues?: ModelValue<T>,
  mapping?: EncodeSchema<T>,
) {
  return function (target: Constructor<T>) {
    mappingStore.set(target, {
      defaults: defaultModelValues,
      mapping,
    });
  };
}

export function decodeMapping<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchema<T> | undefined {
  const cls =
    typeof instanceOrClass === 'function'
      ? instanceOrClass
      : (instanceOrClass as any).constructor;

  return mappingStore.get(cls)?.mapping as any;
}

export function decodeMappingForHeaderJson<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchemaString<T> | undefined {
  const mappingObj = {};
  const mapping = decodeMapping(instanceOrClass);
  walk.Object(mapping, (v, lodahsPath) => {
    let classFn: {name:string};
    if(Array.isArray(v) && v.length === 1) {
      classFn = _.first(v);
    } else if (typeof v === 'function') {
      classFn = v;
    }
    if(classFn) {
      const className = CLASS.getName(classFn as any);
      _.set(mappingObj, lodahsPath, className);
    }
  },{
    walkGetters: false
  });

  return mappingObj;
}

export type EncodeSchema<T = any> = {
  ''?: Constructor<T>;
} & {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? [Constructor<U>]
    : T[K] extends object
      ? Constructor<T[K]>
      : never;
};

export type EncodeSchemaString<T = any> = {
  ''?: string;
} & {
  [K in keyof T]?: string;
};

export const encodeMapping = <T>(
  input: any,
  schema: EncodeSchema | EncodeSchemaString,
  circular: Circ[] = [],
): T => {
  const mapped = encodeMappingFn<{}>(input, schema, circular);
  JSON10.applyCircularMapping(mapped, circular);
  return mapped as any;
};

const encodeMappingFn = <T>(
  input: any,
  schema: EncodeSchema | EncodeSchemaString,
  circular: Circ[],
): T => {
  if (Array.isArray(input)) {
    return input.map(item => encodeMapping(item, schema, circular)) as any;
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  // const entityClass = CLASS.getFromObject(input);
  // const mappingFromDecorator  = decodeMapping(entityClass);


  const RootClass = (
    _.isString(schema['']) ? CLASS.getBy(schema['']) : schema['']
  ) as Constructor;

  const instance = RootClass ? new RootClass() : {};

  for (const key of Object.keys(input)) {
    const value = input[key];
    const rule = schema[key];

    if (!rule) {
      instance[key] = value;
      continue;
    }

    // Nested array
    if (Array.isArray(rule)) {
      const ItemClass = rule[0];
      instance[key] = Array.isArray(value)
        ? value.map(v => encodeMapping(v, { '': ItemClass }, circular))
        : [];
      continue;
    }

    // Nested object
    instance[key] = encodeMapping(value, { '': rule } as any, circular);
  }

  return instance;
};
