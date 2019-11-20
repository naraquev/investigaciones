import { Observable } from 'rxjs';
import { Entity } from 'aether-blaze';

export interface iIndex{
    total: number;
}

export class Index extends Entity implements iIndex{
    public total: number;

    public __toPromise() {
        return this.__promise as Promise<Index>;
    }

    public __asObservable() {
        return (this.__subject.asObservable() as Observable<Index>);
    }

    constructor(
        path: string,
        total?: number,
    ){
        super(Index, path);
        if(total){
            this.total = total;
        }
    }
}