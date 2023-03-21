import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    static _serverUrl = '';
    constructor(private http: HttpClient) {
    }


    public static async initServerUrl() : Promise<void> {
        await fetch('skat-server-url').then(async (res: any) => {
                //console.log('Fetch returned:', val);
                if(res.ok) {
                    const val = await res.json();
                    console.log('Res body:', val);
                    ConfigService._serverUrl = val.url.trim() || environment.server_url.trim();
                    console.log('Set server URL', ConfigService._serverUrl);
                } else {
                    console.log('Unable to retrieve backend URL from page server, falling back to environment.ts');
                    ConfigService._serverUrl = environment.server_url.trim();
                }
                return ConfigService._serverUrl;
            });
        }

    public get serverUrl() {
        console.log('Server URL getter called: returning', ConfigService._serverUrl);
        return ConfigService._serverUrl;
    }
}
