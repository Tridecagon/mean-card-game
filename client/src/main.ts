  import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ConfigService } from 'app/shared/services/config.service';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

ConfigService.initServerUrl().then(() => platformBrowserDynamic().bootstrapModule(AppModule));
