import { UrlParams } from './url-params';

/**
 * Create query params string for url
 * 
 * @export
 * @param {UrlParams[]} params
 * @returns {string}
 */
export function getParamsUrl(params: UrlParams[]): string {
    let urlparts: string[] = [];
    if (!params) return '';
    if (!(params instanceof Array)) return '';
    if (params.length === 0) return '';

    params.forEach(urlparam => {
        // console.log(`Object.keys(urlparam) ${JSON.stringify(urlparam)}`, Object.keys(urlparam).length);
        if (JSON.stringify(urlparam) !== '{}') {

            let parameters: string[] = [];
            let paramObject = <Object>urlparam;


            for (let p in paramObject) {
                if (paramObject[p] === undefined) delete paramObject[p];
                if (paramObject.hasOwnProperty(p) && typeof p === 'string' && p !== 'regex' && !(paramObject[p] instanceof RegExp)) {
                    if (p.length > 0 && p[0] === '/') {
                        let newName = p.slice(1, p.length - 1);
                        urlparam[newName] = urlparam[p];
                        urlparam[p] = undefined;
                        p = newName;
                    }
                    if (p.length > 0 && p[p.length - 1] === '/') {
                        let newName = p.slice(0, p.length - 2);
                        urlparam[newName] = urlparam[p];
                        urlparam[p] = undefined;
                        p = newName;
                    }
                    let v: any = urlparam[p];
                    if (v instanceof Object) {
                        urlparam[p] = JSON.stringify(urlparam[p]);
                    }
                    urlparam[p] = encodeURIComponent(<string>urlparam[p]);
                    if (urlparam.regex !== undefined && urlparam.regex instanceof RegExp) {

                        if (!urlparam.regex.test(<string>urlparam[p])) {
                            console.warn(`Data: ${urlparam[p]} incostistent with regex ${urlparam.regex.source}`);
                        }
                    }
                    parameters.push(`${p}=${urlparam[p]}`);
                }

            }

            urlparts.push(parameters.join('&'));


        }


    });
    let join = urlparts.join().trim();
    if (join.trim() === '') return '';
    return `?${urlparts.join('&')}`;
}


function transform(o) {
    if (typeof o === 'object') {
        return encodeURIComponent(JSON.stringify(o));
    }
    return o;
}


export function prepareUrlOldWay(params?: TemplateStringsArray): string {
    if (!params) return this.endpoint;
    if (typeof params === 'object') {
        params = transform(params);
    }
    return this.endpoint + '/' + params;
}

