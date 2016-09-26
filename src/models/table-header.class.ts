import { SortType } from './sort-type';

export class TableHeader {
    sort: SortType = SortType.__NONE;
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    sortBy() {
        switch (this.sort) {
            case SortType.__NONE:
                this.sort = SortType.ASC;
                break;
            case SortType.ASC:
                this.sort = SortType.DESC;
                break;
            case SortType.DESC:
                this.sort = SortType.__NONE;
                break;
            default:
                console.error('BAD SORT SECIFICATION');
        }
    };

}
