import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { Log, Level } from 'ng2-logger';
const log = Log.create('eureka', Level.__NOTHING)

import { Helpers } from './helpers';
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";

export namespace Eureka {

    const EurekaWaitTimeout = 500;

    export class Eureka<T, TA> {

        protected subjectInstanceFounded: Subject<EurekaInstance>
        = new Subject<EurekaInstance>();
        onInstance = this.subjectInstanceFounded.asObservable();

        private _instance: EurekaInstance;
        public get instance(): EurekaInstance {
            return this._instance;
        }
        private headers: RestHeaders;
        private _state: EurekaState = EurekaState.DISABLED;
        public isWaiting() {
            return (this.state === EurekaState.CHECKING_INSTANCE)
                || (this.state === EurekaState.WAITING_FOR_INSTANCES);
        }
        public get state() {
            return this._state;
        }
        private app: EurekaApp;
        private request: RestRequest;

        constructor(private config: EurekaConfig) {
            this.headers = new RestHeaders();
            this.headers.append('Content-Type', 'application/json');
            this.headers.append('Accept', 'application/json');
        }

        private eurekaInstancesResolver(list: EurekaInstance[]) {

            if (list.length === 1) {
                this._instance = JSON.parse(JSON.stringify(list[0]));
            } else {
                let randomInstance = Helpers.getRandomInt(list.length - 1)
                this._instance = JSON.parse(JSON.stringify(list[randomInstance]));
            }
            this.subjectInstanceFounded.next(this._instance);
            setTimeout(() => {
                this._state = EurekaState.ENABLE;
            });

        }

        public discovery(request: RestRequest) {
            this.onInstance.subscribe(() => {
                console.info('instance resolved !');
            });
            this.request = request;
            this._state = EurekaState.WAITING_FOR_INSTANCES;
            log.i('start JOURNE!!!')
            this.request.get(`${this.config.serviceUrl}/${this.config.decoderName}`,
                this.headers)
                .subscribe(r => {
                    let data = r.json();
                    let res: EurekaApp = data['application'];
                    if (!res.instance || !res.instance.length || res.instance.length === 0) {
                        this._state = EurekaState.SERVER_ERROR;
                        console.error(`Eureka instaces not found on address: ${this.config.serviceUrl}/${this.config.decoderName} `);
                        return;
                    }
                    this.eurekaInstancesResolver(res.instance.filter(e => e.EurekaInstanceStatus === 'up'));
                }, () => {
                    this._state = EurekaState.SERVER_ERROR;
                    console.error(`Eureka server not available address: ${this.config.serviceUrl}/${this.config.decoderName} `);
                    return;
                });
        }

    }



    export interface EurekaApp {
        instance: EurekaInstance[];
        name: string;
    }

    export interface EurekaConfig {
        serviceUrl: string;
        decoderName: string;
        // shouldUseDns: boolean;
        // preferSameZone: boolean;
    };

    export interface EurekaInstance {
        EurekaInstanceStatus: EurekaInstanceStatus;
        instanceId: string;
        app: string;
    };
    export type EurekaInstanceStatus = 'up' | 'down';

    export enum EurekaState {
        DISABLED,
        WAITING_FOR_INSTANCES,
        CHECKING_INSTANCE,
        ENABLE,
        SERVER_ERROR
    }

}