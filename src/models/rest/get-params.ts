import { UrlParams } from './url-params';

export function getParamsUrl(params: UrlParams[]): string {
    let urlparts: string[] = [];

    params.forEach(urlparam => {
        let parameters: string[] = [];
        let paramObject = <Object>urlparam;

        for (let p in paramObject) {

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
                urlparam[p] = encodeURIComponent(urlparam[p].toString());
                if (urlparam.regex !== undefined && urlparam.regex instanceof RegExp) {
                    if (!urlparam.regex.test(urlparam[p].toString())) {
                        console.warn(`Data: ${urlparam[p].toString()} incostistent with regex ${urlparam.regex.source}`);
                    }
                }
                parameters.push(`${p}=${urlparam[p].toString()}`);
            }

        }

        urlparts.push(parameters.join('&'));
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

