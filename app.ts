import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { GranularComponent } from './granular/granular.component';
import 'rxjs/Rx'; // load the full rxjs

@Component({
    selector: 'app',
    templateUrl: './app.html',
    styleUrls: ['./app.css'],
    directives: [ROUTER_DIRECTIVES, GranularComponent],
    providers: [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS
    ]
})
@RouteConfig([
    
])
export class AppComponent { }