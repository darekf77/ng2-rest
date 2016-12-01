
export interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp | Object;
    regex?: RegExp;
}[];

