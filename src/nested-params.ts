import { diffChars } from 'diff';

import { Log, Level } from 'ng2-logger';
const log = Log.create('nested params', Level.__NOTHING)

export namespace UrlNestedParams {

    interface NestedParams {
        [params: string]: string;
    }

    export function checkValidUrl(url: string): boolean {
        let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        return regex.test(url);
    }

    /** check if string is a valid pattern */
    export function isValid(pattern: string) {
        return (new RegExp('\/:[a-zA-Z]*', 'g')).test(pattern.replace('://', ''));
    }

    export function check(url: string, pattern: string): boolean {
        if (!checkValidUrl(url)) {
            console.error(`Incorrect url: ${url}`);
            return false;
        }
        if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 2);
        if (pattern.charAt(pattern.length - 1) === '/') pattern = pattern.slice(0, url.length - 2);
        pattern = pattern.replace(/\//g, '\/');
        pattern = pattern.replace(new RegExp('\/:[a-zA-Z]*', 'g'), '.+');
        let reg = new RegExp(pattern, 'g');
        return reg.test(url);
    }

    export function getModels(pattern: string): string[] {
        let m = pattern.match(new RegExp('[a-z-A-Z]*\/:', 'g'));
        return m.map(p => p.replace('/:', ''));
    }

    export function getRestPramsNames(pattern: string): string[] {
        if (pattern.charAt(pattern.length - 1) !== '/') pattern = `${pattern}/`;
        let m = pattern.match(new RegExp(':[a-zA-Z]*\/', 'g'));
        let res = m.map(p => p.replace(':', '').replace('/', ''));
        return res.filter(p => p.trim() !== '');
    }

    export function containsModels(url: string, models: string[]): boolean {
        if (url.charAt(0) !== '/') url = '/' + url;
        // url = url.replace(new RegExp('\/', 'g'), '');
        let res = models.filter(m => {
            let word = '/' + m;
            log.d('word', word)
            let iii = url.indexOf(word);
            log.d('iii', iii)
            if (iii + word.length < url.length && url.charAt(iii + word.length) !== '/') {
                return false;
            }
            if (iii !== -1) {
                url = url.replace(new RegExp('\/' + m, 'g'), '');
                return true;
            }
            return false;
        }).length;
        log.d('containsModels', res);
        return res === models.length;
    }

    export function stars(n: number): string {
        let res = '';
        for (let i = 0; i < n; i++) res += '*';
        return res;
    }

    export function getRestParams(url: string, pattern: string): Object {
        let res = {};
        let models = getRestPramsNames(pattern);
        log.d('models', models);
        models.forEach(m => {
            pattern = pattern.replace(`:${m}`, stars(m.length));
        })

        let currentModel: string = undefined;
        diffChars(pattern, url).forEach(d => {
            log.d('d', d);
            if (d.added) {
                if (!isNaN(Number(d.value))) res[currentModel] = Number(d.value);
                else if (d.value.trim() === 'true') res[currentModel] = true;
                else if (d.value.trim() === 'false') res[currentModel] = false;
                else res[currentModel] = decodeURIComponent(d.value);
                currentModel = undefined;
            }
            let m = d.value.replace(':', "");
            log.d('model m', m)
            if (d.removed) {
                currentModel = models.shift();
            }
        });
        return res;
    }


    /**
     * Models like books/:id
     */
    function cutUrlModel(params: Object, models: string[], output: string[]) {
        if (models.length === 0) return output.join('\/');
        let m = models.pop();
        let param = m.match(/:[a-zA-Z0-9]+/)[0].replace(':', '');
        let model = m.match(/[a-zA-Z0-9]+\//)[0].replace('\/', '');
        if (params === undefined || params[param] === undefined || param === 'undefined') {
            output.length = 0;
            output.unshift(model)
            return cutUrlModel(params, models, output);
        } else {
            let mrep = m.replace(new RegExp(`:${param}`, 'g'), `${params[param]}`)
            output.unshift(mrep)
            return cutUrlModel(params, models, output);
        }
    }

    export function interpolateParamsToUrl(params: Object, url: string): string {

        let slash = {
            start: url.charAt(0) === '\/',
            end: url.charAt(url.length - 1) === '\/'
        }

        let morePramsOnEnd = url.match(/(\/:[a-zA-Z0-9]+){2,10}/g);
        if (morePramsOnEnd && (Array.isArray(morePramsOnEnd) && morePramsOnEnd.length === 1)) {
            // log.i('morePramsOnEnd', morePramsOnEnd)
            let m = morePramsOnEnd[0];
            let match = m.match(/\/:[a-zA-Z0-9]+/g);
            // log.i('match', match)
            match.forEach(e => {
                let c = e.replace('\/:', '');
                url = url.replace(e, `/${params[c]}`)
                // log.i('c', c)
                // log.i('prog url', url)
            })
            return url;
        }

        let nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9]+/g);
        if (!nestedParams || (Array.isArray(nestedParams) && nestedParams.length === 0)) return url;

        // check alone params
        if (!slash.end) url = `${url}/`;
        let addUndefinedForAlone = (!/:[a-zA-Z0-9]+\/$/g.test(url) && /[a-zA-Z0-9]+\/$/g.test(url));

        let replace = (nestedParams.length > 1 ? nestedParams.join('\/') : nestedParams[0]) +
            (addUndefinedForAlone ? '\/' + url.match(/[a-zA-Z0-9]+\/$/g)[0] : '\/');
        let beginHref = url.replace(replace, '')

        if (addUndefinedForAlone) {
            url = url.replace(/\/$/g, '/:undefined')
            nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9]+/g);
            url = cutUrlModel(params, nestedParams, [])
        } else {
            url = cutUrlModel(params, nestedParams, [])
        }
        url = beginHref + url;

        if (url.charAt(url.length - 1) !== '/' && slash.end) url = `${url}/`;
        if (url.charAt(0) !== '\/' && slash.start) url = `/${url}`;

        return url;
    }

}