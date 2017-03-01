import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';
import { Demo1Component } from './demo1';

import { Demo2Component } from './demo2';

export const ROUTES: Routes = [
  { path: '',      component: Demo1Component },
  { path: 'demo1',  component: Demo1Component },
  { path: 'demo2',  component: Demo2Component },
  { path: '**',    component: NoContentComponent },
];
