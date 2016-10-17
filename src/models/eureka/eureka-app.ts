import { EurekaInstance } from './eureka-instance';

export interface EurekaApp {
    instance: EurekaInstance[];
    name: string;
}