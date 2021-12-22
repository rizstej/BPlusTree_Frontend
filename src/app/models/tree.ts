import { Node } from '../models/node';
import { Log } from '../models/log';


export class Tree {

    root: Node;
    nodes: Node[] = [];
    logs: Log[] = [];
}
