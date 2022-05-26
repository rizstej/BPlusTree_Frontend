import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { DataService } from '../services/data.service';
import { PersonService } from '../services/person.service';
import { Person } from '../models/person';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Tree } from '../models/tree';


@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  public selectedStatus: string;

  messageFromOtherComponent:Tree;

  private persons: Person[] = [];
  private users: User[] = [];

  constructor(
    private authServ: AuthService,
    private data: DataService,
    private personService: PersonService,
    private userService: UserService
    
  ) { 
  }

  
  async ngOnInit(): Promise<void> {
    this.selectedStatus = '';
    this.persons = await this.personService.getPersons();
    this.users = await this.userService.getUsers();
    this.data.currentMessage.subscribe(message => this.messageFromOtherComponent = message);

    console.log("[ADMIN PAGE]");

    this.newMessage();
  }

  currentUser(current){
    return current==this.authServ.user.username;
  }
  
  addAdmin(oldUser){
    console.log("[Add Admin button pressed]");
    
    let index = this.users.find(item => item.username==oldUser).id-1;
    this.users[index].role = 'ROLE_ADMIN';

    console.log("Updated user:");
    console.log(this.users[index]);
    this.userService.updateUser(this.users[index]);

    this.ngOnInit();
  }

  removeAdmin(oldUser){
    console.log("[Remove Admin button pressed]");

    let index = this.users.find(item => item.username==oldUser).id-1;
    this.users[index].role = 'ROLE_USER';

    console.log("Updated user:");
    console.log(this.users[index]);
    this.userService.updateUser(this.users[index]);

    this.ngOnInit();
  }

  giveBackBooleanResponse(bool: boolean): string{
    if(bool){
      return "Yes";
    }else{
      return "No";
    }
  }

  newMessage(){
    this.data.changeMessage(this.messageFromOtherComponent);
  }

}
