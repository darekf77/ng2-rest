import { HttpMethod } from './http-method';
import { DocExample } from './doc-example';

export interface DocModel extends DocExample {
    url: string;
    fileName: string;
    name: string;
    group: string;
    description: string;
    examples: DocExample[];
}

