import { HttpMethod } from './http-method';
import { DocExample } from './doc-example';

export interface DocModel {
    url: string;
    fileName: string;
    name: string;
    group: string;
    description: string;
    body: string;
    params: string;
    usecase: string;
    method: HttpMethod;
    examples: DocExample[];
}

