import { NgModule } from '@angular/core';
import { Resource } from './resource.service';
import { JsonpModule, HttpModule } from '@angular/http';
import { SimpleResource } from './simple-resource';

@NgModule({
    imports: [JsonpModule, HttpModule],
    exports: [],
    declarations: [],
    providers: [Resource],
})
export class Ng2RestModule { }
