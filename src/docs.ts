import { Http } from './http';

export namespace Docs {


    export interface DocGroup {
        files: DocModel[];
        name: string;
    }


    export interface RequestData {
        headers: Object;
        bodySend: string;
        bodyRecieve: string;
        urlParams: string;
        restQueryParams: string;
        url: string;
        status: Http.HttpCode;
        method: Http.HttpMethod;
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
        // form: Contracts.FormInputBind[];
        // contract: string;
    }


}