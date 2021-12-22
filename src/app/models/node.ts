
export class Node {
    
    keyvalues:number[] = [];
    recordnumber:number = 0;
    parentNode:Node = null;
    childPointers:Node[] = [];
    isRoot:boolean = false;
    isLeaf:boolean = false;
    prevLeaf:Node = null;
    nextLeaf:Node = null;

}
