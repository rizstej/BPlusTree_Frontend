import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatToolbarModule, MatButtonToggleModule, MatIconModule, MatButtonModule, MatMenuModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { AppComponent } from './app.component';
import { BPlusTreeComponent } from './bPlus-tree/bPlus-tree.component';
import { BPlusTreeLogComponent } from './bPlus-tree-log/bPlus-tree-log.component';
import { RoutingModule } from './routing/routing.module';
import { LoginFormComponent } from './login-form/login-form.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { DataService } from './services/data.service';
import { DrawLinesComponent } from './draw-lines/draw-lines.component';
import { HelperComponent } from './helper/helper.component';

@NgModule({
  declarations: [
    AppComponent,
    BPlusTreeComponent,
    BPlusTreeLogComponent,
    LoginFormComponent,
    AdminListComponent,
    RegisterFormComponent,
    DrawLinesComponent,
    HelperComponent
  ],
  imports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    HttpClientTestingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    RoutingModule,
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
