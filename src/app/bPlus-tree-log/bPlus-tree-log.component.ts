import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { DataService } from '../services/data.service';
import { Node } from '../models/node';
import { Tree } from '../models/tree';
import { Log } from '../models/log';
import { Keys } from '../models/keys';
import { Builder } from '../models/builder';

@Component({
  selector: 'app-bplus-tree',
  templateUrl: './bPlus-tree-log.component.html',
  styleUrls: ['./bPlus-tree-log.component.css']
})
export class BPlusTreeLogComponent implements OnInit {


  public myTree: Tree;

  messageFromOtherComponent:Tree;

  constructor(
    public authServ: AuthService,
    private data: DataService
  ) { 
  }
  
  async ngOnInit(): Promise<void> {
    
    this.data.currentMessage.subscribe(message => this.messageFromOtherComponent = message);

    this.myTree = this.messageFromOtherComponent;

    console.log("[LOG]");
    console.log(this.messageFromOtherComponent);
    console.log("------------------------------------------------------");

    
    this.newMessage();
  }


  //
  // Changing the value of the message 
  //
  newMessage(){
    this.data.changeMessage(this.messageFromOtherComponent);
  }


}
