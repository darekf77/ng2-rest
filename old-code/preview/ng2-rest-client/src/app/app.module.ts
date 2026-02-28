declare const require: any;
import hljs from 'highlight.js';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MatCheckboxModule,

} from '@angular/material/checkbox';


import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { NgModule } from '@angular/core';
import { NoContentComponent } from './no-content';
import { HighlightCodeDirective } from './code-highlight.directive';

import {
  RouterModule,
  PreloadAllModules,
  Routes
} from '@angular/router';

import { AppComponent } from './app.component';

import { Demo2Component } from './demo2';
import { SocketsComponent } from './sockets/sockets.component';
import { CacheRequestComponent } from './cache-request/cache-request.component';


export const ROUTES: Routes = [
  { path: '', redirectTo: 'sockets', pathMatch: 'full' },
  { path: 'sockets', component: SocketsComponent },
  { path: 'cache-request', component: CacheRequestComponent },
  { path: 'demo2', component: Demo2Component },
  { path: '**', component: NoContentComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    CacheRequestComponent,
    NoContentComponent,
    Demo2Component,
    SocketsComponent,
    HighlightCodeDirective
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MatCheckboxModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule
  ],
  exports: [
    MatCheckboxModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
