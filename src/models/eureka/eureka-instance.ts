import { EurekaInstanceStatus } from './eureka-instance-status';

export interface EurekaInstance {
    EurekaInstanceStatus: EurekaInstanceStatus;
    instanceId: string;
    app: string;
};