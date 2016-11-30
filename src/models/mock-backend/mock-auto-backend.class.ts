let faker = require('faker');
faker.locale = 'pl';

import {
    goInside, isArray, isObject, isSimpleType, pName,
    copyFromTo, genNumber
} from './helpers-mock-backend';

import { SortModel } from './sort-model';



export class MockAutoBackend<T> {

    models: T[];

    constructor(template: Object, howManyGen: number) {
        this.models = [];
        for (let i = 0; i < howManyGen; i++) {
            let model: T = <T>{};
            this.construct(template, model);
            this.models.push(model);
            // console.log(model);
        }
    }

    /**
     * Create data for pagination from models<T>
     * 
     * @param {number} page
     * @param {number} pageSize
     * @returns {T[]}
     * 
     * @memberOf MockAutoBackend
     */
    getPagination(page: number, pageSize: number): T[] {
        let indexStart = (page - 1) * pageSize;
        let indexEnd = indexStart + pageSize;
        let d = this.models.slice(indexStart, indexEnd);
        return d;
    }

    filterBy(modelKeys: Object) {
        let filterd = [];
        for (let p in modelKeys) {
            if (modelKeys.hasOwnProperty(p)) {
                filterd.concat(this.models
                    .filter(m => modelKeys[p] === m[p]));
            }
        }
        return filterd;
    }

    updateModelsBy(modelKeys: Object, model: T): T[] {
        let models: T[] = this.filterBy(modelKeys);
        models.forEach(m => {
            m = model;
        });
        return models;
    }

    deleteModelBy(modelKeys: Object, model: T): T[] {
        let models: T[] = this.filterBy(modelKeys);
        let deletedModes = JSON.parse(JSON.stringify(models));
        let indexesToDelete = [];
        models.forEach(m => {
            indexesToDelete.push(this.models.indexOf(m, 0));
        });
        indexesToDelete.forEach(index => {
            if (index > -1) {
                this.models.splice(index, 1);
            }
        });
        return models;
    }

    addModelBy(newKeys: Object, model: T): T {
        this.models.push(model);
        for (let p in newKeys) {
            if (newKeys.hasOwnProperty(p)) {
                model[p] = newKeys[p];
            }
        }
        return model;
    }

    sortBy(params: SortModel[]): T[] {
        let models: T[] = JSON.parse(JSON.stringify(this.models));
        params.forEach(s => {
            models = models.sort((a, b) => {
                if (s.type === 'DESC') {
                    if (a[s.field] < b[s.field])
                        return -1;
                    if (a[s.field] > b[s.field])
                        return 1;
                } else if (s.type === 'ASC') {
                    if (a[s.field] < b[s.field])
                        return 1;
                    if (a[s.field] > b[s.field])
                        return -1;
                }
                return 0;
            });
        });
        return models;
    }


    static goInside = goInside;


    /**
     * generate values.
     * if property name starts with '$' and is of type:
     *  array - pick one from value array
     *  string - assume it is [faker.js mustache string]{@link https://github.com/marak/Faker.js/#fakerfake} and try to fill it
     *
     * @param template json template object
     * @param cModel model to modify
     * @param path for recursive calls
     */
    construct(template: Object, cModel: T, path: string[] = []) {
        let tmpModel: T;
        for (let p in template) {
            if (template.hasOwnProperty(p)) {

                let value = template[p];
                if (isArray(value) && p.startsWith('$')) {
                    let arr: any[] = value;
                    arr.forEach(elem => {
                        if (!isArray(elem) && !isSimpleType(elem)) {
                            let t: T = <T>{};
                            this.construct(elem, t);
                            copyFromTo(t, elem);

                        }
                    });
                    let g = genNumber(arr.length - 1);
                    goInside(cModel, path)[pName(p)] = arr[g];
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }


                if (p.startsWith('$') && 'string' === typeof value) {
                    let val: any = undefined;
                    try {
                        val = faker.fake(value);
                    } catch (e) {
                        console.error(e);
                    }
                    goInside(cModel, path)[pName(p)] = val;
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }

                if (isObject(value) || isArray(value)) {
                    let joinedPath = path.concat(pName(p));
                    this.construct(value, cModel, joinedPath);
                    continue;
                }

                if (isSimpleType(value) || p.startsWith('$')) {
                    goInside(cModel, path)[pName(p)] = value;
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }

                throw new Error('bad type of object: ' + value);
            }
        }
    }


}
