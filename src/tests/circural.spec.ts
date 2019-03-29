

import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'
import { Log } from 'ng2-logger';
const log = Log.create('Circural test');

// import { BrowserDB } from '../browser-db/browser-db';

import { Mapping } from '../mapping'
import { CLASS } from 'typescript-class-helpers';


@CLASS.NAME('Project')
export class Project {

  browser: {
    name: string;
    location: string;
    children: Project[];
    parent: Project;
  }

  get children() {
    return this.browser && this.browser.children;
  }

  get parent() {
    return this.browser && this.browser.parent;
  }
  get name() {
    return this.browser && this.browser.name;
  }

  get location() {
    return this.browser && this.browser.location;
  }

}


describe('Circural and mapping', () => {

  it('Should map very deeeeep', () => {

    const json = data();
    const circs = circural();
    const mapping = mappingData()
    // console.log(mapping)
    const res: Project[] = Mapping.encode(json, mapping, circs);
    // log.i('continaer', res[10])
    expect(res[0]).to.be.instanceOf(Project)

    expect(res[10]).to.be.instanceOf(Project)
    expect(res[10].name).to.be.eq('container')

    // expect(res[10].children[0].children[0].location).to.be.eq('/Users/npm/tsc-npm-project/projects/container/baseline/ss-admin-webapp')
    expect(res[10].children[0].children[0]).to.be.instanceOf(Project)
    expect(res[10].children[0].children[1]).to.be.instanceOf(Project)
    expect(res[10].children[0].children[0].name).to.be.eq('ss-admin-webapp')


  });


});



//#region mapping
function mappingData() {
  return {
    "": "Project",
    "packageJson": "PackageJSON",
    "browser.children": [
      "Project"
    ],
    "browser.children.browser.childeren": [
      "Project"
    ],
    "browser.children.browser.childeren.browser.childeren": [
      "Project"
    ],
    "browser.parent": "Project",
    "browser.parent.browser.parent": "Project",
    "browser.baseline": "Project",
    "browser.baseline.browser.baseline": "Project",
    "browser.preview": "Project",
    "browser.preview.browser.preview": "Project"
  }
}
//#endregion

//#region circ
function circural() {
  return [
    {
      "pathToObj": "[1].browser.parent",
      "circuralTargetPath": "[0]"
    },
    {
      "pathToObj": "[2].browser.parent",
      "circuralTargetPath": "[1]"
    },
    {
      "pathToObj": "[3].browser.parent",
      "circuralTargetPath": "[0]"
    },
    {
      "pathToObj": "[7].browser.parent",
      "circuralTargetPath": "[6]"
    },
    {
      "pathToObj": "[8].browser.parent",
      "circuralTargetPath": "[6]"
    },
    {
      "pathToObj": "[9].browser.parent",
      "circuralTargetPath": "[6]"
    },
    {
      "pathToObj": "[11].browser.parent",
      "circuralTargetPath": "[10]"
    },
    {
      "pathToObj": "[12].browser.parent",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[13].browser.parent",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[14].browser.parent",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[15].browser.parent",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[16].browser.parent",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[17].browser.parent",
      "circuralTargetPath": "[10]"
    },
    {
      "pathToObj": "[18].browser.parent",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[19].browser.parent",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[20].browser.parent",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[21].browser.parent",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[22].browser.parent",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[24].browser.parent",
      "circuralTargetPath": "[23]"
    },
    {
      "pathToObj": "[0].browser.children[0]",
      "circuralTargetPath": "[1]"
    },
    {
      "pathToObj": "[0].browser.children[1]",
      "circuralTargetPath": "[3]"
    },
    {
      "pathToObj": "[1].browser.children[0]",
      "circuralTargetPath": "[2]"
    },
    {
      "pathToObj": "[5].browser.children[0]",
      "circuralTargetPath": "[6]"
    },
    {
      "pathToObj": "[6].browser.children[0]",
      "circuralTargetPath": "[7]"
    },
    {
      "pathToObj": "[6].browser.children[1]",
      "circuralTargetPath": "[8]"
    },
    {
      "pathToObj": "[6].browser.children[2]",
      "circuralTargetPath": "[9]"
    },
    {
      "pathToObj": "[10].browser.children[0]",
      "circuralTargetPath": "[11]"
    },
    {
      "pathToObj": "[10].browser.children[1]",
      "circuralTargetPath": "[17]"
    },
    {
      "pathToObj": "[11].browser.children[0]",
      "circuralTargetPath": "[12]"
    },
    {
      "pathToObj": "[11].browser.children[1]",
      "circuralTargetPath": "[13]"
    },
    {
      "pathToObj": "[11].browser.children[2]",
      "circuralTargetPath": "[14]"
    },
    {
      "pathToObj": "[11].browser.children[3]",
      "circuralTargetPath": "[15]"
    },
    {
      "pathToObj": "[11].browser.children[4]",
      "circuralTargetPath": "[16]"
    },
    {
      "pathToObj": "[17].browser.children[0]",
      "circuralTargetPath": "[18]"
    },
    {
      "pathToObj": "[17].browser.children[1]",
      "circuralTargetPath": "[19]"
    },
    {
      "pathToObj": "[17].browser.children[2]",
      "circuralTargetPath": "[20]"
    },
    {
      "pathToObj": "[17].browser.children[3]",
      "circuralTargetPath": "[21]"
    },
    {
      "pathToObj": "[17].browser.children[4]",
      "circuralTargetPath": "[22]"
    },
    {
      "pathToObj": "[23].browser.children[0]",
      "circuralTargetPath": "[24]"
    }
  ]
}
//#endregion

