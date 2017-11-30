import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ModuleUtil } from '../utils/Module';
import { OptionsService } from '../main/options.service';

import { HttpClient } from '../common/httpclient';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';



@Component({
    template: `
        <div *ngIf="_service.installStatus == 'stopped'" class="not-installed">
            <p>
                Web Server (IIS) is not installed on the machine
                <br/>
                <a href="https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2" >Learn more</a>
            </p>
        </div>
        <div *ngIf="webServer">
            <loading *ngIf="!webServer"></loading>
            <webserver-header [model]="webServer" [class.sidebar-nav-content]="_options.active"></webserver-header>
            <div class="sidebar crumb" [class.nav]="_options.active">
                <vtabs *ngIf="webServer" [markLocation]="true" (activate)="_options.refresh()">
                    <item [name]="'General'" [ico]="'fa fa-wrench'">
                        <webserver-general [model]="webServer"></webserver-general>
                    </item>
                    <item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                        <dynamic [name]="module.component_name" [module]="module.module" [data]="module.data"></dynamic>
                    </item>
                </vtabs>
            </div>
        </div>
    `,
    styles: [`
        :host >>> .sidebar > vtabs .vtabs > .items {
            top: 35px;
        }

        :host >>> .sidebar > vtabs .vtabs > .content {
            top: 96px;
        }

        .not-installed {
            text-align: center;
            margin-top: 50px;
        }
    `]
})
export class WebServerComponent {
    webServer: WebServer;
    modules: Array<any> = [];

    constructor( @Inject('WebServerService') private _service: WebServerService,
        private _http: HttpClient,
        private _options: OptionsService,
        private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this._service.server.then(ws => {
            this.webServer = ws;
            ModuleUtil.initModules(this.modules, this.webServer, "webserver");
            ModuleUtil.addModule(this.modules, "Certificates");

            this._http.head('/certificates/', null, false)
                .catch(res => {
                    this.modules = this.modules.filter(m => m.name.toLocaleLowerCase() !== 'certificates')
                });
        });
    }
}
