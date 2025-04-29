// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));


  // src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Importe provideHttpClient e withInterceptorsFromDi
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    // Adicione esta linha:
    provideHttpClient(withInterceptorsFromDi()),

    // Mantenha outros provedores que você já tenha:
    provideAnimationsAsync(), // Para Angular Material animations

  ]
})
  .catch((err) => console.error(err)); // Mantém o tratamento de erro do bootstrap