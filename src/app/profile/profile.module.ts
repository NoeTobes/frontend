import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { UpdateComponent } from './update/update.component';

@NgModule({
  declarations: [
    ProfileComponent,
    UpdateComponent
    // Remove ProfilePictureComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }