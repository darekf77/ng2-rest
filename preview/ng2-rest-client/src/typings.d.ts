import { Models } from 'tnp-models/browser';
export type EnvConfig = Models.env.EnvConfig;

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