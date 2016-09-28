import { Page } from './page';
import { TableHeader } from './table-header.class';

export class TableConfig {
    page: Page;
    headers: TableHeader[];

    public static serialize = (config: TableConfig) => encodeURIComponent(JSON.stringify(config));
    public static deserialize = (url: string): TableConfig => JSON.parse(decodeURIComponent(url));

    constructor(headers: TableHeader[]) {
        this.page = <Page>{};
        this.page.number = 1;
        this.page.numOfRows = 10;
        this.page.totalElements = 100;
        this.headers = headers;
    }
}
