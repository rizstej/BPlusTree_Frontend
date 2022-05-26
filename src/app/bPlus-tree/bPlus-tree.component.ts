import { Component, OnInit } from '@angular/core';
import { Node } from '../models/node';
import { Tree } from '../models/tree';
import { Log } from '../models/log';
import { Keys } from '../models/keys';
import { Builder } from '../models/builder';
import { AuthService } from '../auth.service';
import { DataService } from '../services/data.service';
import { isNumber } from 'util';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { root } from 'rxjs/internal-compatibility';
import { notDeepEqual } from 'assert';


@Component({
  selector: 'app-bplus-tree',
  templateUrl: './bPlus-tree.component.html',
  styleUrls: ['./bPlus-tree.component.css']
})
export class BPlusTreeComponent implements OnInit {


  //===================================================
  //==================== VARIABLES ====================
  //===================================================


  public nodes: Node[];
  public myTree: Tree;
  public myTreeBuilder: Builder[];

  public header = 0;
  public pointerIndex = 0;
  public nodeNumbersGlobal = []
  public levelCounter =  [0, 0, 0]
  public treeHeader = [];

  actual_node: Node; 
  first_node:boolean = true;

  public lineCounter = 0;
  public counter = 0;


  //The options you can choose from on the TreeBuilding screen
  private options = [
    { id: -1, name: "Please choose an option", text:""},
    { id: 0, name: "Build a new Tree", text:""},
    { id: 1, name: "Insert", text:"Key value:"},
    { id: 2, name: "Delete", text:"Key value:"},
    { id: 3, name: "Search", text:"Key value:"}
  ];


  //Variables that help to get the values from the user
  public selectedOption: {};
  public selectedOptionName;
  public input_key_value: number = 0;
  public key_values: Array<number> = [];


  //Variables for creating and modifying the frontend
  public validOptionIsSelected: boolean;
  public newTree: boolean;
  public emptyArray: boolean = true;
  public searchRout: string = " ";


  //Message sent between components
  message:Tree;


  constructor(
    public authServ: AuthService,
    private data: DataService
  ) { 
  }


  //===================================================
  //==================== FUNCTIONS ====================
  //===================================================


  //
  // === Function for when the page is initiated ===
  //
  async ngOnInit(): Promise<void> {
    this.myTree = new Tree();
    this.selectedOption=this.options[0];

    this.data.currentMessage.subscribe(message => this.message = message);
    this.myTree = this.message;

    for(var i=0; i<this.myTree.logs.length; i++){
      if(this.myTree.logs[i].op=="insert"){
        this.key_values.push(this.myTree.logs[i].key);
      }
      if(this.myTree.logs[i].op=="delete"){
        this.key_values.splice(this.myTree.logs[i].key);
      }
    }
    if(this.key_values.length>0) this.first_node=false;

    this.myTree = this.message;
    
    this.buildTree();
    this.drawTree();

  }


  //
  // === Function for option selection ===
  //
  onChange(event): void {  

    const newOP = event.target.options;
    console.log("onChange");

    
    if(newOP.selectedIndex==0){
      this.selectedOption=this.options[0];
      console.log(this.selectedOption);
      this.selectedOptionName=this.options[0].name;
      this.validOptionIsSelected=false;
      this.newTree=false;
      this.ngOnInit();
      return;
    }
    if (newOP.selectedIndex==1){
      this.selectedOption=this.options[1];
      this.selectedOptionName=this.options[1].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=true;
      this.ngOnInit();
      return;
    }
    if (newOP.selectedIndex==2){
      this.selectedOption=this.options[2];
      this.selectedOptionName=this.options[2].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=false;
      this.ngOnInit();
      return;
    }
    if (newOP.selectedIndex==3){
      this.selectedOption=this.options[3];
      this.selectedOptionName=this.options[3].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=false;
      this.ngOnInit();
      return;
    }
    if (newOP.selectedIndex==4){
      this.selectedOption=this.options[4];
      this.selectedOptionName=this.options[4].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=false;
      this.ngOnInit();
      return;
    }
  }


  //
  // === Function for when a button is pushed ===
  //
  async onSubmit(){

    var activeButton = document.activeElement.id;
    //Adding values and steps to arrays if OPTION = INSERT or DELETE
    if (activeButton == "submit") {
      if(this.selectedOptionName=="Insert"){
        if(!this.alreadyInserted(this.input_key_value) && this.input_key_value!=null && this.input_key_value!=0){
          this.key_values.push(this.input_key_value);
          this.sortKeyValues(this.key_values);
          
          //INSERT into Tree
          this.insert(this.input_key_value);

        } else {
          alert("The input value you added is already inserted or not valid!");
        }
      }else if(this.selectedOptionName=="Delete"){
        if(this.alreadyInserted(this.input_key_value) && this.input_key_value!=null && this.input_key_value!=0){
          const index: number = this.key_values.indexOf(this.input_key_value);
          if (index !== -1) {
            this.key_values.splice(index, 1);
          }          
          //DELETE from tree
          this.delete(this.input_key_value);
          
        } else {
          alert("The input value can not be deleted because it is not in the tree or not a valid value!");
        }
      } else if(this.selectedOptionName=="Search"){
        if(this.alreadyInserted(this.input_key_value) && this.input_key_value!=null && this.input_key_value!=0){
          console.log("true");
          console.log(this.input_key_value);
          this.search(true,this.input_key_value);
        } else {
          console.log("false");
          console.log(this.input_key_value);
          this.search(false,this.input_key_value);
        }
      }
      this.input_key_value = null;
    }

    //Loading form somewhere if OPTION = BUILD NEW TREE -> LOAD
    if (activeButton == "load") {
      alert("The 'LOAD' feature is not available yet!");
    }

    //Saving already done steps if OPTION = BUILD NEW TREE -> SAVE
    if (activeButton == "save") {
      alert("The 'SAVE' feature is not available yet!");    
    }

    //Deleting everything if OPTION = BUILD NEW TREE -> DELETE
    if (activeButton == "delete") {
      this.key_values.splice(0,this.key_values.length);
      this.restart();
    }

    this.newMessage();
    this.drawTree();
  }


  //
  // === Checking if the key value the user wants in insert / delete is already inserted ===
  //
  alreadyInserted(key: number){
    const result = this.key_values.find(x => x == key );
    return result;
  }


  //
  // === Creating a message for Log subpage ===  
  //
  newMessage(){
    console.log(this.myTree);
    this.data.changeMessage(this.myTree);
  }


  //==========================================================
  //==================== B+TREE FUNCTIONS ====================
  //==========================================================


  //
  // === Restarting the tree ===
  //
  restart(){
    this.nodes = [];
    this.myTree = new Tree();
    this.myTreeBuilder = [];
    this.actual_node = new Node(); 
    this.first_node = true;
    this.buildTree();
    this.drawTree();
  }


  //
  // === Sorting the key values in ascending order ===
  //
  sortKeyValues(inputArray: Array<number>){
    var result = inputArray.sort((n1,n2) => n1 - n2);
  }


  //
  // === Adding key values to nodes === 
  //
  //RETURN: newNode and max_keyvalue : if node is full
  //        -1 : if node is NOT full
  //
  addKey(node:Node, key: number){
    
    //===== Logs for checking if code is running correctly =====
    console.log("AddKey()"); console.log("node: " + node.keyvalues); console.log("key: " + key);
    //===== Logs over =====
    
    const index: number = node.keyvalues.indexOf(key);
    if (index == -1) {    
        if(node.keyvalues.length==3){
            return this.split(node, key);
        } else {            
            node.keyvalues.push(key);
            node.recordnumber = node.keyvalues.length;
            this.sortKeyValues(node.keyvalues);
            //===== Logs for checking if code is running correctly =====
            console.log("Returns:"); console.log("node: " + null); console.log("key: " + -1);
            //===== Logs over =====
            return [null,-1];
        }
    }
    //===== Logs for checking if code is running correctly =====
    console.log("Returns:"); console.log("node: " + null); console.log("key: " + -1);
    //===== Logs over =====
    return [null,-1];
  }


  //
  // === Removing key values from nodes ===
  // 
  //RETURN: mergedNode and max_keyvalue : if node is NOT full  
  //        -1 : if node is full
  //
  removeKey(node: Node, key: number){
      
      //===== Logs for checking if code is running correctly =====
      console.log("RemoveKey()"); console.log("node: " + node.keyvalues); console.log("key: " + key);
      //===== Logs over =====
      
      const index: number = node.keyvalues.indexOf(key);
      if (index != -1) {
          if(node.isRoot){
            //===== Logs for checking if code is running correctly =====
            console.log("node is root");
            //===== Logs over =====
              if(node.keyvalues.length!=1){
                node.keyvalues.splice(index, 1);
                node.recordnumber = node.keyvalues.length;
                this.sortKeyValues(node.keyvalues);
                //===== Logs for checking if code is running correctly =====
                console.log("Returns:"); console.log("node: " + null); console.log("key: " + -1);
                //===== Logs over =====
                return [null,-1];
              } else if(node.keyvalues.length==1){
                //===== Logs for checking if code is running correctly =====
                console.log("Restart!");
                //===== Logs over =====
                this.restart();
              }
          } else if(node.keyvalues.length==2){
              return this.merge(node, key);
          } else {
              //===== Logs for checking if code is running correctly =====
              console.log("node is NOT root -> keyvalues != 2"); console.log("Returns:"); console.log("node: " + null); console.log("key: " + -1);
              //===== Logs over =====
              node.keyvalues.splice(index, 1);
              node.recordnumber = node.keyvalues.length;
              this.sortKeyValues(node.keyvalues);
              return [null,-1];
          }
      }
      return [null,-1];
  }


