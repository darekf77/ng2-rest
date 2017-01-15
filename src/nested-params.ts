import { diffChars } from 'diff';


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
        let m = pattern.match(new RegExp('[a-zA-Z]*\/:', 'g'));
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
            // console.log('word', word)
            let iii = url.indexOf(word);
            // console.log('iii', iii)
            if (iii + word.length < url.length && url.charAt(iii + word.length) !== '/') {
                return false;
            }
            if (iii !== -1) {
                url = url.replace(new RegExp('\/' + m, 'g'), '');
                return true;
            }
            return false;
        }).length;
        // console.log('containsModels', res);
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
        // console.log('models', models);
        models.forEach(m => {
            pattern = pattern.replace(`:${m}`, stars(m.length));
        })

        let currentModel: string = undefined;
        diffChars(pattern, url).forEach(d => {
            // console.log('d', d);
            if (d.added) {
                if (!isNaN(Number(d.value))) res[currentModel] = Number(d.value);
                else if (d.value.trim() === 'true') res[currentModel] = true;
                else if (d.value.trim() === 'false') res[currentModel] = false;
                else res[currentModel] = decodeURIComponent(d.value);
                currentModel = undefined;
            }
            let m = d.value.replace(':', "");
            // console.log('model m', m)
            if (d.removed) {
                currentModel = models.shift();
            }
        });
        return res;
    }

    export function interpolateParamsToUrl(params: Object, url: string): string {
        let itHasSlash = false;
        if (url.charAt(url.length - 1) !== '/') {
            url = `${url}/`;
            itHasSlash = true;
        }
        for (let p in params) {
            if (params.hasOwnProperty(p)) {
                let v = params[p];
                url = url.replace(new RegExp(`:${p}/`, 'g'), `${v}/`)
            }
        }
        return itHasSlash ? url.slice(0, url.length - 1) : url;
    }

}