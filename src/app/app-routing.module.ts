import {NgModule} from "@angular/core";
import {WelcomeComponent} from "./welcome/welcome.component";
import {SignupComponent} from "./auth/signup/signup.component";
import {LoginComponent} from "./auth/login/login.component";
import {TrainingComponent} from "./training/training.component";
import { RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "./auth/auth-guard";

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'training', component: TrainingComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