  //
  // === Splitting one node into two nodes === 
  //
  // RETURN: newNode -> will be added to the parent node 
  //         max_keyvalue -> will be copied or moved up to the parent node
  //
  split(node:Node, key:number){
      
      //===== Logs for checking if code is running correctly =====
      console.log("Split()"); console.log("node: " + node.keyvalues); console.log("key: " + key);
      //===== Logs over =====
      
      var newNode;
      var max_keyvalue;
      const valuesToSplit = Object.assign([], node.keyvalues);

      //if the node is a leaf
      if(node.isLeaf){
          
          //===== Logs for checking if code is running correctly =====
          console.log("Split() -> Node is leaf");
          //===== Logs over =====

          //adjusting original node's keys
          valuesToSplit.push(key);
          this.sortKeyValues(valuesToSplit);
          node.keyvalues.splice(0,3);
          node.keyvalues.push(valuesToSplit[0]);
          node.keyvalues.push(valuesToSplit[1]);
          node.recordnumber=2;
          node.isRoot = false;

          //creating new leaf node
          newNode = new Node();
          newNode.isLeaf = true;
          newNode.isRoot = false;
          this.addKey(newNode,valuesToSplit[2]);
          this.addKey(newNode,valuesToSplit[3]);
          newNode.recordnumber=2;

          //adjusting pointers
          newNode.prevLeaf = node;
          newNode.nextLeaf = node.nextLeaf;
          if(node.nextLeaf!=null) { node.nextLeaf.prevLeaf = newNode; }
          node.nextLeaf = newNode;
          
          this.myTree.nodes.push(newNode);

          max_keyvalue = valuesToSplit[2];

          //===== Logs for checking if code is running correctly =====
          console.log("Returns:"); console.log("node: " + node.keyvalues); console.log("key: " + max_keyvalue);
          //===== Logs over =====
          return [newNode, max_keyvalue];
      } 
      
      //if the node is NOT a leaf
      else {
          
          //===== Logs for checking if code is running correctly =====
          console.log("Split() -> Node is not leaf");
          //===== Logs over =====
          
          //adjusting the original node's keys
          valuesToSplit.push(key);
          this.sortKeyValues(valuesToSplit);
          node.keyvalues.splice(0,3);
          node.keyvalues.push(valuesToSplit[0]);
          node.keyvalues.push(valuesToSplit[1]);
          node.recordnumber=2;

          if(node.childPointers[0]!=null){console.log("child_0: " + node.childPointers[0].keyvalues);}
          if(node.childPointers[1]!=null){console.log("child_1: " + node.childPointers[1].keyvalues);}
          if(node.childPointers[2]!=null){console.log("child_2: " + node.childPointers[2].keyvalues);}
          if(node.childPointers[3]!=null){console.log("child_3: " + node.childPointers[3].keyvalues);}
          if(node.childPointers[4]!=null){console.log("child_4: " + node.childPointers[4].keyvalues);}

          //creating a new node
          newNode = new Node();
          newNode.isLeaf = false;
          newNode.isRoot = false;
          newNode.keyvalues.push(valuesToSplit[3]);
          newNode.recordnumber = 1;

          //adjusting childrenpointers
          newNode.childPointers[0] = node.childPointers[3];
          newNode.childPointers[1] = node.childPointers[4];
          node.childPointers[3] = null;
          node.childPointers[4] = null;

          this.myTree.nodes.push(newNode);

          max_keyvalue = valuesToSplit[2];
          
          //===== Logs for checking if code is running correctly =====
          console.log("Returns:"); console.log("node: " + newNode.keyvalues); console.log("key: " + max_keyvalue);
          //===== Logs over =====
          return [newNode, max_keyvalue];
      }

  }
  
  
  //
  // === Merging two nodes into one ===
  //
  //RETURN: mergedNode -> not new node
  //        max_keyvalue -> will be deleted from the parent node's hashkeys
  //
  merge(node:Node, key:number){

      //===== Logs for checking if code is running correctly =====
      console.log("Merge()"); console.log("node: " + node.keyvalues); console.log("key: " + key);
      //===== Logs over =====

      console.log("checking for notEnoughChildrenDifferentParent");
      let tmpNode=node;
      let notEnoughOnRight = false;
      let notEnoughOnLeft = false;
      console.log("tmpNode.keyvalues: " + tmpNode.keyvalues);

      while(!notEnoughOnRight && tmpNode.nextLeaf!=null){
        console.log("while - checking notEnoughOnRight");
        if(tmpNode.parentNode!=tmpNode.nextLeaf.parentNode){
          console.log("tmpNode: " + tmpNode.keyvalues);
          console.log("tmpNode.parentNode: " + tmpNode.parentNode.keyvalues);
          console.log(".");
          console.log("tmpNode.prevLeaf: " + tmpNode.prevLeaf.keyvalues);
          console.log("tmpNode.prevLeaf.parentNode: " + tmpNode.prevLeaf.parentNode.keyvalues);
          if(tmpNode.nextLeaf.parentNode.childPointers.length<3 || tmpNode.nextLeaf.parentNode.childPointers[2]==null){
            notEnoughOnRight = true;
            console.log("notEnoughOnRight = true");
          }
        }
        tmpNode = tmpNode.nextLeaf;
      }

      console.log("reset");
      tmpNode=node;
      console.log("tmpNode.keyvalues: " + tmpNode.keyvalues);

      while(!notEnoughOnLeft && tmpNode.prevLeaf!=null){
        console.log("while - checking notEnoughOnLeft");
        
        if(tmpNode.parentNode!=tmpNode.prevLeaf.parentNode){
          console.log("tmpNode: " + tmpNode.keyvalues);
          console.log("tmpNode.parentNode: " + tmpNode.parentNode.keyvalues);
          console.log(".");
          console.log("tmpNode.prevLeaf: " + tmpNode.prevLeaf.keyvalues);
          console.log("tmpNode.prevLeaf.parentNode: " + tmpNode.prevLeaf.parentNode.keyvalues);
          if(tmpNode.prevLeaf.parentNode.childPointers.length<3 || tmpNode.prevLeaf.parentNode.childPointers[2]==null){
            notEnoughOnLeft = true;
            console.log("notEnoughOnLeft = true");
          }
        }
        tmpNode = tmpNode.prevLeaf;
      }

      var max_keyvalue;
      var mergedNode;
      var valuesLeft = [];
      
      //if the leaf has a left sibling and share a parent node
      if(node.prevLeaf!=null  && node.parentNode==node.prevLeaf.parentNode && node.parentNode.childPointers.length >= 3 && !notEnoughOnRight && !notEnoughOnLeft) {
        
        //===== Logs for checking if code is running correctly =====
        console.log("Merging with previous leaf");
        //===== Logs over =====

        max_keyvalue = node.keyvalues[0]; //saving first key for later to delete hash key
          
        //adjusting the pointers
        if(node.prevLeaf != null){ if(node.prevLeaf.nextLeaf != null && node.nextLeaf != null){node.prevLeaf.nextLeaf = node.nextLeaf;} }
        if(node.nextLeaf != null){ if(node.nextLeaf.prevLeaf != null && node.prevLeaf != null){node.nextLeaf.prevLeaf = node.prevLeaf;} }

        //deleting key, and adding the one key left in node to previous leaf
        const ind: number = node.keyvalues.indexOf(key);
        node.keyvalues.splice(ind,1);
        valuesLeft = node.keyvalues;
        node.prevLeaf.keyvalues.push(valuesLeft[0]);
        this.sortKeyValues(node.prevLeaf.keyvalues); 
        mergedNode = node.prevLeaf;
        mergedNode.recordnumber = mergedNode.keyvalues.length;

        //deleting node from tree
        node.keyvalues.splice(0,3);
        node.recordnumber = node.keyvalues.length;
        const index = this.myTree.nodes.indexOf(node);
        this.myTree.nodes.splice(index,1);

        //===== Logs for checking if code is running correctly =====
        console.log("Returns:"); console.log("node: " + mergedNode.keyvalues); console.log("key: " + max_keyvalue);
        //===== Logs over =====
        return [mergedNode, max_keyvalue];

      } 
      //if the leaf has a left sibling and share a parent node
      else if(node.nextLeaf!=null && node.parentNode==node.nextLeaf.parentNode && node.parentNode.childPointers.length >= 3 && !notEnoughOnRight && !notEnoughOnLeft) { 
        
        //===== Logs for checking if code is running correctly =====
        console.log("Merging with next leaf");
        //===== Logs over =====
        
        max_keyvalue = node.keyvalues[0];

        //adjusting the pointers
        if(node.prevLeaf != null){ if(node.prevLeaf.nextLeaf != null && node.nextLeaf != null){node.prevLeaf.nextLeaf = node.nextLeaf;} }
        if(node.nextLeaf != null){ if(node.nextLeaf.prevLeaf != null && node.prevLeaf != null){node.nextLeaf.prevLeaf = node.prevLeaf;} }
        
        //deleting key, and adding the one key left in node to next leaf
        const ind: number = node.keyvalues.indexOf(key);
        node.keyvalues.splice(ind,1);
        valuesLeft = node.keyvalues;
        node.nextLeaf.keyvalues.push(valuesLeft[0]);
        this.sortKeyValues(node.nextLeaf.keyvalues);
        mergedNode = node.nextLeaf;
        mergedNode.recordnumber = mergedNode.keyvalues.length;

        //deleting node from tree
        node.keyvalues.splice(0,3);
        node.recordnumber = node.keyvalues.length;
        const index = this.myTree.nodes.indexOf(node);
        this.myTree.nodes.splice(index,1);

        //===== Logs for checking if code is running correctly =====
        console.log("Returns:"); console.log("node: " + mergedNode.keyvalues); console.log("key: " + max_keyvalue);
        //===== Logs over =====
        return [mergedNode, max_keyvalue];

      } 
      //if the leaf has less than 3 siblings and next of previous parent has stealable leaves
      else if(node.parentNode != null && node.parentNode.childPointers.length < 3 && !notEnoughOnRight && !notEnoughOnLeft) {  //Error: Uncaught (in promise): TypeError: Cannot read properties of null (reading 'childPointers')
        
        //===== Logs for checking if code is running correctly =====
        console.log("Sibling Transfer");
        //===== Logs over =====

        if(node.prevLeaf!=null && node.parentNode==node.prevLeaf.parentNode){
          
          //===== Logs for checking if code is running correctly =====
          console.log("Mering with previous leaf ");
          //===== Logs over =====

          max_keyvalue = node.keyvalues[0]; //saving first key for later to delete hash key
          
          //adjusting the pointers
          if(node.prevLeaf != null){ if(node.prevLeaf.nextLeaf != null && node.nextLeaf != null){node.prevLeaf.nextLeaf = node.nextLeaf;} }
          if(node.nextLeaf != null){ if(node.nextLeaf.prevLeaf != null && node.prevLeaf != null){node.nextLeaf.prevLeaf = node.prevLeaf;} }

          //deleting key, and adding the one key left in node to previous leaf
          const ind: number = node.keyvalues.indexOf(key);
          node.keyvalues.splice(ind,1);
          valuesLeft = node.keyvalues;
          node.prevLeaf.keyvalues.push(valuesLeft[0]);
          this.sortKeyValues(node.prevLeaf.keyvalues); 
          mergedNode = node.prevLeaf;
          mergedNode.recordnumber = mergedNode.keyvalues.length;

          //deleting node from tree
          node.keyvalues.splice(0,3);
          node.recordnumber = node.keyvalues.length;
          const index = this.myTree.nodes.indexOf(node);
          this.myTree.nodes.splice(index,1);

          //Sibling Transfer
          //If right sibling have 3 or more children, we have to transfer from right, otherwise from left
          if(mergedNode.nextLeaf != null){
            
            //===== Logs for checking if code is running correctly =====
            console.log("Transferring sibling from the right side");
            //===== Logs over =====
            
            let parentWeStealFrom = mergedNode.nextLeaf.parentNode;
            let childIndex = parentWeStealFrom.childPointers.indexOf(mergedNode.nextLeaf);
            let stolenChild = parentWeStealFrom.childPointers[childIndex];

            //adjusting childPointers
            mergedNode.parentNode.childPointers.push(null);
            mergedNode.parentNode.childPointers[0] = mergedNode;
            mergedNode.parentNode.childPointers[1] = parentWeStealFrom.childPointers[childIndex];
            
            parentWeStealFrom.childPointers[childIndex] = null;
            
            let haveNull = parentWeStealFrom.childPointers.includes(null);
            while(haveNull){
              let nullindex;
              nullindex = parentWeStealFrom.childPointers.indexOf(null);
              parentWeStealFrom.childPointers.splice(nullindex,1);
              haveNull = parentWeStealFrom.childPointers.includes(null);
            }

            //adjusting haskeys
            let x, y, z;
            let hashIndex = 0;
            let haveIndex = false;
            x = mergedNode.parentNode.keyvalues[0];
            
            //stealing from righ, hence we need the smallest hashkey
            z = parentWeStealFrom.keyvalues[0];
            
            while(!haveIndex){
              if(parentWeStealFrom.parentNode.keyvalues[hashIndex] > x && parentWeStealFrom.parentNode.keyvalues[hashIndex] < z){
                haveIndex = true;
              } else {hashIndex++;}
            }
            y = parentWeStealFrom.parentNode.keyvalues[hashIndex];

            //adjusting parentNode
            let xInd, yInd, zInd;
            xInd = mergedNode.parentNode.keyvalues.indexOf(x);
            yInd = parentWeStealFrom.parentNode.keyvalues.indexOf(y);
            zInd = parentWeStealFrom.keyvalues.indexOf(z);

            parentWeStealFrom.keyvalues.splice(zInd,1);
            parentWeStealFrom.parentNode.keyvalues[yInd] = z;
            mergedNode.parentNode.keyvalues[xInd] = y;

            stolenChild.parentNode = mergedNode.parentNode;

          } else {

            //===== Logs for checking if code is running correctly =====
            console.log("Transferring sibling from the left side");
            //===== Logs over =====

            let parentWeStealFrom = mergedNode.prevLeaf.parentNode;
            let childIndex = parentWeStealFrom.childPointers.indexOf(mergedNode.prevLeaf);
            let stolenChild = parentWeStealFrom.childPointers[childIndex];

            //adjusting childPointers
            mergedNode.parentNode.childPointers.push(null);
            mergedNode.parentNode.childPointers[1] = mergedNode;
            mergedNode.parentNode.childPointers[0] = parentWeStealFrom.childPointers[childIndex];
            
            parentWeStealFrom.childPointers[childIndex] = null;
            
            let haveNull = parentWeStealFrom.childPointers.includes(null);
            while(haveNull){
              let nullindex;
              nullindex = parentWeStealFrom.childPointers.indexOf(null);
              parentWeStealFrom.childPointers.splice(nullindex,1);
              haveNull = parentWeStealFrom.childPointers.includes(null);
            }

            //adjusting haskeys 
            let x, y, z;
            let hashIndex = 0;
            let haveIndex = false;
            z = mergedNode.parentNode.keyvalues[0];
            
            //stealing from left, hence we need the biggest hashkey
            let tmpIndex:number = parentWeStealFrom.keyvalues.length-1;
            x = parentWeStealFrom.keyvalues[tmpIndex];
            
            while(!haveIndex){
              if(parentWeStealFrom.parentNode.keyvalues[hashIndex] > x && parentWeStealFrom.parentNode.keyvalues[hashIndex] < z){
                haveIndex = true;
              } else {hashIndex++;}
            }
            y = parentWeStealFrom.parentNode.keyvalues[hashIndex];

            //adjusting parentNode
            let xInd, yInd, zInd;
            xInd = parentWeStealFrom.keyvalues.indexOf(x);
            yInd = parentWeStealFrom.parentNode.keyvalues.indexOf(y);
            zInd = mergedNode.parentNode.keyvalues.indexOf(z);

            parentWeStealFrom.keyvalues.splice(xInd,1);
            parentWeStealFrom.parentNode.keyvalues[yInd] = x;
            mergedNode.parentNode.keyvalues[zInd] = y;

            stolenChild.parentNode = mergedNode.parentNode;
          
          }//End of Sibling Trasfer

        }
        
        else if(node.nextLeaf!=null && node.parentNode==node.nextLeaf.parentNode){
          //===== Logs for checking if code is running correctly =====
          console.log("Mering with next leaf ");
          //===== Logs over =====
          
          max_keyvalue = node.keyvalues[0];

          //adjusting the pointers
          if(node.prevLeaf != null){ if(node.prevLeaf.nextLeaf != null && node.nextLeaf != null){node.prevLeaf.nextLeaf = node.nextLeaf;} }
          if(node.nextLeaf != null){ if(node.nextLeaf.prevLeaf != null && node.prevLeaf != null){node.nextLeaf.prevLeaf = node.prevLeaf;} }
          
          //deleting key, and adding the one key left in node to previous leaf
          const ind: number = node.keyvalues.indexOf(key);
          node.keyvalues.splice(ind,1);
          valuesLeft = node.keyvalues;
          node.nextLeaf.keyvalues.push(valuesLeft[0]);
          this.sortKeyValues(node.nextLeaf.keyvalues);
          mergedNode = node.nextLeaf;
          mergedNode.recordnumber = mergedNode.keyvalues.length;

          //deleting node from tree
          node.keyvalues.splice(0,3);
          node.recordnumber = node.keyvalues.length;
          const index = this.myTree.nodes.indexOf(node);
          this.myTree.nodes.splice(index,1);

          //Sibling Transfer
          //If right sibling have 3 or more children, we have to transfer from right, otherwise from left
          if(mergedNode.nextLeaf != null){
            //===== Logs for checking if code is running correctly =====
            console.log("Transferring sibling from the right side");
            //===== Logs over =====

            let parentWeStealFrom = mergedNode.nextLeaf.parentNode;
            let childIndex = parentWeStealFrom.childPointers.indexOf(mergedNode.nextLeaf);
            let stolenChild = parentWeStealFrom.childPointers[childIndex];

            //adjusting childPointers
            mergedNode.parentNode.childPointers.push(null);
            mergedNode.parentNode.childPointers[0] = mergedNode;
            mergedNode.parentNode.childPointers[1] = parentWeStealFrom.childPointers[childIndex];
            
            parentWeStealFrom.childPointers[childIndex] = null;
            
            let haveNull = parentWeStealFrom.childPointers.includes(null);
            while(haveNull){
              let nullindex;
              nullindex = parentWeStealFrom.childPointers.indexOf(null);
              parentWeStealFrom.childPointers.splice(nullindex,1);
              haveNull = parentWeStealFrom.childPointers.includes(null);
            }

            //adjusting haskeys
            let x, y, z;
            let hashIndex = 0;
            let haveIndex = false;
            x = mergedNode.parentNode.keyvalues[0];
            
            //stealing from right, hence we need the smallest hashkey
            z = parentWeStealFrom.keyvalues[0];
            
            while(!haveIndex){
              if(parentWeStealFrom.parentNode.keyvalues[hashIndex] > x && parentWeStealFrom.parentNode.keyvalues[hashIndex] < z){
                haveIndex = true;
              } else {hashIndex++;}
            }
            y = parentWeStealFrom.parentNode.keyvalues[hashIndex];

            //adjusting parentNode
            let xInd, yInd, zInd;
            xInd = mergedNode.parentNode.keyvalues.indexOf(x);
            yInd = parentWeStealFrom.parentNode.keyvalues.indexOf(y);
            zInd = parentWeStealFrom.keyvalues.indexOf(z);

            parentWeStealFrom.keyvalues.splice(zInd,1);
            parentWeStealFrom.parentNode.keyvalues[yInd] = z;
            mergedNode.parentNode.keyvalues[xInd] = y;

            stolenChild.parentNode = mergedNode.parentNode;

          } else {
            //===== Logs for checking if code is running correctly =====
            console.log("Transferring sibling from the left side");
            //===== Logs over =====
            
            let parentWeStealFrom = mergedNode.prevLeaf.parentNode;
            let childIndex = parentWeStealFrom.childPointers.indexOf(mergedNode.prevLeaf);
            let stolenChild = parentWeStealFrom.childPointers[childIndex];

            //adjusting childPointers
            mergedNode.parentNode.childPointers.push(null);
            mergedNode.parentNode.childPointers[1] = mergedNode;
            mergedNode.parentNode.childPointers[0] = parentWeStealFrom.childPointers[childIndex];
            parentWeStealFrom.childPointers[childIndex].parentNode = mergedNode.parentNode;

            parentWeStealFrom.childPointers[childIndex] = null;
            
            let haveNull = parentWeStealFrom.childPointers.includes(null);
            while(haveNull){
              let nullindex;
              nullindex = parentWeStealFrom.childPointers.indexOf(null);
              parentWeStealFrom.childPointers.splice(nullindex,1);
              haveNull = parentWeStealFrom.childPointers.includes(null);
            }

            //adjusting haskeys 
            let x, y, z;
            let hashIndex = 0;
            let haveIndex = false;
            z = mergedNode.parentNode.keyvalues[0];
            
            //stealing from left, hence we need the biggest hashkey
            let tmpIndex:number = parentWeStealFrom.keyvalues.length-1;
            x = parentWeStealFrom.keyvalues[tmpIndex];
            
            while(!haveIndex){
              if(parentWeStealFrom.parentNode.keyvalues[hashIndex] > x && parentWeStealFrom.parentNode.keyvalues[hashIndex] < z){
                haveIndex = true;
              } else {hashIndex++;}
            }
            y = parentWeStealFrom.parentNode.keyvalues[hashIndex];

            //adjusting parentNode
            let xInd, yInd, zInd;
            xInd = parentWeStealFrom.keyvalues.indexOf(x);
            yInd = parentWeStealFrom.parentNode.keyvalues.indexOf(y);
            zInd = mergedNode.parentNode.keyvalues.indexOf(z);

            parentWeStealFrom.keyvalues.splice(xInd,1);
            parentWeStealFrom.parentNode.keyvalues[yInd] = x;
            mergedNode.parentNode.keyvalues[zInd] = y;

            stolenChild.parentNode = mergedNode.parentNode;

          }//End of Sibling Trasfer
        }
        return [null, -1];
      
      //LEVEL REDUCTION
      } else if (notEnoughOnRight || notEnoughOnLeft){
        //===== Logs for checking if code is running correctly =====
        console.log("ELSE IF A MERGE-BEN -> notEnoughChildrenDifferentParent");
        console.log("node: " + node.keyvalues);
        console.log("node.parentNode: " + node.parentNode.keyvalues);
        console.log("node.parentNode.parentNode: " + node.parentNode.parentNode.keyvalues);
        console.log("notEnoughOnRight: " + notEnoughOnRight);
        console.log("notEnoughOnLeft: " + notEnoughOnLeft);
        //===== Logs over =====
        
        if(node.nextLeaf!=null && node.parentNode==node.nextLeaf.parentNode){
          console.log("node.nextLeaf!=null && node.parentNode==node.nextLeaf.parentNode");
          let parentWeMerge = null;
          if(node.parentNode==node.parentNode.parentNode.childPointers[0]){
            parentWeMerge = node.nextLeaf.nextLeaf.parentNode;
          } else {
            parentWeMerge = node.prevLeaf.parentNode;
          }
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);

          //deleting key, and adding the one key left in node to next leaf
          let ind = node.keyvalues.indexOf(key);
          node.keyvalues.splice(ind,1);
          valuesLeft = node.keyvalues;
          node.nextLeaf.keyvalues.push(valuesLeft[0]);
          this.sortKeyValues(node.nextLeaf.keyvalues);
          console.log("AFTER SORT node.nextLeaf.keyvalues: " + node.nextLeaf.keyvalues);
          node.nextLeaf.recordnumber = node.nextLeaf.keyvalues.length;
          mergedNode = node.nextLeaf;

          //deleting node from tree
          node.keyvalues.splice(0,3);
          node.recordnumber = node.keyvalues.length;
          let index = this.myTree.nodes.indexOf(node);
          this.myTree.nodes.splice(index,1);

          //child pointer adjustment
          if(mergedNode.keyvalues[0]<parentWeMerge.keyvalues[0]) {
            parentWeMerge.childPointers.push(null);
            parentWeMerge.childPointers[2] = parentWeMerge.childPointers[1];
            parentWeMerge.childPointers[1] = parentWeMerge.childPointers[0];
            parentWeMerge.childPointers[0] = mergedNode;
          } else {
            parentWeMerge.childPointers.push(null);
            parentWeMerge.childPointers[2] = mergedNode;
          }

          let haveNull = parentWeMerge.childPointers.includes(null);
          while(haveNull){
            let nullindex;
            nullindex = parentWeMerge.childPointers.indexOf(null);
            parentWeMerge.childPointers.splice(nullindex,1);
            haveNull = parentWeMerge.childPointers.includes(null);
          }

          //modifying root
          console.log("modifying root part");
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);
          console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues); console.log("isRoot? " + parentWeMerge.parentNode.isRoot);
          
