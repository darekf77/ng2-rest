
export interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp;
    regex?: RegExp;
}[];

