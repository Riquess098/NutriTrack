import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login'; 
import { CadastroComponent } from './pages/cadastro/cadastro';
import { DashboardComponent } from './pages/dashboard/dashboard'; 
import { QuestionarioComponent } from './pages/questionario/questionario';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'dashboard', component: DashboardComponent }, 
  { path: 'questionario', component: QuestionarioComponent }
];