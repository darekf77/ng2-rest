import { HttpMethod } from '../http';
import { FormInputBind } from '../contracts';
import { HttpCode } from '../http';


export interface RequestData {
    headers: Object;
    bodySend: string;
    bodyRecieve: string;
    urlParams: string;
    url: string;
    status: HttpCode;
    method: HttpMethod;
    urlFull: string;
}

export interface RequestMetaData {
    fileName: string;
    usecase: string;
    name: string;
    group: string;
    description: string;
}

export interface DocsServerSide {
    examples: DocModel[];    
    baseURLDocsServer: string;
}

export interface DocModel extends RequestData, RequestMetaData, DocsServerSide {    
    form: FormInputBind[];
    contract: string;
}

