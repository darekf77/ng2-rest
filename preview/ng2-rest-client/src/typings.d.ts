import { EnvConfig } from 'tnp-bundle/browser';

declare global {
    const ENV: EnvConfig;
}

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}