import { Resource } from './resource.service';
import { MockController, MockAutoBackend } from './models';
import { JsonpModule } from '@angular/http';

export const NG2REST_PROVIDERS = [Resource, JsonpModule];
