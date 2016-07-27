import { bootstrap } from 'angular2/platform/browser';
import { AppComponent } from './app';
import {enableProdMode} from 'angular2/core';
enableProdMode();
bootstrap(AppComponent, [])
    .then(success => console.log(`Bootstrap success`))
    .catch(error => console.log(error));
