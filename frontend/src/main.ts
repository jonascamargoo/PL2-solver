
// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// 🛠️ importa o Plotly
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

// 🧠 seta o plotlyjs ANTES de iniciar o app
PlotlyModule.plotlyjs = PlotlyJS;

// 🚀 agora inicia o app
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
