import { MockAutoBackend } from './mock-auto-backend.class';
import { HttpCode } from '../http';
import { MockResponse } from './mock-response';
import { MockRequest } from './mock-request';

/**
 * Function is used to simulate backend contrller.
 * Very useful is you wanna mock different
 * usecases in your application ie.
 * for E2E test purpose
 * 
 * @export
 * @interface MockController
 * @template T
 */
export interface MockController<T> {
    (request: MockRequest<T>): MockResponse
};

