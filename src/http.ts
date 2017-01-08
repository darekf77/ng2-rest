export namespace Http {

    /**
     * 
     * 1xx Informational
     * This class of status code indicates a provisional response, 
     * consisting only of the Status-Line and optional headers, 
     * and is terminated by an empty line.
     * 
     * 2xx SUCCESS
     * This class of status codes indicates the action requested by 
     * the client was received, understood, accepted, and processed successfully.
     * 
     * 3xx REDIRECTION
     * This class of status code indicates the client must take additional
     * action to complete the request. Many of these status codes are used 
     * in URL redirection.
     * 
     * 4xx CLIENT ERROR
     * The 4xx class of status code is intended for situations in which 
     * the client seems to have erred.
     * 
     * 5xx SERVER ERROR
     * The server failed to fulfill an apparently valid request.
     * 
     */
    export type HttpCode = 200 | 400 | 404 | 500;
    export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'JSONP';

}