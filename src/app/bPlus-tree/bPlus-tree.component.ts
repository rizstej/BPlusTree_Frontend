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


@Component({
  selector: 'app-issue-list',
  templateUrl: './bPlus-tree.component.html',
  styleUrls: ['./bPlus-tree.component.css']
})
export class BPlusTreeComponent implements OnInit {


  //==========================================================
  //==================== B+TREE VARIABLES ====================
  //==========================================================


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


  //===================================================
  //==================== VARIABLES ====================
  //===================================================


  //The options you can choose from on the TreeBuilding screen
  private options = [
    { id: -1, name: "Please choose an option", text:""},
    { id: 0, name: "Build a new Tree", text:""},
    { id: 1, name: "Insert", text:"Key value:"},
    { id: 2, name: "Delete", text:"Key value:"}
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
    //this.line();

  }
  

  //
  // === Function for option selection ===
  //
  onChange(event): void {  

    const newOP = event.target.options;
    
    if(newOP.selectedIndex==0){
      this.selectedOption=this.options[0];
      console.log(this.selectedOption);
      this.selectedOptionName=this.options[0].name;
      this.validOptionIsSelected=false;
      this.newTree=false;
      this.drawTree();
      return;
    }
    if (newOP.selectedIndex==1){
      this.selectedOption=this.options[1];
      this.selectedOptionName=this.options[1].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=true;
      this.drawTree();
      return;
    }
    if (newOP.selectedIndex==2){
      this.selectedOption=this.options[2];
      this.selectedOptionName=this.options[2].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=false;
      this.drawTree();
      return;
    }
    if (newOP.selectedIndex==3){
      this.selectedOption=this.options[3];
      this.selectedOptionName=this.options[3].name;
      console.log(this.selectedOption);
      this.validOptionIsSelected=true;
      this.newTree=false;
      this.drawTree();
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
      }else{
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
    const index: number = node.keyvalues.indexOf(key);
    if (index == -1) {    
        if(node.recordnumber==3){
            console.log("ADDKEY() meghívja SPLIT()-et");
            console.log("node");
            console.log(node.keyvalues);
            console.log("key");
            console.log(key);
            return this.split(node, key);
        } else {            
            console.log("ADDKEY() simán hozzáad, NEM meghívja SPLIT()-et");
            console.log("node");
            console.log(node.keyvalues);
            console.log("key");
            console.log(key);
            node.keyvalues.push(key);
            node.recordnumber = node.recordnumber + 1;
            this.sortKeyValues(node.keyvalues);
            return -1;
        }
    }
    return -1;
  }


  //
  // === Removing key values from nodes ===
  // 
  //RETURN: mergedNode and max_keyvalue : if node is NOT full  
  //        -1 : if node is full
  //
  removeKey(node: Node, key: number){
      console.log("remove key");
      const index: number = node.keyvalues.indexOf(key);
      if (index != -1) {
          if(node.recordnumber==2){
              return this.merge(node, key);
          } else {
              node.keyvalues.splice(index, 1);
              node.recordnumber = node.recordnumber - 1;
              this.sortKeyValues(node.keyvalues);
              console.log("node.keyvalues");
              console.log(node.keyvalues);
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

      console.log("SPLIT()");
      console.log("node");
      console.log(node.keyvalues);
      console.log("key");
      console.log(key);
      var newNode;
      var max_keyvalue;
      const valuesToSplit = Object.assign([], node.keyvalues);

      //if the node is a leaf
      if(node.isLeaf){
          console.log("SPLIT() -> IF node is Leaf");
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
          return [newNode, max_keyvalue];
      } 
      
      //if the node is NOT a leaf
      else {
          console.log("SPLIT() -> ELSE aka node is NOT Leaf");
          //adjusting the original node's keys
          valuesToSplit.push(key);
          this.sortKeyValues(valuesToSplit);
          node.keyvalues.splice(0,3);
          node.keyvalues.push(valuesToSplit[0]);
          node.keyvalues.push(valuesToSplit[1]);
          node.recordnumber=2;

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

      var max_keyvalue;
      var mergedNode;
      var valuesLeft = [];   
      
      if(node.prevLeaf!=null && node.parentNode==node.prevLeaf.parentNode) //if the leaf has a left sibling
      {
        console.log("merge -> if");
        max_keyvalue = node.keyvalues[0]; //saving first key for later to delete hash key
          
        //adjusting the pointers
        if(node.prevLeaf != null){ if(node.prevLeaf.nextLeaf != null && node.nextLeaf != null){node.prevLeaf.nextLeaf = node.nextLeaf;} }
        if(node.nextLeaf != null){ if(node.nextLeaf.prevLeaf != null && node.prevLeaf != null){node.nextLeaf.prevLeaf = node.prevLeaf;} }

        //deleteing key, and adding the one key left in node to previous leaf
        const ind: number = node.keyvalues.indexOf(key);
        node.keyvalues.splice(ind,1);
        valuesLeft = node.keyvalues;
        node.prevLeaf.keyvalues.push(valuesLeft[0]);
        this.sortKeyValues(node.prevLeaf.keyvalues); 
        mergedNode = node.prevLeaf;
        console.log("mergedNode");
        console.log(mergedNode.keyvalues);

        //deleting node from tree
        node.keyvalues.splice(0,3);
        const index = this.myTree.nodes.indexOf(node);
        this.myTree.nodes.splice(index,1);

        console.log("max_keyvalue = HASÍTÓ KULCSÉRTÉK");
        console.log(max_keyvalue);


        return [mergedNode, max_keyvalue];

      } else if(node.nextLeaf!=null && node.parentNode==node.prevLeaf.parentNode) { 

        console.log("merge -> else");
        max_keyvalue = this.actual_node.nextLeaf.keyvalues[0];
        mergedNode = node.nextLeaf;

        //adjusting the pointers
        this.actual_node.nextLeaf.prevLeaf=null;
        
        //deleteing key, and adding the one key left in node to previous leaf
        const ind: number = node.keyvalues.indexOf(key);
        node.keyvalues.splice(ind,1);
        valuesLeft = node.keyvalues;
        this.actual_node.nextLeaf.keyvalues.push(valuesLeft[0]);
        this.sortKeyValues(node.nextLeaf.keyvalues);
        mergedNode = node.nextLeaf;
        console.log("mergedNode");
        console.log(mergedNode.keyvalues);

        //deleting node from tree
        
        //LOG FOR CHECKING
        console.log("node BEFORE NULL"); let beforeNode = node; console.log(beforeNode.keyvalues);
        node.keyvalues.splice(0,3);
        //LOG FOR CHECKING
        console.log("node AFTER NULL"); let afterNode = node; console.log(afterNode.keyvalues);
        const index = this.myTree.nodes.indexOf(node);
        let splicedFromTree = this.myTree.nodes.splice(index,1);
        //LOG FOR CHECKING
        // console.log("splicedFromTree"); console.log(splicedFromTree);
        // console.log(this.myTree);

        console.log("max_keyvalue = HASÍTÓ KULCSÉRTÉK");
        console.log(max_keyvalue);

        return [mergedNode, max_keyvalue];
      }
  }


  //
  // === Inserting nodes in the tree ===
  //
  insert(key: number){
    
    //LOG FOR CHECKING
    console.log("");
    console.log("");
    console.log("");
    console.log("---------------------- * insert "+key+" * ---------------------- ");
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

            //LOG FOR CHECKING
            // console.log("while");
            if(key < this.actual_node.keyvalues[0] && this.actual_node != null) { 
                console.log("INSERT -> WHILE LEAF NODE -> X < A");
                child_index = 0;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[0] && this.actual_node.keyvalues[1]==null && this.actual_node != null) {
              console.log("INSERT -> WHILE LEAF NODE -> X >= A & NINCS B");
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[0] <= key && key < this.actual_node.keyvalues[1] && this.actual_node != null) { 
                console.log("INSERT -> WHILE LEAF NODE -> A <= X <B");
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key >= this.actual_node.keyvalues[1] && this.actual_node.keyvalues[2]==null && this.actual_node != null) {
                console.log("INSERT -> WHILE LEAF NODE ->  X >= B & NINCS C");
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[1] <= key && key< this.actual_node.keyvalues[2]&& this.actual_node != null) { 
                console.log("INSERT -> WHILE LEAF NODE -> B <= X < C");
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if (key >= this.actual_node.keyvalues[2] && this.actual_node != null) { 
                console.log("INSERT -> WHILE LEAF NODE -> X >= C");
                child_index = 3;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
          }
          
          var returnedValues;                   // the returned values of addKey() function;
          var returnedNode:Node;                // which will be created by the split method;
          this.actual_node = stack.pop();

          // DO: addKey(), 
          // WHILE: the addKey() returns -1, which means there were no splits needed.
          do{ 
              console.log("INSERT -> DO");
              returnedValues = this.addKey(this.actual_node, key);
              
              returnedNode = returnedValues[0];
              key = returnedValues[1];
                            
              //popping out the parent node
              this.actual_node = stack.pop();
              console.log("INSERT -> pop parent");

              if(this.actual_node != null && returnedNode != null){
                console.log("INSERT -> DO -> IF THIS.NODE != NULL & RETURNEDNODE != NULL");

                //adjusting child pointers
                console.log("ADJUSTING CHILDREN");
                let counter=0;
                let children_counter = [];
                for(let i of this.actual_node.childPointers){
                  children_counter.push(counter);
                  counter++;
                }
                children_counter.push(counter);

                let next = this.actual_node.childPointers[0];
                for(let i in children_counter){
                  if(this.actual_node.childPointers[i] != null ) { console.log(this.actual_node.childPointers[i].keyvalues); } else {console.log(null);}
                  this.actual_node.childPointers[i] = next;
                  next=this.actual_node.childPointers[i].nextLeaf;
                }

                //setting the parentNodes
                console.log("SETTING PARENTS");
                for(let i = 0; i < this.actual_node.childPointers.length; i++){
                  console.log("FOR");
                  console.log(i);
                  console.log("childpointer");
                  console.log(this.actual_node.childPointers[i].keyvalues);
                  this.actual_node.childPointers[i].parentNode = this.actual_node;
                  console.log("this.actual_node.childPointers[i].parentNode");
                  console.log(this.actual_node.childPointers[i].parentNode.keyvalues);
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
                  console.log("IF -> returnedNode!= null && !returnedNode.isLeaf");
                  console.log("this.actual_node.keyvalues");
                  console.log(this.actual_node.keyvalues);
                  this.actual_node.isRoot=false;

                  var newRoot = new Node();
                  newRoot.isRoot = true;
                  newRoot.childPointers[0] = this.actual_node;
                  newRoot.childPointers[1] = returnedNode;
                  
                  console.log("newRoot's ChildPointers");
                  console.log(newRoot.childPointers[0].keyvalues);
                  console.log(newRoot.childPointers[1].keyvalues);
                  
                  this.actual_node.parentNode = newRoot;
                  returnedNode.parentNode = newRoot;
                  
                  console.log("returnedNode");
                  console.log(returnedNode.keyvalues);
                  console.log("returnedNode's PARENT");
                  console.log(returnedNode.parentNode.keyvalues);
                  
                  //setting the parentNodes
                  for(let i = 0; i < returnedNode.childPointers.length; i++){
                    returnedNode.childPointers[i].parentNode = returnedNode;
                    console.log(returnedNode.childPointers[i].parentNode.keyvalues);
                  }

                  console.log("INSERT -> NEW ROOT");
                  console.log(newRoot.keyvalues);

                  returnedValues = this.addKey(newRoot, key);
                  returnedNode = returnedValues[1];
                  key = returnedValues[2];
                  
                  console.log("returnedNode");
                  if(returnedNode != null) {console.log(returnedNode.keyvalues);} else {console.log(null);}
                  console.log("INSERT -> addkey(key)");
                  console.log(key);
                  
                  this.myTree.root = newRoot; 
                  this.myTree.nodes.push(newRoot);
                  
                }
                  
              } else if (this.actual_node == null  && key != null) {
                console.log("INSERT -> ELSE THIS.NODE = NULL & KEY != NULL");

                //create new root node
                var newRoot = new Node();
                newRoot.isRoot = true;

                //setting parent node
                returnedNode.parentNode = newRoot;
                returnedNode.prevLeaf.parentNode = newRoot;

                newRoot.childPointers[0] = returnedNode.prevLeaf;
                console.log("returnedNode.prevLeaf");
                console.log(returnedNode.prevLeaf.keyvalues);

                newRoot.childPointers[1] = returnedNode;
                console.log("returnedNode");
                console.log(returnedNode.keyvalues);

                if(returnedNode.nextLeaf!=null ) { 
                  newRoot.childPointers[2] = returnedNode.nextLeaf;
                  console.log("returnedNode.nextLeaf");
                  console.log(returnedNode.nextLeaf.keyvalues);
                  returnedNode.nextLeaf.parentNode = newRoot;
                  if(returnedNode.nextLeaf.nextLeaf!=null){
                    newRoot.childPointers[3] = returnedNode.nextLeaf.nextLeaf;
                    console.log("returnedNode.nextLeaf.nextLeaf");
                    console.log(returnedNode.nextLeaf.nextLeaf.keyvalues);
                    returnedNode.nextLeaf.nextLeaf.parentNode = newRoot;
                  }
                }

                returnedValues = this.addKey(newRoot,key);
                returnedNode = returnedValues[1];
                key = returnedValues[2];
                this.myTree.root = newRoot;
                this.myTree.nodes.push(newRoot);
              }
              
          } while(key==(-1) && this.actual_node == null);
      
      }

      this.buildTree();
      this.drawTree();
  }


  //
  // === Removing nodes from the tree ===
  //
  delete(key: number){

    //LOG FOR CHECKING
    console.log("delete "+key);
    this.myTree.logs.push(new Log("delete", key));

        this.actual_node = this.myTree.root;
        var stack:Array<Node> = [];
        var child_index = 0;
        stack.push(this.actual_node);

          //we need to find the appropriate leaf_node to delete the key from  
          while(!this.actual_node.isLeaf){
            if(key < this.actual_node.keyvalues[0]) { 
                child_index = 0;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key > this.actual_node.keyvalues[0] && this.actual_node.keyvalues[1]==null) 
            {
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[0] <= key && key < this.actual_node.keyvalues[1]) { 
                child_index = 1;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if(key > this.actual_node.keyvalues[1] && this.actual_node.keyvalues[2]==null) 
            {
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else if (this.actual_node.keyvalues[1] <= key && key< this.actual_node.keyvalues[2]) { 
                child_index = 2;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            } 
            else if (key >= this.actual_node.keyvalues[2]) { 
                child_index = 3;
                this.actual_node = this.actual_node.childPointers[child_index];
                stack.push(this.actual_node); 
            }
            else {console.log("üres else");}
            console.log("WHILE - this.actual_node");
            console.log(this.actual_node.keyvalues);
          }
          
          console.log("while után");
          var returnedValues = [];                   // the returned values of removeKey() function;
          var returnedNode:Node = new Node();                // which will be created by the split method;
          this.actual_node = stack.pop();

          //if the key we are deleting is alone in a LEAF & it is also the ROOT -> restart tree building 
          if(this.actual_node.isLeaf && this.actual_node.isRoot && this.actual_node.recordnumber==1){
            this.restart();
          }

          //if possible STEAL form LEFT sibling
          if( this.actual_node.prevLeaf!=null && this.actual_node.prevLeaf.recordnumber==3 ){
              
            //the original hashKey which will be changed  
            var hashkey_to_change = this.actual_node.keyvalues[0];

            //deleteing the key the user_input key
            const ind: number = this.actual_node.keyvalues.indexOf(key);
            this.actual_node.keyvalues.splice(ind, 1);
              
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

          //if possible STEAL from RIGHT sibling
          else if(this.actual_node.nextLeaf!=null && this.actual_node.nextLeaf.recordnumber==3){

            //the original hashKey which will be changed  
            var hashkey_to_change = this.actual_node.nextLeaf.keyvalues[0];

            //deleteing the key the user_input key
            const ind: number = this.actual_node.keyvalues.indexOf(key);
            this.actual_node.keyvalues.splice(ind, 1);

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
           
          //if NOT possible to STEAL form sibling AND parent nodes need adjustment
          else {

            while(key!=-1){
              //LOG FOR CHECKING
              console.log("DO");
              returnedValues = this.removeKey(this.actual_node, key);
              returnedNode = returnedValues[0]; //the node after the merge
              key = returnedValues[1];          //the hashkey which will be deleted

              console.log("DO elején KEY= -1?; [returnedValues]:");
              console.log(returnedValues);
              console.log(key);

              //popping out the parent node
              this.actual_node = stack.pop();
              console.log("actual node:");
              console.log(this.actual_node.keyvalues);

              //if merge returns with a key and parent has 2 or more hashkeys
              if(this.actual_node != null && this.actual_node.recordnumber>=2 && key != -1){
                
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

                key = -1;
              }
              
              //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! PARENT ADJUSTING IN UPPER LEVELS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              if (key != -1){
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!                
                if(this.actual_node != null){
                  if(this.actual_node.keyvalues.length == 1){ 
                    key=-1 
                  } else{          
                    //adjusting the key values of the parent node
                    const ind: number = this.actual_node.keyvalues.indexOf(key);
                    this.actual_node.keyvalues.splice(ind, 1);
                    this.sortKeyValues(this.actual_node.keyvalues);

                    //adjusting childpointers
                    var counter=0;
                    var children_counter = [];
                    for(let i of this.actual_node.childPointers){
                      children_counter.push(counter);
                      counter++;
                    }
                    children_counter.pop();
                    //LOG FOR CHECKING
                    console.log("delete -> not steal from sibling -> childpointer adjusting !!! ELSE !!!");
                    console.log(children_counter);
                    
                    var next = this.actual_node.childPointers[0];
                    //LOG FOR CHECKING
                    console.log("for");
                    for(let i in children_counter){
                      //LOG FOR CHECKING
                      console.log(this.actual_node.childPointers);
                      console.log("for cycle - i");
                      console.log(i);
                      console.log("actual_node.childPointers[i]:");
                      console.log(this.actual_node.childPointers[i].keyvalues);

                      console.log("!!! BEFORE IF !!!");
                      console.log("actual_node.childpointers[i].keyvalues LENGTH");
                      console.log(this.actual_node.childPointers[i].keyvalues.length);

                      if(this.actual_node.childPointers[i].keyvalues.length == 0 ){
                        console.log("!!! IF !!! for cycle - childpointers");
                        console.log(this.myTree);
                        const index = this.actual_node.childPointers.indexOf(this.actual_node.childPointers[i]);
                        console.log("childpointer index");
                        console.log(index);
                        let splicednode = this.actual_node.childPointers.splice(index,1);
                        console.log("splicednode");
                        console.log(splicednode);
                        console.log(this.myTree);

                        //pointer adjusting
                        if(this.actual_node.childPointers[i].prevLeaf != null) {
                          this.actual_node.childPointers[i].prevLeaf.nextLeaf = this.actual_node.childPointers[i].nextLeaf
                        }
                        if(this.actual_node.childPointers[i].nextLeaf != null) {
                          this.actual_node.childPointers[i].nextLeaf.prevLeaf = this.actual_node.childPointers[i].prevLeaf
                        }
                        console.log("!!! END IF !!!");
                      }                
                    }
                  }
                }
              }
            }

          }

      this.buildTree();
      this.drawTree();
  }


  
  //
  // === Creating the format which will be help to build the tree ===
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


  drawTree(){
    const myDiv = document.querySelector("#center");
    myDiv.innerHTML = "";
    let nodeTable = "";
        
    //<table class="level" *ngFor="let object of myTreeBuilder; let i = index">
    for(let i = 0; i < this.myTreeBuilder.length; i++){
      nodeTable += '<table class="level" style="margin: auto;"><tr>'; //CLASS = LEVEL

      // <table class="node" *ngFor="let arrays of object.array_level; let j = index" id="div0">
      for(let j = 0; j < this.myTreeBuilder[i].array_level.length; j++){
        nodeTable += '<td style="padding: 10px;"><table class="node" id="head' + this.myTreeBuilder[i].array_level[j].header + '">'; //CLASS = NODE
            nodeTable += '<colgroup>';
                for(let c = 0; c < 6; c++){ nodeTable += '<col width="8.3%"><col width="8.3%">'; }
            nodeTable += '</colgroup>';
            nodeTable += '<tr>';
                nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key1 + '</td>';
                nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key2 + '</td>';
                nodeTable += '<td style="border:2px solid black;" colspan=4>' + this.myTreeBuilder[i].array_level[j].key3 + '</td>';
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
    //console.log(myDiv);
    const svg = document.querySelector("#svg");
    svg.innerHTML = "";
    this.line();
  }

  line(){
    for(let i = 1 ; i <= this.counter; i++){
      this.draw(i, i)
    }
  }

  draw(ptr, table){

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
