import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SnakeTimerAppComponent } from "./snake-timer-app.component";

@NgModule({
  declarations: [
    SnakeTimerAppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [SnakeTimerAppComponent]
})
export class AppModule { }
