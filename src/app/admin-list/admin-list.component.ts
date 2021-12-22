import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { DataService } from '../services/data.service';
import { PersonService } from '../services/person.service';
import { Person } from '../models/person';
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

  constructor(
    private authServ: AuthService,
    private data: DataService,
    private personService: PersonService
    
  ) { 
  }

  
  async ngOnInit(): Promise<void> {
    this.selectedStatus = '';
    this.persons = await this.personService.getPersons();
    this.data.currentMessage.subscribe(message => this.messageFromOtherComponent = message);

    console.log("[ADMIN]");
    console.log(this.messageFromOtherComponent);
    console.log("------------------------------------------------------");


    this.newMessage();
    
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
