
// import * as _ from "lodash";

// export abstract class ModelWrap {
//     constructor(data?: Object, insideModelsMapping?: Mapping[]) {

//         // prepare model
//         if (Array.isArray(insideModelsMapping) && insideModelsMapping.length > 0 && data != undefined) {
//             for (var i = 0; i < insideModelsMapping.length; i++) {
//                 let m = insideModelsMapping[i];
//                 let o = _.get(data, m.path);
//                 if (!o) continue;
//                 if (Array.isArray(o)) {
//                     for (let k = 0; k < (o as any[]).length; k++) {
//                         o[k] = new m.class(o[k]);
//                     }
//                 } else {
//                     _.set(data, m.path, new m.class(o))
//                 }
//             }
//         }
//         this.__insideModelsMapping = insideModelsMapping;
//         this.__data = data;
//     }
//     private __insideModelsMapping?: Mapping[]
//     private __data: Object;
//     protected get data() {
//         return !this.__data ? {} : this.__data;
//     }

//     public clone() {

//     }

//     public raw() {
//         let data = JSON.parse(JSON.stringify(this.__data));

//         // prepare raw data
//         if (Array.isArray(this.__insideModelsMapping) && this.__insideModelsMapping.length > 0 && data != undefined) {
//             for (var i = 0; i < this.__insideModelsMapping.length; i++) {
//                 let m = this.__insideModelsMapping[i];
//                 let o = _.get(data, m.path);
//                 let oi = _.get(this.__data, m.path);
//                 // log.i('path', m.path)
//                 // log.i('class', m.class)
//                 // log.i('data', data)
//                 if (!o) continue;
//                 if (Array.isArray(o)) {
//                     // log.i('is array')
//                     for (let k = 0; k < (o as any[]).length; k++) {
//                         o[k] = (oi[k] as ModelWrap).raw();
//                     }
//                 } else {
//                     // log.i('is object')
//                     _.set(data, m.path, (oi as ModelWrap).raw());
//                 }
//                 // log.i('transformed', data)
//             }
//         }
//         return data;
//     }

// }

export interface Mapping {
    [path: string]: Function;
}
