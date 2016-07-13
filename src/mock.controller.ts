import { MockAutoBackend } from './mock-auto-backend.class';
export interface MockController<T> {
    (data: any, params: any, backend?: MockAutoBackend<T>): Object
}
