import { Injectable } from "@angular/core";
import { Comment } from "../models/comments";
import { Collection } from "aether-blaze";
import * as firebase from "firebase";
import { Index } from "../models";

@Injectable({
  providedIn: "root"
})
export class CommentsService {
  private collection: string = "comments";
  private path: string = "/comments";
  public comment: Comment;

  public first: firebase.firestore.Query;
  public next: firebase.firestore.Query;

  constructor() { }

  public getFirst(): Promise<Comment> {
    this.first = firebase
      .firestore()
      .collection(this.collection)
      .where('totalCalifications', '<', 40)
      .orderBy('totalCalifications', 'asc')
      .orderBy(firebase.firestore.FieldPath.documentId())
      .limit(1);
    return new Promise<Comment>((resolve, reject) => {
      this.first.get().then(snapshot => {
        if (snapshot.docs[0]) {
          let text = snapshot.docs[0].data().text;
          this.next = firebase
            .firestore()
            .collection(this.collection)
            .orderBy(firebase.firestore.FieldPath.documentId())
            .startAfter(text)
            .limit(1);
          resolve(new Comment(snapshot.docs[0].ref.path));
        } else {
          reject("No comments found");
        }
      });
    });
  }

  public getNext(): Promise<Comment> {
    this.first = this.next;
    return new Promise<Comment>((resolve, reject) => {
      this.first.get().then(snapshot => {
        if (snapshot.docs[0]) {
          let text = snapshot.docs[0].data().text;
          this.next = firebase
            .firestore()
            .collection(this.collection)
            .orderBy("text")
            .startAfter(text)
            .limit(1);
          resolve(new Comment(snapshot.docs[0].ref.path));
        } else {
          reject("No comments found");
        }
      });
    });
  }

  public getCounter(counter: string) {
    return new Index(`counters/${counter}`);
  }

  public updateCounter(data: Index): Promise<void> {
    return new Promise<void>(_ => {
      data.__save(true);
    });
  }

  // get the item by id. id is the unique auto generated id on firestore
  public get(id: string): Comment {
    return new Comment(this.path + id);
  }

  // get all the items in the collection given by the path, to query items use (ref) => { return ref. }
  public getAll(
    query?: (
      ref: firebase.firestore.CollectionReference
    ) => firebase.firestore.Query
  ): Collection<Comment> {
    if (query) {
      return new Collection<Comment>(Comment, this.path, query);
    } else {
      return new Collection<Comment>(Comment, this.path);
    }
  }

  public create(newComment: Object) {
    return firebase
      .firestore()
      .collection(this.path)
      .add(newComment);
  }

  public update(data: Comment): Promise<void> {
    return new Promise<void>(_ => {
      data.__save(true);
    });
  }
}
