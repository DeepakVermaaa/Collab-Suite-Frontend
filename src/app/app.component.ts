import { Component } from '@angular/core';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SyncSpace';
  isLoading$ = this.loaderService.isLoading$;

  constructor(private loaderService: LoaderService) {}
}