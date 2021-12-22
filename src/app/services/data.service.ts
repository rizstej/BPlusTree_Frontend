import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Tree } from '../models/tree';

@Injectable()
export class DataService {

    tree = new Tree;
    private messageSource = new BehaviorSubject<Tree>(this.tree);
    currentMessage = this.messageSource.asObservable();

    constructor() { }

    changeMessage(message:Tree){
        this.messageSource.next(message);
    }
}