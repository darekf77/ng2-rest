//#region imports
import * as os from 'os'; // @backend

import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  mergeApplicationConfig,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'; // @browser
import { Component } from '@angular/core'; // @browser
import { OnInit } from '@angular/core'; // @browser
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideRouter,
  RouterModule,
  Routes,
  withHashLocation,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { RenderMode, ServerRoute } from '@angular/ssr';
import Aura from '@primeng/themes/aura'; // @browser
import { providePrimeNG } from 'primeng/config'; // @browser
import { Taon, TAON_CONTEXT, TaonContext } from 'taon/src';

import { HOST_CONFIG } from './app.hosts';
import { ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER } from './lib/env/env.angular-node-app';
import { Resource } from 'ng2-rest/src';
import { CLASS } from 'typescript-class-helpers/src';
import {
  decodeMapping,
  decodeMappingForHeaderJson,
  DefaultModelWithMapping,
  encodeMapping,
} from './lib/new-mapping';
// @placeholder-for-imports
//#endregion

//#region constants
const firstHostConfig = (Object.values(HOST_CONFIG) || [])[0];
console.log('Your backend host ' + firstHostConfig?.host);
console.log('Your frontend host ' + firstHostConfig?.frontendHost);
//#endregion

//#region ng2-rest component
//#region @browser
@Component({
  selector: 'app-root',

  imports: [RouterModule],
  template: `
    <h1>Check your console log</h1>
    <router-outlet />
  `,
})
export class Ng2RestApp implements OnInit {
  itemsLoaded = signal(false);

  ngOnInit(): void {
    Taon.removeLoader().then(() => {
      this.itemsLoaded.set(true);
    });
  }
}
//#endregion

//#endregion

//#region ng2-rest routes
//#region @browser
export const Ng2RestServerRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
export const Ng2RestClientRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      if (Ng2RestClientRoutes.length === 1) {
        return '';
      }
      return Ng2RestClientRoutes.find(r => r.path !== '')!.path!;
    },
  },
  // PUT ALL ROUTES HERE
  // @placeholder-for-routes
];
//#endregion
//#endregion

//#region ng2-rest app configs
//#region @browser
export const Ng2RestAppConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => Ng2RestStartFunction,
    },
    provideBrowserGlobalErrorListeners(),
    // remove withHashLocation() to use SSR
    provideRouter(Ng2RestClientRoutes, withHashLocation()),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled:
        !isDevMode() && !ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

export const Ng2RestServerConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(Ng2RestServerRoutes))],
};

export const Ng2RestConfig = mergeApplicationConfig(
  Ng2RestAppConfig,
  Ng2RestServerConfig,
);
//#endregion
//#endregion

//#region ng2-rest context
var Ng2RestContext = Taon.createContext(() => ({
  ...HOST_CONFIG['Ng2RestContext'],
  contexts: {},
  disabledRealtime: true,
}));
//#endregion

class Book {}

@DefaultModelWithMapping<User>({ name: 'testName' }, { books: [Book] })
class User {
  declare name: string;
  declare books: Book[];
}

// @CLASS.NAME('EntityData')
class EntityData {
  declare color: string;

  declare capacity: string;
}

// @CLASS.NAME('Entity')
class Entity {
  declare id: number;

  declare name: string;
}

//#region ng2-rest start function
export const Ng2RestStartFunction = async (
  startParams?: Taon.StartParams,
): Promise<void> => {
  await Ng2RestContext.initialize();

  // const arrRest = Resource.create('https://api.restful-api.dev', '/objects', {
  //   responseMapping: {
  //     // entity: () => ({
  //     //   '': Entity,
  //     //   data: EntityData,
  //     // }),
  //     entity: {
  //       '': Entity,
  //       data: EntityData,
  //     },
  //   },
  // });

  // const data = await arrRest.model().get();
  // console.log(data.body.json);

  // class User {
  //   declare name: string;

  //   declare firend: User;

  //   declare relatives: User[];
  // }

  // const user1 = { name: 'figot' } as Partial<User>;
  // const user2 = { name: 'fagot' } as Partial<User>;
  // const user3 = { name: 'donald' } as Partial<User>;

  // const rawData = {
  //   name: 'wiesiek',
  //   // firend: user1,
  //   // relatives: [user2, user3],
  // } as Partial<User>;

  // const rawDataEntioty = encodeMapping(
  //   rawData,
  //   {
  //     '': User,
  //     firend: User,
  //     relatives: [User],
  //   },
  //   [
  //     {
  //       circuralTargetPath: '',
  //       pathToObj: 'friend',
  //     },
  //   ],
  // );
  // console.log({ rawDataEntioty });

  const raw = {
    books: [{ id: 1 }, { id: 2 }],
  };

  const mapping = decodeMapping(User);
  console.log({mapping})
  const user = encodeMapping<User>(raw, mapping);

  const forHeader = decodeMappingForHeaderJson(User);
  console.log({forHeader});
  console.log(user instanceof User); // true
  console.log(user.name); // "testName"
  console.log(user.books[0] instanceof Book); // true

  //#region initialize auto generated active contexts
  const autoGeneratedActiveContextsForApp: TaonContext[] = [
    // @placeholder-for-contexts-init
  ];

  const priorityContexts = [
    // put here manual priority for contexts if needed
  ];

  const activeContextsForApp: TaonContext[] = [
    ...priorityContexts,
    ...autoGeneratedActiveContextsForApp.filter(
      c => !priorityContexts.includes(c),
    ),
  ];

  for (const activeContext of activeContextsForApp) {
    await activeContext.initialize();
  }
  //#endregion

  //#region @backend
  if (
    startParams?.onlyMigrationRun ||
    startParams?.onlyMigrationRevertToTimestamp
  ) {
    process.exit(0);
  }
  //#endregion

  //#region @backend
  console.log(`Hello in NodeJs backend! os=${os.platform()}`);
  //#endregion
};
//#endregion

//#region default export
export default Ng2RestStartFunction;
//#endregion
