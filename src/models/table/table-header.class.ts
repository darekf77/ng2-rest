import { SortTypeE } from './sort-type';

export class TableHeader {
    sort: SortTypeE = SortTypeE.__NONE;
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    sortBy() {
        switch (this.sort) {
            case SortTypeE.__NONE:
                this.sort = SortTypeE.ASC;
                break;
            case SortTypeE.ASC:
                this.sort = SortTypeE.DESC;
                break;
            case SortTypeE.DESC:
                this.sort = SortTypeE.__NONE;
                break;
            default:
                console.error('BAD SORT SECIFICATION');
        }
    };

}
