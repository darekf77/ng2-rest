import * as _ from 'lodash';

export function getClassFromObject(o: Object) {
  const p = Object.getPrototypeOf(o)
  return p && p.constructor;
}

export function walkObject(obj: Object, callBackFn: (lodashPath: string, isPrefixed: boolean) => void, lodashPath = '') {
  lodashPath = (lodashPath === '') ? `` : `${lodashPath}.`;
  Object.keys(obj).forEach(key => {
    const contactedPath = `${lodashPath}${key}`
    callBackFn(contactedPath, key.startsWith('$'))
    const v = obj[key];
    const isObject = _.isObject(v)
    const isArray = _.isArray(v)
    if (isObject) {
      walkObject(v, callBackFn, contactedPath)
    } else if (isArray) {
      (v as Array<any>).forEach((elem, i) => {
        walkObject(elem, callBackFn, `${lodashPath}${key}[${i}]`)
      })
    }
  })
}
