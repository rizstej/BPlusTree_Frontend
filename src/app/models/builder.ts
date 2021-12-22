import { Keys } from './keys';

export class Builder {
    
    level:number;
    array_level:Keys[]=[];
    nodeNumbers:string[]=[];

    constructor(l:number, aR:Keys[], nN:string[]){
        this.level = l;
        this.array_level = aR;
        this.nodeNumbers = nN;
    }

}