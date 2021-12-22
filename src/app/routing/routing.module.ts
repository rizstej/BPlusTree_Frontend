import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BPlusTreeComponent } from "../bPlus-tree/bPlus-tree.component";
import { BPlusTreeLogComponent } from "../bPlus-tree-log/bPlus-tree-log.component";
import { AuthGuard } from '../auth.guard';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AdminListComponent } from '../admin-list/admin-list.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { HelperComponent } from '../helper/helper.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/bplus-tree',
    pathMatch: 'full'
  },
  {
    path: 'bplus-tree',
    component: BPlusTreeComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'bplus-tree/logs',
    component: BPlusTreeLogComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'helper',
    component: HelperComponent,
  },
  {
    path: 'register',
    component: RegisterFormComponent
  },
  {
    path: 'admin',
    component: AdminListComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'login',
    component: LoginFormComponent
  },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)  ],
  exports: [ RouterModule ],
  declarations: []
})
export class RoutingModule { }