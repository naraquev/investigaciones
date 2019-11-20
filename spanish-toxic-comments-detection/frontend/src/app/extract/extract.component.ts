import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { CommentsService } from "../services/comments.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { iComment } from "../models/comments";
import { TwitterService } from "../services/twitter.service";
import { Index } from "../models";
import * as firebase from "firebase";
import {
  AngularFireStorage,
  AngularFireUploadTask
} from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { Parser } from "json2csv";

@Component({
  selector: "app-extract",
  templateUrl: "./extract.component.html",
  styleUrls: ["./extract.component.scss"]
})
export class ExtractComponent implements OnInit {
  public hashtag = new FormControl("");
  public comments: Array<iComment> = [];
  public loading: boolean = false;
  public counter: Index;

  public selected: Array<Object> = [];

  public disabled: boolean = true;
  public percentage: number;

  public csvFields: Array<String> = ["text", "percent"];
  public dbComments: Array<any> = [];
  public downloadable: Boolean = true;
  public downloadURI;

  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private commentsService: CommentsService,
    private twitterService: TwitterService
  ) {}

  ngOnInit() {
    this.commentsService
      .getCounter("calification")
      .__asObservable()
      .subscribe(res => {
        const goal = 320000;
        this.percentage = (res.total / goal) * 100;
      });

    this.commentsService
      .getCounter("comments")
      .__asObservable()
      .subscribe(res => {
        this.counter = res;
      });
  }

  public downloadCSV() {
    firebase
      .firestore()
      .collection("comments")
      .orderBy(firebase.firestore.FieldPath.documentId())
      .limit(100)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(item => {
          let comment = item.data();
          comment.percent =
            comment.negativeCalifications / comment.totalCalifications;
          this.dbComments.push(comment);
        });
        const json2csvParser = new Parser({
          fields: this.csvFields,
          header: false
        });
        const csv = json2csvParser.parse(this.dbComments);
        const filePath = `list/list.csv`;
        const fileRef = this.storage.ref(filePath);
        var contentType = "text/csv; charset=utf-8";
        var csvFile = new Blob([csv], { type: contentType });
        this.storage.upload(filePath, csvFile).then(res => {
          fileRef.getDownloadURL().subscribe(uri => {
            console.log(uri);
            this.downloadURI = uri;
          });
        });
      });
  }

  public getTwitterComments(): void {
    this.loading = true;
    this.twitterService
      .getComments(this.hashtag.value)
      .then(res => {
        let commentArray = res["result"].map(element => {
          let newComment = {
            text: this.cleanString(element["text"]),
            negativeCalifications: 0,
            totalCalifications: 0,
            usersEmails: []
          };
          return newComment;
        });
        this.comments = commentArray;
        this.loading = false;
        this.disabled = false;
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
      });
  }

  private cleanString(str: string): string {
    let cleaned = str
      .replace("RT", "")
      .replace(/(https:\/\/\w+\W+\w+\W+\w+)/i, "")
      .replace(
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu,
        ""
      );
    let prev = cleaned,
      aux = cleaned.replace(/(@\w+)/i, "");
    while (prev != aux) {
      prev = aux;
      aux = aux.replace(/(@\w+)/i, "");
    }
    cleaned = prev;
    cleaned.replace(":", "").trim();
    return cleaned;
  }

  public pushToDB(): void {
    this.disabled = true;
    this.counter.total += this.selected.length;
    this.commentsService.updateCounter(this.counter);
    this.selected.forEach(comment => {
      this.commentsService.create(comment);
    });
    this.selected = [];
  }
}
