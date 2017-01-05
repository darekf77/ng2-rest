import { checkValidUrl } from './check-url';

interface NestedParams {
    [params: string]: string;
}

export class UrlNestedParams {

    /** check if string is a valid pattern */
    static isValid(pattern: string) {
        console.log('papttern', pattern)
        return (new RegExp('\/:[a-zA-Z]*', 'g')).test(pattern.replace('://', ''));
    }

    static check(url: string, pattern: string): boolean {
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

    static getModels(pattern: string): string[] {
        let m = pattern.match(new RegExp('[a-zA-Z]*\/:', 'g'));
        return m.map(p => p.replace('/:', ''));
    }

    static containsModels(url: string, models: string[]): boolean {
        if (url.charAt(0) !== '/') url = '/' + url;
        // url = url.replace(new RegExp('\/', 'g'), '');
        let res = models.filter(m => {
            console.log(`url: ${url}  m `, m)
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

}