          if(!parentWeMerge.parentNode.isRoot){
            console.log("!parentWeMerge.parentNode.isRoot TEST!!!!!!!!!!!!!!!");
            
            if(parentWeMerge.parentNode==this.myTree.root.childPointers[0]){
              console.log("this.myTree.root.childPointers[0]: " + this.myTree.root.childPointers[0].keyvalues);
              console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues);
              //merging nodes
              parentWeMerge.keyvalues.push(parentWeMerge.parentNode.keyvalues[0]);
              this.sortKeyValues(parentWeMerge.keyvalues);
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(parentWeMerge.parentNode);
              this.myTree.nodes.splice(index,1);
              //pointer adjustment
              this.myTree.root.childPointers[0] = parentWeMerge;
              parentWeMerge.parentNode = this.myTree.root;
              //root merge with child
              this.myTree.root.keyvalues.push(this.myTree.root.childPointers[1].keyvalues[0]);
              this.sortKeyValues(this.myTree.root.keyvalues);
              //root childpointer adjustment
              this.myTree.root.childPointers.push(this.myTree.root.childPointers[1].childPointers[0]);
              this.myTree.root.childPointers.push(this.myTree.root.childPointers[1].childPointers[1]);
              this.myTree.root.childPointers[1].childPointers[0].parentNode = this.myTree.root;
              this.myTree.root.childPointers[1].childPointers[1].parentNode = this.myTree.root;
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(this.myTree.root.childPointers[1]);
              this.myTree.nodes.splice(index,1);
            } else {
              console.log("this.myTree.root.childPointers[0]: " + this.myTree.root.childPointers[0].keyvalues);
              console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues);
              //merging nodes
              parentWeMerge.keyvalues.push(parentWeMerge.parentNode.keyvalues[0]);
              this.sortKeyValues(parentWeMerge.keyvalues);
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(parentWeMerge.parentNode);
              this.myTree.nodes.splice(index,1);
              //pointer adjustment
              this.myTree.root.childPointers[2] = parentWeMerge;
              parentWeMerge.parentNode = this.myTree.root;
              //root merge with child
              this.myTree.root.keyvalues.push(this.myTree.root.childPointers[0].keyvalues[0]);
              this.sortKeyValues(this.myTree.root.keyvalues);
              //root childpointer adjustment
              this.myTree.root.childPointers[0] = this.myTree.root.childPointers[0].childPointers[0];
              this.myTree.root.childPointers[1] = this.myTree.root.childPointers[0].childPointers[1];
              this.myTree.root.childPointers[0].childPointers[0].parentNode = this.myTree.root;
              this.myTree.root.childPointers[0].childPointers[1].parentNode = this.myTree.root;
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(this.myTree.root.childPointers[0]);
              this.myTree.nodes.splice(index,1);

            }

          } else {
            parentWeMerge.keyvalues.push(this.myTree.root.keyvalues[0]);
            this.sortKeyValues(parentWeMerge.keyvalues);

            index = this.myTree.nodes.indexOf(this.myTree.root);
            this.myTree.nodes.splice(index,1);

            this.myTree.root=parentWeMerge;

            parentWeMerge.isRoot=true;
            parentWeMerge.parentNode=null;
            parentWeMerge.recordnumber=parentWeMerge.keyvalues.length;
          }

          //===== Logs for checking if code is running correctly =====
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);
          console.log("!!!!! parentWeMerge.recordnumber=parentWeMerge.keyvalues.length !!!!!");
          console.log("parentWeMerge.recordnumber: " + parentWeMerge.recordnumber);
          console.log("parentWeMerge.keyvalues.length: " + parentWeMerge.keyvalues.length);
          for(let i=0; i<parentWeMerge.childPointers.length; i++){
            console.log("parentWeMerge.childPointer: " + i + ". INDEX: " + parentWeMerge.childPointers[i].keyvalues);
          }
          for(let i=0; i<this.myTree.nodes.length; i++){
            console.log("myTree.node: " + i + ". INDEX: " + this.myTree.nodes[i].keyvalues);
          }
          //===== Logs over =====
          return [null, -1];

        } else if(node.prevLeaf!=null && node.parentNode==node.prevLeaf.parentNode){
          console.log("node.prevLeaf!=null && node.parentNode==node.prevLeaf.parentNode");
          let parentWeMerge = null;
          if(node.parentNode==node.parentNode.parentNode.childPointers[1]){
            parentWeMerge = node.prevLeaf.prevLeaf.parentNode;
          } else {
            parentWeMerge = node.nextLeaf.parentNode;
          }
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);

          //deleting key, and adding the one key left in node to next leaf
          let ind = node.keyvalues.indexOf(key);
          node.keyvalues.splice(ind,1);
          valuesLeft = node.keyvalues;
          node.prevLeaf.keyvalues.push(valuesLeft[0]);
          this.sortKeyValues(node.prevLeaf.keyvalues);
          console.log("AFTER SORT node.prevLeaf.keyvalues: " + node.prevLeaf.keyvalues);
          node.prevLeaf.recordnumber = node.prevLeaf.keyvalues.length;
          mergedNode = node.prevLeaf;

          //deleting node from tree
          node.keyvalues.splice(0,3);
          node.recordnumber = node.keyvalues.length;
          let index = this.myTree.nodes.indexOf(node);
          this.myTree.nodes.splice(index,1);

          // !!!!!!!!!!! child pointer adjustment
          if(mergedNode.keyvalues[0]<parentWeMerge.keyvalues[0]) {
            parentWeMerge.childPointers.push(null);
            parentWeMerge.childPointers[2] = parentWeMerge.childPointers[1];
            parentWeMerge.childPointers[1] = parentWeMerge.childPointers[0];
            parentWeMerge.childPointers[0] = mergedNode;
          } else {
            parentWeMerge.childPointers.push(null);
            parentWeMerge.childPointers[2] = mergedNode;
          }

          let haveNull = parentWeMerge.childPointers.includes(null);
          while(haveNull){
            let nullindex;
            nullindex = parentWeMerge.childPointers.indexOf(null);
            parentWeMerge.childPointers.splice(nullindex,1);
            haveNull = parentWeMerge.childPointers.includes(null);
          }

          //modifying root
          console.log("modifying root part");
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);
          console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues); console.log("isRoot? " + parentWeMerge.parentNode.isRoot);
          
          if(!parentWeMerge.parentNode.isRoot){
            console.log("!parentWeMerge.parentNode.isRoot TEST!!!!!!!!!!!!!!!");
            
            if(parentWeMerge.parentNode==this.myTree.root.childPointers[0]){
              console.log("this.myTree.root.childPointers[0]: " + this.myTree.root.childPointers[0].keyvalues);
              console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues);
              //merging nodes
              parentWeMerge.keyvalues.push(parentWeMerge.parentNode.keyvalues[0]);
              this.sortKeyValues(parentWeMerge.keyvalues);
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(parentWeMerge.parentNode);
              this.myTree.nodes.splice(index,1);
              //pointer adjustment
              this.myTree.root.childPointers[0] = parentWeMerge;
              parentWeMerge.parentNode = this.myTree.root;
              //root merge with child
              this.myTree.root.keyvalues.push(this.myTree.root.childPointers[1].keyvalues[0]);
              this.sortKeyValues(this.myTree.root.keyvalues);
              //root childpointer adjustment
              this.myTree.root.childPointers.push(this.myTree.root.childPointers[1].childPointers[0]);
              this.myTree.root.childPointers.push(this.myTree.root.childPointers[1].childPointers[1]);
              this.myTree.root.childPointers[1].childPointers[0].parentNode = this.myTree.root;
              this.myTree.root.childPointers[1].childPointers[1].parentNode = this.myTree.root;
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(this.myTree.root.childPointers[1]);
              this.myTree.nodes.splice(index,1);
            } else {
              console.log("this.myTree.root.childPointers[0]: " + this.myTree.root.childPointers[0].keyvalues);
              console.log("parentWeMerge.parentNode: " + parentWeMerge.parentNode.keyvalues);
              //merging nodes
              parentWeMerge.keyvalues.push(parentWeMerge.parentNode.keyvalues[0]);
              this.sortKeyValues(parentWeMerge.keyvalues);
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(parentWeMerge.parentNode);
              this.myTree.nodes.splice(index,1);
              //pointer adjustment
              this.myTree.root.childPointers[2] = parentWeMerge;
              parentWeMerge.parentNode = this.myTree.root;
              //root merge with child
              this.myTree.root.keyvalues.push(this.myTree.root.childPointers[0].keyvalues[0]);
              this.sortKeyValues(this.myTree.root.keyvalues);
              //root childpointer adjustment
              this.myTree.root.childPointers[0] = this.myTree.root.childPointers[0].childPointers[0];
              this.myTree.root.childPointers[1] = this.myTree.root.childPointers[0].childPointers[1];
              this.myTree.root.childPointers[0].childPointers[0].parentNode = this.myTree.root;
              this.myTree.root.childPointers[0].childPointers[1].parentNode = this.myTree.root;
              //deleting unnecessary node
              index = this.myTree.nodes.indexOf(this.myTree.root.childPointers[0]);
              this.myTree.nodes.splice(index,1);

            }

          } else {
            parentWeMerge.keyvalues.push(this.myTree.root.keyvalues[0]);
            this.sortKeyValues(parentWeMerge.keyvalues);

            index = this.myTree.nodes.indexOf(this.myTree.root);
            this.myTree.nodes.splice(index,1);

            this.myTree.root=parentWeMerge;

            parentWeMerge.isRoot=true;
            parentWeMerge.parentNode=null;
            parentWeMerge.recordnumber=parentWeMerge.keyvalues.length;
          }

          //===== Logs for checking if code is running correctly =====
          console.log("parentWeMerge: " + parentWeMerge.keyvalues);
          console.log("!!!!! parentWeMerge.recordnumber=parentWeMerge.keyvalues.length !!!!!");
          console.log("parentWeMerge.recordnumber: " + parentWeMerge.recordnumber);
          console.log("parentWeMerge.keyvalues.length: " + parentWeMerge.keyvalues.length);
          for(let i=0; i<parentWeMerge.childPointers.length; i++){
            console.log("parentWeMerge.childPointer: " + i + ". INDEX: " + parentWeMerge.childPointers[i].keyvalues);
          }
          for(let i=0; i<this.myTree.nodes.length; i++){
            console.log("myTree.node: " + i + ". INDEX: " + this.myTree.nodes[i].keyvalues);
          }
          //===== Logs over =====
          return [null, -1];

        }
        return [null, -1];
      }

  }

  //
  // === Searching nodes in the tree ===
  //
  search(containKey: boolean, key: number){

    this.actual_node = this.myTree.root;
    var stack:Array<Node> = [];
    var child_index;
    if(containKey){
      this.searchRout = "A keresett szám benne van a fában, helye: ";
    } else {
      this.searchRout = "A keresett szám nincs benne a fában, de itt lenne a helye: ";
    }

    stack.push(this.actual_node);

    while(!this.actual_node.isLeaf){

      if(key < this.actual_node.keyvalues[0] && this.actual_node != null) { 
          child_index = 0;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      } 
      else if(key >= this.actual_node.keyvalues[0] && this.actual_node.keyvalues[1]==null && this.actual_node != null) {
          child_index = 1;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      }
      else if (this.actual_node.keyvalues[0] <= key && key < this.actual_node.keyvalues[1] && this.actual_node != null) { 
          child_index = 1;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      } 
      else if(key >= this.actual_node.keyvalues[1] && this.actual_node.keyvalues[2]==null && this.actual_node != null) {
          child_index = 2;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      }
      else if (this.actual_node.keyvalues[1] <= key && key< this.actual_node.keyvalues[2]&& this.actual_node != null) { 
          child_index = 2;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      } 
      else if (key >= this.actual_node.keyvalues[2] && this.actual_node != null) { 
          child_index = 3;
          this.actual_node = this.actual_node.childPointers[child_index];
          stack.push(this.actual_node); 
      }
    }
    
    stack.reverse();

    while(stack.length!=0){
      this.searchRout = this.searchRout + '[';
      this.actual_node = stack.pop();
      for(let i = 0; i < this.actual_node.keyvalues.length; i++){
        this.searchRout = this.searchRout + this.actual_node.keyvalues[i].toString();
        if(i!=this.actual_node.keyvalues.length-1){this.searchRout = this.searchRout + ' , ';}
      }
      if(stack.length!=0){
        this.searchRout = this.searchRout + '] ➜';
      } else {
        this.searchRout = this.searchRout + ']';
      }
    }
    console.log(containKey);
    console.log(this.searchRout);
    this.drawTree();

  }


  //
  // === Inserting nodes in the tree ===
  //
  insert(key: number){
    
    //===== Logs for checking if code is running correctly =====
    console.log("\n\nInsert( key: " + key + " )");
    //===== Logs over =====

    this.myTree.logs.push(new Log("insert", key));

      if(this.first_node){
          var returns;
          var newNode = new Node();
          newNode.isRoot=true;
          newNode.isLeaf=true;
          this.myTree.root = newNode;
          this.myTree.nodes.push(newNode);
          returns=this.addKey(newNode, key);
          this.first_node=false;
      } else {

          this.actual_node = this.myTree.root;
          var stack:Array<Node> = [];
          var child_index;
          stack.push(this.actual_node);

          //we need to find the appropriate leaf_node to intesrt the key into
          while(!this.actual_node.isLeaf){

            //===== Logs for checking if code is running correctly =====
            console.log("While loop - searching for leaf node");
            //===== Logs over =====

            if(key < this.actual_node.keyvalues[0] && this.actual_node != null) { 
                child_index = 0;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[0] && this.actual_node.keyvalues[1]==null && this.actual_node != null) {
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[0] <= key && key < this.actual_node.keyvalues[1] && this.actual_node != null) { 
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[1] && this.actual_node.keyvalues[2]==null && this.actual_node != null) {
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[1] <= key && key< this.actual_node.keyvalues[2]&& this.actual_node != null) { 
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if (key >= this.actual_node.keyvalues[2] && this.actual_node != null) { 
                child_index = 3;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
          }
          
          var returnedValues;                   // the returned values of addKey() function;
          var returnedNode:Node;                // which will be created by the split method;
          this.actual_node = stack.pop();

          // DO: addKey(), 
          // WHILE: the addKey() returns -1, which means there were no more splits needed.
          do{
              returnedValues = this.addKey(this.actual_node, key);
              
              returnedNode = returnedValues[0];
              key = returnedValues[1];
                            
              //popping out the parent node
              this.actual_node = stack.pop();

              if(this.actual_node != null && returnedNode != null){
                //adjusting child pointers
                let counter=0;
                let children_counter = [];
                for(let i of this.actual_node.childPointers){
                  children_counter.push(counter);
                  counter++;
                }
                children_counter.push(counter);

                let next = this.actual_node.childPointers[0];
                for(let i in children_counter){
                  this.actual_node.childPointers[i] = next;
                  next=this.actual_node.childPointers[i].nextLeaf;
                }

                //cleaning out unnecessary nulls
                let haveNull = this.actual_node.childPointers.includes(null);
                
                while(haveNull){
                  let nullindex;
                  nullindex = this.actual_node.childPointers.indexOf(null);
                  this.actual_node.childPointers.splice(nullindex,1);
                  haveNull = this.actual_node.childPointers.includes(null);
                }

                //setting the parentNodes
                for(let i = 0; i < this.actual_node.childPointers.length; i++){
                  this.actual_node.childPointers[i].parentNode = this.actual_node;
                }

                if(this.actual_node.keyvalues.length!=3){
                  var c = this.actual_node.keyvalues.length+1;
                  this.actual_node.childPointers.splice(c+1, this.actual_node.childPointers.length);
                }

                returnedValues = this.addKey(this.actual_node,key);
                returnedNode = returnedValues[0];
                key = returnedValues[1];
                
                //creating new root and setting parent nodes
                if(returnedNode!= null && !returnedNode.isLeaf){
                  
                  if(this.actual_node.parentNode == null){
                    
                    //===== Logs for checking if code is running correctly =====
                    console.log("Still have a key to insert but no parent");
                    //===== Logs over =====

                    this.actual_node.isRoot=false;

                    var newRoot = new Node();
                    newRoot.isRoot = true;
                    newRoot.childPointers[0] = this.actual_node;
                    newRoot.childPointers[1] = returnedNode;
                    
                    this.actual_node.parentNode = newRoot;
                    returnedNode.parentNode = newRoot;
                    
                    //setting the parentNodes
                    for(let i = 0; i < returnedNode.childPointers.length; i++){
                      returnedNode.childPointers[i].parentNode = returnedNode;
                    }

                    returnedValues = this.addKey(newRoot, key);
                    returnedNode = returnedValues[0];
                    key = returnedValues[1];
                    
                    this.myTree.root = newRoot; 
                    this.myTree.nodes.push(newRoot);
                  
                  } else {
                    //===== Logs for checking if code is running correctly =====
                    console.log("Still have a key to insert and we still have a parent");
                    //===== Logs over =====

                    this.actual_node = stack.pop();
                    returnedNode.parentNode = this.actual_node;
                    
                    //===== Logs for checking if code is running correctly =====
                    console.log("returnedNode.parentNode.keyvalues:  " + returnedNode.parentNode.keyvalues);
                    console.log("this.actual_node:  " + this.actual_node.keyvalues); 
                    console.log("this.actual_node.childPointers"); 
                    if(this.actual_node.childPointers[0]!=null){console.log("child_0: " + this.actual_node.childPointers[0].keyvalues);}
                    if(this.actual_node.childPointers[1]!=null){console.log("child_1: " + this.actual_node.childPointers[1].keyvalues);}
                    if(this.actual_node.childPointers[2]!=null){console.log("child_2: " + this.actual_node.childPointers[2].keyvalues);}
                    if(this.actual_node.childPointers[3]!=null){console.log("child_3: " + this.actual_node.childPointers[3].keyvalues);}
                    //===== Logs over =====

                    //adjusting childPointers
                    let tmpHashKey = returnedNode.keyvalues[0]; console.log("tmpHashKey:  " + tmpHashKey);
                    let childIndex = 0;
                    let haveIndex = false;
                    while(!haveIndex){
                      if(this.actual_node.childPointers[childIndex].keyvalues[0] > tmpHashKey){ //Error: Uncaught (in promise): TypeError: Cannot read properties of undefined (reading 'keyvalues')
                        //===== Logs for checking if code is running correctly =====
                        if(this.actual_node.childPointers[childIndex]!=null){
                          console.log("this.actual_node.childPointers in WHILE");
                          console.log(this.actual_node.childPointers[childIndex].keyvalues);
                        }
                        //===== Logs over =====
                        console.log("haveIndex = true");
                        haveIndex = true;
                      } else if (this.actual_node.childPointers[childIndex+1]==null) {
                        console.log("IF this.actual_node.childPointers[childIndex+1]==null");
                        childIndex++;
                        haveIndex = true;
                      } else {
                        console.log("childIndex++");
                        childIndex++;
                      }
                    }
                    this.actual_node.childPointers.push(null);

                    //===== Logs for checking if code is running correctly =====
                    console.log("this.actual_node:  " + this.actual_node.keyvalues); 
                    console.log("this.actual_node.childPointers"); 
                    if(this.actual_node.childPointers[0]!=null){console.log("child_0: " + this.actual_node.childPointers[0].keyvalues);}
                    if(this.actual_node.childPointers[1]!=null){console.log("child_1: " + this.actual_node.childPointers[1].keyvalues);}
                    if(this.actual_node.childPointers[2]!=null){console.log("child_2: " + this.actual_node.childPointers[2].keyvalues);}
                    if(this.actual_node.childPointers[3]!=null){console.log("child_3: " + this.actual_node.childPointers[3].keyvalues);}
                    console.log("this.actual_node.childPointers.length:  " + this.actual_node.childPointers.length);
                    //===== Logs over =====

                    for(let i = this.actual_node.childPointers.length-1; i>=childIndex; i--){
                      //===== Logs for checking if code is running correctly =====
                      console.log("i: "+ i);
                      console.log("i-1: "+ (i-1));
                      if(this.actual_node.childPointers[i]!=null){console.log("this.actual_node.childPointers[i]: "+ this.actual_node.childPointers[i].keyvalues);}
                      if(this.actual_node.childPointers[i-1]!=null){console.log("this.actual_node.childPointers[i-1]: "+ this.actual_node.childPointers[i-1].keyvalues);}
                      //===== Logs over =====
                      this.actual_node.childPointers[i] = this.actual_node.childPointers[i-1];
                    }
                    //===== Logs for checking if code is running correctly =====
                    console.log("this.actual_node:  " + this.actual_node.keyvalues); 
                    console.log("this.actual_node.childPointers"); 
                    if(this.actual_node.childPointers[0]!=null){console.log("child_0: " + this.actual_node.childPointers[0].keyvalues);}
                    if(this.actual_node.childPointers[1]!=null){console.log("child_1: " + this.actual_node.childPointers[1].keyvalues);}
                    if(this.actual_node.childPointers[2]!=null){console.log("child_2: " + this.actual_node.childPointers[2].keyvalues);}
                    if(this.actual_node.childPointers[3]!=null){console.log("child_3: " + this.actual_node.childPointers[3].keyvalues);}
                    console.log("this.actual_node.childPointers.length:  " + this.actual_node.childPointers.length);
                    //===== Logs over =====
                    console.log("childIndex: " + childIndex);
                    console.log("returnedNode: " + returnedNode.keyvalues);
                    this.actual_node.childPointers[childIndex] = returnedNode;

                    returnedValues = this.addKey(this.actual_node,key);
                    returnedNode = returnedValues[0];
                    key = returnedValues[1];
                    //===== Logs for checking if code is running correctly =====
                    console.log("Returns:"); if(returnedNode!=null){console.log("node: " + returnedNode.keyvalues);}else{console.log(null)} console.log("key: " + key);
                    //===== Logs over =====
                  }
                  
                }
                  
              } else if (this.actual_node == null  && key != -1) {

                //create new root node
                var newRoot = new Node();
                newRoot.isRoot = true;

                //setting parent node
                returnedNode.parentNode = newRoot;
                returnedNode.prevLeaf.parentNode = newRoot;

                newRoot.childPointers[0] = returnedNode.prevLeaf;
                newRoot.childPointers[1] = returnedNode;

                if(returnedNode.nextLeaf!=null ) { 
                  newRoot.childPointers[2] = returnedNode.nextLeaf;
                  returnedNode.nextLeaf.parentNode = newRoot;
                  if(returnedNode.nextLeaf.nextLeaf!=null){
                    newRoot.childPointers[3] = returnedNode.nextLeaf.nextLeaf;
                    returnedNode.nextLeaf.nextLeaf.parentNode = newRoot;
                  }
                }

                returnedValues = this.addKey(newRoot,key);
                returnedNode = returnedValues[0];
                key = returnedValues[1];
                this.myTree.root = newRoot;
                this.myTree.nodes.push(newRoot);
              }
              
          } while(key != -1  && this.actual_node != null);
      
      }

      this.buildTree();
      this.drawTree();
  }


  //
  // === Removing nodes from the tree ===
  //
  delete(key: number){

    //===== Logs for checking if code is running correctly =====
    console.log("\n\nDelete( key: " + key + " )");
    //===== Logs over =====

    this.myTree.logs.push(new Log("delete", key));

        this.actual_node = this.myTree.root;
        var stack:Array<Node> = [];
        var child_index = 0;
        stack.push(this.actual_node);

          //we need to find the appropriate leaf_node to delete the key from  
          while(!this.actual_node.isLeaf){
            
            //===== Logs for checking if code is running correctly =====
            console.log("While loop - searching for leaf node");
            //===== Logs over =====

            if(key < this.actual_node.keyvalues[0] && this.actual_node != null) { 
                console.log("DELETE -> WHILE LEAF NODE -> X < A");
                child_index = 0;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[0] && this.actual_node.keyvalues[1]==null && this.actual_node != null) 
            {
                console.log("DELETE -> WHILE LEAF NODE -> X >= A & NINCS B");
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[0] <= key && key < this.actual_node.keyvalues[1] && this.actual_node != null) { 
                console.log("DELETE -> WHILE LEAF NODE -> A <= X <B");
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[1] && this.actual_node.keyvalues[2]==null && this.actual_node != null) 
            {
                console.log("DELETE -> WHILE LEAF NODE ->  X >= B & NINCS C");
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[1] <= key && key< this.actual_node.keyvalues[2]&& this.actual_node != null) { 
                console.log("DELETE -> WHILE LEAF NODE -> B <= X < C");
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if (key >= this.actual_node.keyvalues[2] && this.actual_node != null) { 
                console.log("DELETE -> WHILE LEAF NODE -> X >= C");
                child_index = 3;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else {console.log("üres else"); break;}
            console.log("WHILE - this.actual_node");
            console.log(this.actual_node.keyvalues);
          }
          
          console.log("while után");
          var returnedValues;                   // the returned values of addKey() function;
          var returnedNode:Node;                // which will be created by the split method;
          this.actual_node = stack.pop();

          //if the key we are deleting is alone in a LEAF and it is also the root -> restart tree building 
          if(this.actual_node.isLeaf && this.actual_node.isRoot && this.actual_node.keyvalues.length<3){
            console.log("isLeaf && isRoot && keyvalues.length<3");
            this.removeKey(this.actual_node,key);
          }

          //if possible, steal from left sibling
          if( this.actual_node.prevLeaf!=null && this.actual_node.prevLeaf.keyvalues.length==3 ){
            
            //===== Logs for checking if code is running correctly =====
            console.log("Stealing from right sibling");
            //===== Logs over =====

            //the original hashKey which will be changed  
            var hashkey_to_change = this.actual_node.keyvalues[0];

            //deleting the key the user_input key
            const ind: number = this.actual_node.keyvalues.indexOf(key);
            this.actual_node.keyvalues.splice(ind, 1);
            this.actual_node.recordnumber=this.actual_node.keyvalues.length;
              
            const valuesToSplit = Object.assign([]);
            for(let key of this.actual_node.keyvalues){
              if (key!=null) { valuesToSplit.push(key); }
            }
            for(let key of this.actual_node.prevLeaf.keyvalues){
              if (key!=null) { valuesToSplit.push(key); }
            }
            this.sortKeyValues(valuesToSplit);
              
            this.actual_node.keyvalues.splice(0,this.actual_node.keyvalues.length);
            this.actual_node.prevLeaf.keyvalues.splice(0,this.actual_node.prevLeaf.keyvalues.length);
            
            this.actual_node.keyvalues.push(valuesToSplit[2]);
            this.actual_node.keyvalues.push(valuesToSplit[3]);
            this.actual_node.prevLeaf.keyvalues.push(valuesToSplit[0]);
            this.actual_node.prevLeaf.keyvalues.push(valuesToSplit[1]);
            
            //changing the hashkey in parent node
            this.actual_node = stack.pop();
            //===== Logs for checking if code is running correctly =====
            console.log("Changing the hashkey in the parent node");
            console.log("Current node: " + this.actual_node.keyvalues);
            //===== Logs over =====

            const index: number = this.actual_node.keyvalues.indexOf(hashkey_to_change);
            this.actual_node.keyvalues[index] = valuesToSplit[2];

            //cleaning out unnecessary nulls
            let haveNull = this.actual_node.childPointers.includes(null);

            while(haveNull){
              let nullindex;
              nullindex = this.actual_node.childPointers.indexOf(null);
              this.actual_node.childPointers.splice(nullindex,1);
              haveNull = this.actual_node.childPointers.includes(null);
            }
          
            key = -1;
          
          } 

          //if possible, steal from right sibling
          else if(this.actual_node.nextLeaf!=null && this.actual_node.nextLeaf.keyvalues.length==3){
            
            //===== Logs for checking if code is running correctly =====
            console.log("Stealing from right sibling");
            //===== Logs over =====

            //the original hashKey which will be changed  
            var hashkey_to_change = this.actual_node.nextLeaf.keyvalues[0];

            //deleting the key the user_input key
            const ind: number = this.actual_node.keyvalues.indexOf(key);
            this.actual_node.keyvalues.splice(ind, 1);
            this.actual_node.recordnumber=this.actual_node.keyvalues.length;

            const valuesToSplit = Object.assign([]);
            for(let key of this.actual_node.keyvalues){
              if (key!=null) { valuesToSplit.push(key); }
            }
            for(let key of this.actual_node.nextLeaf.keyvalues){
              if (key!=null) { valuesToSplit.push(key); }
            }
            this.sortKeyValues(valuesToSplit);

            this.actual_node.keyvalues.splice(0,this.actual_node.keyvalues.length);
            this.actual_node.nextLeaf.keyvalues.splice(0,this.actual_node.nextLeaf.keyvalues.length);
            
            this.actual_node.keyvalues.push(valuesToSplit[0]);
            this.actual_node.keyvalues.push(valuesToSplit[1]);
            this.actual_node.nextLeaf.keyvalues.push(valuesToSplit[2]);
            this.actual_node.nextLeaf.keyvalues.push(valuesToSplit[3]);
            
            //changing the hashkey in parentnode
            this.actual_node = stack.pop();
            //===== Logs for checking if code is running correctly =====
            console.log("Changing the hashkey in the parent node");
            console.log("Current node: " + this.actual_node.keyvalues);
            //===== Logs over =====
            
            const index: number = this.actual_node.keyvalues.indexOf(hashkey_to_change);
            this.actual_node.keyvalues[index] = valuesToSplit[2];

            //cleaning out unnecessary nulls
            let haveNull = this.actual_node.childPointers.includes(null);

            while(haveNull){
              let nullindex;
              nullindex = this.actual_node.childPointers.indexOf(null);
              this.actual_node.childPointers.splice(nullindex,1);
              haveNull = this.actual_node.childPointers.includes(null);
            }

            key = -1;
          }

          //if NOT possible to STEAL from sibling AND parent nodes need adjustment
          else {
            
            //===== Logs for checking if code is running correctly =====
            console.log("Not able to steal from sibling");
            //===== Logs over =====
            
            while(key!=-1){
              //LOG FOR CHECKING
              console.log("WHILE");
              returnedValues = this.removeKey(this.actual_node, key);
              returnedNode = returnedValues[0]; //the node after the merge //Error: Uncaught (in promise): TypeError: Cannot read properties of undefined (reading '0')
              key = returnedValues[1];          //the hashkey which will be deleted

              //LOGS FOR CHECKING
              console.log("WHILE elején KEY= -1?");
              console.log("[returnedValues]");
              if(returnedNode!=null){console.log("NODE:"+ returnedNode.keyvalues);}else{console.log("NODE:"+ returnedNode);}
              console.log("KEY: " + key);

              //popping out the parent node
              this.actual_node = stack.pop();
              if(this.actual_node!=null){console.log("actual node: " + this.actual_node.keyvalues);}

              //if merge returns with a key and parent has 2 or more hashkeys
              if(this.actual_node != null && this.actual_node.keyvalues.length>=2 && key != -1){
                
                console.log("!!!!!!!!!!!! parent keyvalues BEFORE !!!!!!!!!!!!");
                console.log(this.actual_node.keyvalues);

                //adjusting the key values of the parent node
                const ind: number = this.actual_node.keyvalues.indexOf(key);
                this.actual_node.keyvalues.splice(ind, 1);
                this.sortKeyValues(this.actual_node.keyvalues);
                
                console.log("!!!!!!!!!!!! parent keyvalues AFTER !!!!!!!!!!!!");
                console.log(this.actual_node.keyvalues);
                
                //cleaning out unnecessary nulls
                let haveNull = this.actual_node.childPointers.includes(null);
                
                while(haveNull){
                  let nullindex;
                  nullindex = this.actual_node.childPointers.indexOf(null);
                  this.actual_node.childPointers.splice(nullindex,1);
                  haveNull = this.actual_node.childPointers.includes(null);
                }

                for(let i = 0; i < this.actual_node.childPointers.length; i++){
                  if(this.actual_node.childPointers[i].keyvalues.length == 0){
                    this.actual_node.childPointers.splice(i,1);
                  }
                }

                //LOGS FOR CHECKING
                for(let i=0; i < this.actual_node.childPointers.length-1; i++){
                  console.log("ChildPointers: " + this.actual_node.childPointers[i].keyvalues);
                  console.log("Child's parent: " + this.actual_node.childPointers[i].parentNode.keyvalues);
                }//END OF LOGS

                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!! adjusting parentNodes !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                key = -1;

              }
              
              //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! PARENT ADJUSTING IN UPPER LEVELS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              // if (key != -1){
                // console.log("!!!!!!!!!!!!!!!!!!!!!!! KEY != -1 !!!!!!!!!!!!!!!!!!!!!!!");
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!                
                // if(this.actual_node != null){
                //   console.log(" IF -> ACTUAL NODE != NULL");
                //   if(this.actual_node.keyvalues.length == 1){ 
                //     console.log(" IF -> this.actual_node.keyvalues.length = 1 => LEGYEN KEY = -1");
                //     key=-1 
                //   } else {
                //     console.log(" ELSE -> this.actual_node.keyvalues.length != 1 =>");
                //     //adjusting the key values of the parent node
                //     const ind: number = this.actual_node.keyvalues.indexOf(key);
                //     this.actual_node.keyvalues.splice(ind, 1);
                //     this.sortKeyValues(this.actual_node.keyvalues);

                //     //adjusting childpointers
                //     var counter=0;
                //     var children_counter = [];
                //     for(let i of this.actual_node.childPointers){
                //       children_counter.push(counter);
                //       counter++;
                //     }
                //     children_counter.pop();
                //     //LOG FOR CHECKING
                //     console.log("delete -> not steal from sibling -> childpointer adjusting !!! ELSE !!!");
                //     console.log(children_counter);
                    
                //     var next = this.actual_node.childPointers[0];
                //     //LOG FOR CHECKING
                //     console.log("for");
                //     for(let i in children_counter){
                //       //LOG FOR CHECKING
                //       console.log(this.actual_node.childPointers);
                //       console.log("for cycle - i");
                //       console.log(i);
                //       console.log("actual_node.childPointers[i]:");
                //       console.log(this.actual_node.childPointers[i].keyvalues);

                //       console.log("!!! BEFORE IF !!!");
                //       console.log("actual_node.childpointers[i].keyvalues LENGTH");
                //       console.log(this.actual_node.childPointers[i].keyvalues.length);

                //       if(this.actual_node.childPointers[i].keyvalues.length == 0 ){
                //         console.log("!!! IF !!! for cycle - childpointers");
                //         console.log(this.myTree);
                //         const index = this.actual_node.childPointers.indexOf(this.actual_node.childPointers[i]);
                //         console.log("childpointer index");
                //         console.log(index);
                //         let splicednode = this.actual_node.childPointers.splice(index,1);
                //         console.log("splicednode");
                //         console.log(splicednode);
                //         console.log(this.myTree);

                //         //pointer adjusting
                //         if(this.actual_node.childPointers[i].prevLeaf != null) {
                //           this.actual_node.childPointers[i].prevLeaf.nextLeaf = this.actual_node.childPointers[i].nextLeaf
                //         }
                //         if(this.actual_node.childPointers[i].nextLeaf != null) {
                //           this.actual_node.childPointers[i].nextLeaf.prevLeaf = this.actual_node.childPointers[i].prevLeaf
                //         }

                //         //LOGS FOR CHECKING
                //         for(let i=0; i < this.actual_node.childPointers.length-1; i++){
                //           console.log("ChildPointers: " + this.actual_node.childPointers[i].keyvalues);
                //           console.log("Child's parent: " + this.actual_node.childPointers[i].parentNode.keyvalues);
                //         }//END OF LOGS

                //         console.log("!!! END IF !!!");
                //       }
                //     }
                //   }
                // }
              // }
            }
          }
      console.log("build & draw tree");
      console.log(this.myTree.root.keyvalues);
      this.buildTree();
      this.drawTree();

  }


  //
  // === Creating the format which will help to build the tree ===
  //
  buildTree(){

    this.header = 0;
    this.pointerIndex = 0;
    this.nodeNumbersGlobal = [];

    if(this.myTree.root==null) {
      return;
    } else {

    this.myTreeBuilder = [];
    var root = this.myTree.root;
    var first:Keys[] = [];
    var second:Keys[] = [];
    var third:Keys[] = [];
    var fourth:Keys[] = [];
    var isNull:boolean;    
    var header, x, y, z;
    var arrayLevels:Keys[]=[];
    var numberOfNodes = 0;
    var nodeNumbers:string[] = [];

    //root
    header = numberOfNodes;
    x = root.keyvalues[0], y = root.keyvalues[1], z = root.keyvalues[2];
    arrayLevels.push(new Keys(header,x,y,z));
    this.myTreeBuilder.push(new Builder(1, arrayLevels, nodeNumbers));    

    //first level
    for(var i=0; i<root.childPointers.length; i++){
      isNull=true;
      x=null; y=null; z=null;
      var first_level = root.childPointers;
      if(first_level[i]!=null){
        numberOfNodes++;
        header = numberOfNodes;
        if(first_level[i]!=null) { if(first_level[i].keyvalues[0]!=null){ x = first_level[i].keyvalues[0]; isNull=false; } }
        if(first_level[i]!=null) { if(first_level[i].keyvalues[1]!=null){ y = first_level[i].keyvalues[1]; } }
        if(first_level[i]!=null) { if(first_level[i].keyvalues[2]!=null){ z = first_level[i].keyvalues[2]; } }
        if(!isNull && first!=null) { first.push(new Keys(header,x,y,z)); isNull=true; }
      }

      if(root.childPointers[i]!=null){
        //second level
        for(var j=0; j<root.childPointers[i].childPointers.length; j++){
          var second_level = root.childPointers[i].childPointers;
          isNull=true;
          x=null; y=null; z=null;
          if(second_level[j]!=null){
            numberOfNodes++;
            header = numberOfNodes;
            if(second_level[j].keyvalues[0]!=null){ x = second_level[j].keyvalues[0]; isNull=false;}
            if(second_level[j].keyvalues[1]!=null){ y = second_level[j].keyvalues[1]; }
            if(second_level[j].keyvalues[2]!=null){ z = second_level[j].keyvalues[2]; }
            if(!isNull && second!=null) { second.push(new Keys(header,x,y,z)); isNull=true; }
          }

          if(root.childPointers[i].childPointers[j]!=null){
            //third level
            for(var k=0; k<root.childPointers[i].childPointers[j].childPointers.length; k++){
              isNull=true;
              x=null; y=null; z=null;
              var third_level = root.childPointers[i].childPointers[j].childPointers;
              if(third_level[k]!=null){
                numberOfNodes++;
                header = numberOfNodes;
                if(third_level[k].keyvalues!=null && third_level[k].keyvalues[0]!=null){ x = third_level[k].keyvalues[0]; isNull=false;}
                if(third_level[k].keyvalues!=null && third_level[k].keyvalues[1]!=null){ y = third_level[k].keyvalues[1]; }
                if(third_level[k].keyvalues!=null && third_level[k].keyvalues[2]!=null){ z = third_level[k].keyvalues[2]; }
                if(!isNull && third!=null) { third.push(new Keys(header,x,y,z)); isNull=true; }
              }

              if(root.childPointers[i].childPointers[j].childPointers[n]!=null){
                //fourth level
                for(var n=0; n<root.childPointers[i].childPointers[j].childPointers[n].childPointers.length; n++){
                  isNull=true;
                  x=null; y=null; z=null;
                  var fourth_level = root.childPointers[i].childPointers[j].childPointers[n].childPointers;
                  if(fourth_level[n]!=null){
                    numberOfNodes++;
                    header = numberOfNodes;
                    if(fourth_level[n].keyvalues!=null && fourth_level[n].keyvalues[0]!=null){ x = fourth_level[n].keyvalues[0]; isNull=false;}
                    if(fourth_level[n].keyvalues!=null && fourth_level[n].keyvalues[1]!=null){ y = fourth_level[n].keyvalues[1]; }
                    if(fourth_level[n].keyvalues!=null && fourth_level[n].keyvalues[2]!=null){ z = fourth_level[n].keyvalues[2]; }
                    if(!isNull && fourth!=null) { fourth.push(new Keys(header,x,y,z)); isNull=true; }
                  }
                }
              }
            }
          }
        }
      }
    }

    let queue = [];
    let root_x;
    let level = 0;
    this.levelCounter = [0, 0, 0];
    numberOfNodes = 0;
    for (let i = 0; i < this.myTree.nodes.length; i++) {
      const node = this.myTree.nodes[i];
      if(node.isRoot) {
        root_x = node;
        queue.push(root_x);
        queue.push(null);
      }
    }

    while(queue.length != 0){
      const node = queue[0];
      queue.splice(0,1);
      let counter = 0;
      if(node != null){
        for (let i = 0; i < node.childPointers.length; i++) {
          const child = node.childPointers[i];
          if(child != null){
            counter++;
          }
        }
        if(node != null){
          for (let i = 0; i < node.childPointers.length; i++) {
            const child = node.childPointers[i];
            if(child != null){
              queue.push(child);
              this.levelCounter[level]++;
            }
          }
          for(let i = 0; i < node.childPointers.length; i++){
            const child = node.childPointers[i];
            if(child != null){ 
              this.nodeNumbersGlobal.push(String(++numberOfNodes));
              nodeNumbers.push(String(numberOfNodes));
            }
          }
          for(let i = 0; i < 4 - counter; i++){
            this.nodeNumbersGlobal.push("•");
            nodeNumbers.push("•");
          }
        }
      } else {
        if(queue.length > 0){
          queue.push(null);
          level++;
        }
      }
    }

    if (first.length!=0) { this.myTreeBuilder.push(new Builder(2, first, nodeNumbers)); }
    if (second.length!=0) { this.myTreeBuilder.push(new Builder(3, second, nodeNumbers)); }
    if (third.length!=0) {this.myTreeBuilder.push(new Builder(4, third, nodeNumbers)); }
    if (fourth.length!=0) {this.myTreeBuilder.push(new Builder(5, fourth, nodeNumbers)); }

    let c = 0;
    for(let i = 0; i < this.myTreeBuilder.length; i++){
      const builder = this.myTreeBuilder[i];
      for (let j = 0; j < builder.array_level.length; j++) {
        const key = builder.array_level[j];
        key.header = c++;
      }
    }
  }
  }//end of buildTree()


  //
  // === Calculating the parent child connections ===
  //
  ptr(i:number, j:number, index:number){ 
    if(i == 0){
      if(this.nodeNumbersGlobal[index] != '•'){
        this.counter++;
      }
      return this.nodeNumbersGlobal[index];
    }
    let sum = 1;
    for(let k = 0; k < i-1; k++){
      sum += this.levelCounter[k];
    }
    if(this.nodeNumbersGlobal[((sum + j) * 4) + index] != '•') {
      this.counter++;
    }
    return this.nodeNumbersGlobal[((sum + j) * 4) + index];
  }


  //
  // === Creating the drawing of the tree ===
  //
  drawTree(){
    console.log("drawTree()");
    const myDiv = document.querySelector("#center");
    myDiv.innerHTML = "";
    let nodeTable = "";
        
    //<table class="level" *ngFor="let object of myTreeBuilder; let i = index">
    if(this.myTreeBuilder!=null){
      for(let i = 0; i < this.myTreeBuilder.length; i++){
        nodeTable += '<table class="level" style="margin: auto;"><tr>'; //CLASS = LEVEL

        // <table class="node" *ngFor="let arrays of object.array_level; let j = index" id="div0">
        for(let j = 0; j < this.myTreeBuilder[i].array_level.length; j++){
          nodeTable += '<td style="padding: 10px;"><table class="node" id="head' + this.myTreeBuilder[i].array_level[j].header + '">'; //CLASS = NODE
              nodeTable += '<colgroup>';
                  for(let c = 0; c < 6; c++){ nodeTable += '<col width="8.3%"><col width="8.3%">'; }
              nodeTable += '</colgroup>';
              nodeTable += '<tr>';
                  if(this.myTreeBuilder[i].array_level[j].key1 != undefined){
                    nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key1 + '</td>';
                  } else { nodeTable += '<td style="border:2px solid black;" colspan=4></td>'; }
                  if(this.myTreeBuilder[i].array_level[j].key2 != undefined){
                    nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key2 + '</td>';
                  } else { nodeTable += '<td style="border:2px solid black;" colspan=4></td>'; }
                  if(this.myTreeBuilder[i].array_level[j].key3 != undefined){
                    nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key3 + '</td>';
                  } else { nodeTable += '<td style="border:2px solid black;" colspan=4></td>'; }
              nodeTable += '</tr>';
              nodeTable += '<tr>';
                  nodeTable += '<td style="border:2px solid black; color:rgb(0, 0, 0);" colspan=3 id="div' + this.ptr(i, j, 0)+ '">' + "•" + '</td>';
                  nodeTable += '<td style="border:2px solid black; color:rgb(0, 0, 0);" colspan=3 id="div' + this.ptr(i, j, 1)+ '">' + "•" + '</td>';
                  nodeTable += '<td style="border:2px solid black; color:rgb(0, 0, 0);" colspan=3 id="div' + this.ptr(i, j, 2)+ '">' + "•" + '</td>';
                  nodeTable += '<td style="border:2px solid black; color:rgb(0, 0, 0);" colspan=3 id="div' + this.ptr(i, j, 3)+ '">' + "•" + '</td>';
              nodeTable += '</tr>';
          nodeTable += '</table></td>'; //END OF CLASS = NODE

        }
        nodeTable += '</tr></table>'; //END OF CLASS = LEVEL
      }
      myDiv.innerHTML += nodeTable;
      const svg = document.querySelector("#svg");
      svg.innerHTML = "";
      this.line();
    }
  }

  line(){
    console.log("line()");
    for(let i = 1 ; i <= this.counter; i++){
      this.draw(i, i)
    }
  }

  draw(ptr, table){

    console.log("draw()");
    var x = document.querySelector("#div" + ptr);
    var y = document.querySelector("#head" + table);

    if(x == null || y == null){
      return;
    }

    var div1: any = x.getBoundingClientRect();
    var div2: any = y.getBoundingClientRect();

    var x1 = div1.left + (div1.width/2) - 200;
    var y1 = div1.top + (div1.height/2) - 150;
    var x2 = div2.left + (div2.width/2) - 200;
    var y2 = div2.top - 150;

    const svg = document.querySelector("#svg");
    svg.innerHTML += '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" id="line' + this.lineCounter + '"/>'
  }
  
}