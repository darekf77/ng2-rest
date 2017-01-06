export interface Header {
    [headerName: string]: string;
}

export interface HttpHeaders<T, TA> {
    addOrReplace: (header: Header, forever?: boolean) => void;
    remove: (key: string, forever?: boolean) => void;
}

