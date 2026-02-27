import { Circ, JSON10 } from 'json10/src';
import { walk } from 'lodash-walk-object/src';
import { _ } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';

interface MappingStore {
  defaults?: () => ModelValue<any>;
  mapping?: () => EncodeSchema<any>;
}

const mappingStore = new WeakMap<Function, MappingStore>();

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ModelValue<T> =
  | DeepPartial<T>
  | Partial<Record<MappingFrom<T>, any>>;

type Constructor<T = any> = new (...args: any[]) => T;

type MappingFrom<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : T[K] extends Array<infer U>
      ? K | `${K}.${MappingFrom<U>}`
      : K | `${K}.${MappingFrom<T[K]>}`;
}[keyof T & string];

export type EncodeSchema<T = any> = {
  ''?: Constructor<T>;
} & {
  [K in MappingFrom<T>]?: Constructor<any> | [Constructor<any>];
};

export type EncodeSchemaString<T = any> = {
  ''?: string;
} & {
  [K in MappingFrom<T>]?: string;
};

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date
  | Function;

//#region default model with mapping decorator
export function DefaultModelWithMapping<T>(
  defaults?: () => ModelValue<T>,
  mapping?: () => EncodeSchema<T>,
) {
  return function (target: Constructor<T>) {
    mappingStore.set(target, {
      defaults,
      mapping,
    });
  };
}
//#endregion

//#region decode mapping (may container Entites classes)
export function decodeMapping<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchema<T> | undefined {
  const cls =
    typeof instanceOrClass === 'function'
      ? instanceOrClass
      : (instanceOrClass as any).constructor;

  return mappingStore.get(cls)?.mapping() as any;
}
//#endregion

//#region get default value for class
export function getDefaultValue<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchema<T> | undefined {
  const cls =
    typeof instanceOrClass === 'function'
      ? instanceOrClass
      : (instanceOrClass as any).constructor;

  return mappingStore.get(cls)?.defaults() as any;
}
//#endregion

//#region decode mapping (replace entites with names)
export function decodeMappingForHeaderJson<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchemaString<T> | undefined {
  const mappingObj = {};
  const mapping = decodeMapping(instanceOrClass);
  walk.Object(
    mapping,
    (v, lodahsPath) => {
      let classFn: { name: string };
      if (Array.isArray(v) && v.length === 1) {
        classFn = _.first(v);
      } else if (typeof v === 'function') {
        classFn = v;
      }
      if (classFn) {
        const className = CLASS.getName(classFn as any);
        _.set(mappingObj, lodahsPath, className);
      }
    },
    {
      walkGetters: false,
    },
  );

  return mappingObj;
}
//#endregion

//#region encode mapping from mapping schema and circular metadata
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
  schema: EncodeSchema<T> | EncodeSchemaString<T>,
  circular: Circ[],
  parentPath: string = '',
): T => {
  if (Array.isArray(input)) {
    return input.map(item =>
      encodeMappingFn(item, schema, circular, parentPath),
    ) as any;
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  const RootClass = (
    _.isString(schema['']) ? CLASS.getBy(schema['']) : schema['']
  ) as Constructor;

  const instance = RootClass ? new RootClass() : {};

  for (const key of Object.keys(input)) {
    const value = input[key];

    const fullPath = parentPath ? `${parentPath}.${key}` : key;

    const rule = schema[fullPath];

    if (!rule) {
      instance[key] = encodeMappingFn(value, schema, circular, fullPath);
      continue;
    }

    // Array rule
    if (Array.isArray(rule)) {
      const ItemClass =
        typeof rule[0] === 'string' ? CLASS.getBy(rule[0]) : rule[0];

      instance[key] = Array.isArray(value)
        ? value.map(v =>
            encodeMappingFn(v, { '': ItemClass }, circular, fullPath),
          )
        : [];

      continue;
    }

    // Object rule
    const NestedClass = typeof rule === 'string' ? CLASS.getBy(rule) : rule;

    instance[key] = encodeMappingFn(
      value,
      { '': NestedClass },
      circular,
      fullPath,
    );
  }

  return instance;
};

//#endregion

//#region example

// class Author { name: string; } class Book { fat: boolean; authro: Author } class User { age: number; book: Book; }

// type Schem = MappingFrom<User>;

// const aa: EncodeSchemaString<User> = {
//   '': 'asdsad',
//   'book.authro.name':
// }

//#endregion
