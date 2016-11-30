
export function genNumber(limit: number): number {
    return Math.floor(Math.random() * (limit - 0 + 1)) + 0;
}

export function isArray(o: any) {
    return (o instanceof Array);
}

export function isObject(o: any) {
    return typeof o === 'object' && !isArray(o)
}


export function goInside(o: Object, paths: string[]): Object {
    // console.log(`pathes`, pathes);
    // console.log(`o`, o);
    if (paths.length === 0) return o;
    let tmp = o;
    paths.forEach(path => {
        if (tmp[path] === undefined) tmp[path] = {};
        tmp = tmp[path];
        // console.log(`upper for path:${path}`, o);
    });
    // console.log(`tmp`, tmp);
    return tmp;
}

export function isSimpleType(value) {
    return ((typeof value === 'number') ||
        (typeof value === 'boolean') ||
        (typeof value === 'string') ||
        (typeof value === 'undefined'));
}

export let pName = p => {
    return p.startsWith('$') ? p.slice(1) : p;
};

export function copyFromTo(fromObj: Object, toObj: Object) {
    for (let p in fromObj) {
        if (fromObj.hasOwnProperty(p)) {

            toObj[p] = fromObj[p];
        }
    }
    for (let p in toObj) {
        if (toObj.hasOwnProperty(p)) {
            // console.log('p', p);
            if (p.charAt(0) === '$') delete toObj[p];
        }
    }
}


