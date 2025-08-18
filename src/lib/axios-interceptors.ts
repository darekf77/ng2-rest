import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type express from 'express';
import { firstValueFrom, from, Observable } from 'rxjs';

export interface AxiosTaonHttpHandler<T = any> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>>;
}

export interface TaonClientMiddlewareInterceptOptions<T = any> {
  req: AxiosRequestConfig; // <- request config only (no AxiosResponse here)
  next: AxiosTaonHttpHandler<T>;
}

export interface TaonServerMiddlewareInterceptOptions<T = any> {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
}

export interface TaonAxiosClientInterceptor<T = any> {
  intercept(
    client: TaonClientMiddlewareInterceptOptions<T>,
  ): Observable<AxiosResponse<T>>;
}

// Optional helper for passing around context (browser/client)

// === Backend handler (last in chain) ===
export class AxiosBackendHandler<T = any> implements AxiosTaonHttpHandler<T> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    // axios returns a Promise; wrap as Observable
    return from(axios.request<T>(req));
  }
}

// === Chain builder (request: forward order, response: reverse order) ===
export const buildInterceptorChain = <T = any>(
  interceptors: Array<TaonAxiosClientInterceptor<T>>,
  backend: AxiosTaonHttpHandler<T>,
): AxiosTaonHttpHandler<T> => {
  return interceptors.reduceRight<AxiosTaonHttpHandler<T>>(
    (next, interceptor) => ({
      handle: req => interceptor.intercept({ req, next }),
    }),
    backend,
  );
};
