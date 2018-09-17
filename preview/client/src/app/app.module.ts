declare const require: any;
require('!style-loader!css-loader!assets/vendor/highlight/vs.min.css');
require('!script-loader!assets/vendor/highlight/highlight.min.js');
require('!script-loader!assets/vendor/highlight/typescript.min.js');
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MatCheckboxModule,
  MatSnackBarModule,
  MatButtonModule,
  MatCardModule,
  MatTabsModule
} from '@angular/material';
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


export const ROUTES: Routes = [
  { path: '', redirectTo: 'sockets', pathMatch: 'full' },
  { path: 'sockets', component: SocketsComponent }
  { path: 'demo2', component: Demo2Component },
  { path: '**', component: NoContentComponent },
];

@NgModule({
  declarations: [
    AppComponent,
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
