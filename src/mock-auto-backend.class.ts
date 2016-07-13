function genNumber(limit: number): number {
    return Math.floor(Math.random() * (limit - 0 + 1)) + 0;
}

function isArray(o: any) {
    return (o instanceof Array);
}

function isObject(o: any) {
    return typeof o === 'object' && !isArray(o)
}


function goInside(o: Object, pathes: string[]): Object {
    // console.log(`pathes`, pathes);
    // console.log(`o`, o);
    if (pathes.length === 0) return o;
    let tmp = o;
    pathes.forEach(path => {
        if (tmp[path] === undefined) tmp[path] = {};
        tmp = tmp[path];
        // console.log(`upper for path:${path}`, o);
    });
    // console.log(`tmp`, tmp);
    return tmp;
}

function cut$(p: string) {
    return p.substring(1, p.length);
}

export enum SortType {
    'ASC',
    'DESC'
}
export interface SortModel {
    field: string;
    type?: SortType;
}

export class MockAutoBackend<T> {

    models: T[];
    constructor(template: Object, howManyGen: number) {
        this.models = [];
        for (let i = 0; i < howManyGen; i++) {
            let model: T = <T>{};
            this.construct(template, model);
            this.models.push(model)
            console.log(model);
        }
    }

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
                if (s.type === SortType.DESC) {
                    if (a[s.field] < b[s.field])
                        return -1;
                    if (a[s.field] > b[s.field])
                        return 1;
                } else if (s.type === SortType.DESC) {
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

    construct(o: Object, cModel: T, path: string[] = []) {
        let tmpModel: T;
        for (let p in o) {
            if (o.hasOwnProperty(p)) {

                let value = o[p];
                // console.log('value', value);
                if ((p.charAt(0) === '$')) {
                    goInside(cModel, path)[cut$(p)] = value;
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }
                if ((typeof value === 'number') ||
                    (typeof value === 'boolean') ||
                    (typeof value === 'string') ||
                    (typeof value === 'undefined')
                ) {
                    goInside(cModel, path)[p] = value;
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }


                if (isObject(value)) {
                    let joinedPath = path.concat(p);
                    this.construct(value, cModel, joinedPath);
                    continue;
                }
                if (isArray(value)) {
                    let arr: any[] = value;
                    arr.forEach(elem => {
                        if (isObject(elem) && !isArray(elem)) {
                            let t: T = <T>{};
                            elem = this.construct(elem, t);
                            elem = t;
                        }
                    });
                    let g = genNumber(arr.length - 1);
                    // console.log('index g', g);
                    goInside(cModel, path)[p] = arr[g];
                    tmpModel = JSON.parse(JSON.stringify(cModel));
                    continue;
                }
                throw new Error('bad type of object: ' + value);
            }
        }
        return JSON.parse(JSON.stringify(tmpModel));
    }




}
