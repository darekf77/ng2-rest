import { TableConfig } from './table-config.class';

interface ArrayResponse<T> {
    content: T[];
    config: TableConfig;
}
