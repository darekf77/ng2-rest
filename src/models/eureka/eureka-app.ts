import { EurekaInstance } from './eureka-instance';

export interface EurekaApp {
    list: EurekaInstance[];
    name: string;
}