//#region data
function data() {
  return [
    {
      "browser": {
        "children": [
          null,
          null
        ],
        "name": "morphi",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/morphi"
    },
    {
      "browser": {
        "children": [
          null
        ],
        "parent": null,
        "name": "workspace",
        "isWorkspace": true,
        "isCloud": true
      },
      "location": "/Users/npm/morphi/examples"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "isomorphic-lib",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/morphi/examples/isomorphic-lib"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "super-simple-morphi-example",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/morphi/super-simple-morphi-example"
    },
    {
      "browser": {
        "children": [],
        "name": "ng2-rest",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/ng2-rest"
    },
    {
      "browser": {
        "children": [
          null
        ],
        "name": "tnp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project"
    },
    {
      "browser": {
        "children": [
          null,
          null,
          null
        ],
        "name": "manager",
        "isWorkspace": true,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/manager"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-logic",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/manager/ss-common-logic"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-ui",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/manager/ss-common-ui"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-webapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/manager/ss-webapp"
    },
    {
      "browser": {
        "children": [
          null,
          null
        ],
        "name": "container",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container"
    },
    {
      "browser": {
        "children": [
          null,
          null,
          null,
          null,
          null
        ],
        "parent": null,
        "name": "baseline",
        "isWorkspace": true,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-admin-webapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline/ss-admin-webapp"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-logic",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline/ss-common-logic"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-ui",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline/ss-common-ui"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-mobileapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline/ss-mobileapp"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-webapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/baseline/ss-webapp"
    },
    {
      "browser": {
        "children": [
          null,
          null,
          null,
          null,
          null
        ],
        "parent": null,
        "name": "site",
        "isWorkspace": true,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-admin-webapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site/ss-admin-webapp"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-logic",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site/ss-common-logic"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-common-ui",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site/ss-common-ui"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-mobileapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site/ss-mobileapp"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "ss-webapp",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/container/site/ss-webapp"
    },
    {
      "browser": {
        "children": [
          null
        ],
        "name": "workspace",
        "isWorkspace": true,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/workspace-v2"
    },
    {
      "browser": {
        "children": [],
        "parent": null,
        "name": "isomorphic-lib",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/tsc-npm-project/projects/workspace-v2/isomorphic-lib"
    },
    {
      "browser": {
        "children": [],
        "name": "json10",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/json10"
    },
    {
      "browser": {
        "children": [],
        "name": "lodash-walk-object",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/lodash-walk-object"
    },
    {
      "browser": {
        "children": [],
        "name": "typescript-class-helpers",
        "isWorkspace": false,
        "isCloud": true
      },
      "location": "/Users/npm/typescript-class-helpers"
    }
  ]
}
//#endregion
