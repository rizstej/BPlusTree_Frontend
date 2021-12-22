import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../user';
import { PersonService } from '../services/person.service';
import { Person } from '../models/person';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  private user: User = new User();
  private person: Person = new Person();

  private password_validation: string = "";

  hidePassword = true;

  constructor(
    private userServ: UserService,
    private persServ: PersonService,
    private routing: Router
  ) { }

  ngOnInit() {
  }

  validCred(): boolean{
    if( this.user.username != '' && 
        this.user.password != '' &&
        this.user.password == this.password_validation){
      return false;
    }else{
      return true;
    }
  }

  async onSubmit(): Promise<void>{
    this.user.username.trim();
    if(this.user.username.includes(" ")){
      let name = this.user.username.split(" ");
      this.person.first_name = name[1];
      this.person.last_name = name[0];
      
      await this.persServ.createPerson(this.person);
      await this.userServ.createUser(this.user);

      console.log("Successfull Register");

      this.routing.navigate(['/login']);
    } else {
      alert("Please be aware that your username most contain a space");
    }

  }

}
