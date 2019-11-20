import { Observable } from 'rxjs';
import { Entity } from 'aether-blaze';

export interface iComment{
    text: string;
    totalCalifications: number;
    negativeCalifications: number;
}

export class Comment extends Entity implements iComment{
    public text: string;
    public totalCalifications: number;
    public negativeCalifications: number;
    public usersEmails: Array<string>;

    public __toPromise() {
        return this.__promise as Promise<Comment>;
    }

    public __asObservable() {
        return (this.__subject.asObservable() as Observable<Comment>);
    }

    constructor(
        path: string,
        text?: string,
        totalCalifications?: number,
        negativeCalifications?: number,
        usersEmails?: Array<string>
    ){
        super(Comment, path);
        if(text){
            this.text = text;
        }
        if(totalCalifications){
            this.totalCalifications = totalCalifications;
        }
        if(negativeCalifications){
            this.negativeCalifications = negativeCalifications;
        }
        if(usersEmails){
            this.usersEmails = usersEmails;
        }
    }
}