/**
 * Based on Headers from https://github.com/angular/angular/blob/master/packages/http/src/headers.ts
 */
export class RestHeaders {
  /** @internal header names are lower case */
  _headers: Map<string, string[]> = new Map();
  /** @internal map lower case names to actual names */
  _normalizedNames: Map<string, string> = new Map();

  // TODO(vicb): any -> string|string[]
  constructor(headers?: RestHeaders | { [name: string]: any } | any, recreate = false) {
    if (!headers) {
      return;
    }

    if (headers instanceof RestHeaders) {
      headers.forEach((values: string[], name: string) => {
        values.forEach(value => this.append(name, value));
      });
      return;
    }

    if (recreate) {
      this._headers = headers._headers;
      this._normalizedNames = headers._normalizedNames;
      return;
    }

    Object.keys(headers).forEach((name: string) => {
      const values: string[] = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
      this.delete(name);
      values.forEach(value => this.append(name, value));
    });
  }

  /**
   * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders
   */
  static fromResponseHeaderString(headersString: string): RestHeaders {
    const headers = new RestHeaders();

    headersString.split('\n').forEach(line => {
      const index = line.indexOf(':');
      if (index > 0) {
        const name = line.slice(0, index);
        const value = line.slice(index + 1).trim();
        headers.set(name, value);
      }
    });

    return headers;
  }

  /**
   * Appends a header to existing list of header values for a given header name.
   */
  append(name: string, value: string): void {
    const values = this.getAll(name);

    if (values === null) {
      this.set(name, value);
    } else {
      values.push(value);
    }
  }

  /**
   * Deletes all header values for the given name.
   */
  delete(name: string): void {
    const lcName = name.toLowerCase();
    this._normalizedNames.delete(lcName);
    this._headers.delete(lcName);
  }

  forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void {
    this._headers.forEach(
      (values, lcName) => fn(values, this._normalizedNames.get(lcName), this._headers));
  }

  /**
   * Returns first header that matches given name.
   */
  get(name: string): string {
    const values = this.getAll(name);

    if (values === null) {
      return null;
    }

    return values.length > 0 ? values[0] : null;
  }

  /**
   * Checks for existence of header by given name.
   */
  has(name: string): boolean { return this._headers.has(name.toLowerCase()); }

  /**
   * Returns the names of the headers
   */
  keys(): string[] { return Array.from(this._normalizedNames.values()); }

  /**
   * Sets or overrides header value for given name.
   */
  set(name: string, value: string | string[]): void {
    if (Array.isArray(value)) {
      if (value.length) {
        this._headers.set(name.toLowerCase(), [value.join(',')]);
      }
    } else {
      this._headers.set(name.toLowerCase(), [value]);
    }
    this.mayBeSetNormalizedName(name);
  }

  /**
   * Returns values of all headers.
   */
  values(): string[][] { return Array.from(this._headers.values()); }

  /**
   * Returns string of all headers.
   */
  // TODO(vicb): returns {[name: string]: string[]}
  toJSON(): { [name: string]: any } {
    const serialized: { [name: string]: string[] } = {};

    this._headers.forEach((values: string[], name: string) => {
      const split: string[] = [];
      values.forEach(v => split.push(...v.split(',')));
      serialized[this._normalizedNames.get(name)] = split;
    });

    return serialized;
  }

  /**
   * Returns list of header values for a given name.
   */
  getAll(name: string): string[] {
    return this.has(name) ? this._headers.get(name.toLowerCase()) : null;
  }

  private mayBeSetNormalizedName(name: string): void {
    const lcName = name.toLowerCase();

    if (!this._normalizedNames.has(lcName)) {
      this._normalizedNames.set(lcName, name);
    }
  }
}

