import { HttpMethod } from './http-method';
import { DocExample } from './doc-example';
import { FormInputBind } from '../contracts';

export interface DocModel extends DocExample {
    url: string;
    fileName: string;
    name: string;
    group: string;
    description: string;
    examples: DocExample[];
    baseURL: string;
    form: FormInputBind[];
}

