import { HttpMethod } from './http-method';

export interface DocExample {
    bodySend: string;
    bodyRecieve: string;
    urlParams: string;
    usecase: string;
    method: HttpMethod;
}
