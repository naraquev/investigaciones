import { Component, OnInit } from "@angular/core";
import { CommentsService } from "../services/comments.service";
import { Comment } from "../models/comments";
import { AuthService } from "../services/auth.service";
import { Index } from "../models";

@Component({
  selector: "app-calification",
  templateUrl: "./calification.component.html",
  styleUrls: ["./calification.component.scss"]
})
export class CalificationComponent implements OnInit {
  public currentComment: Comment;

  public userEmail: string;

  public disabled: boolean = false;

  public loading: boolean = true;
  public counter: Index;

  constructor(
    private commentService: CommentsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // this.commentService
    //   .getAll()
    //   .asObservable()
    //   .subscribe(collection => {
    //     console.log("Total Comments: ", collection.iterable.length);
    //   });
    this.commentService
      .getCounter("calification")
      .__asObservable()
      .subscribe(res => {
        this.counter = res;
      });
    this.authService.getUser().subscribe(u => {
      this.userEmail = u.email;
    });
    this.commentService.getFirst().then(res => {
      res.__toPromise().then(comment => {
        if (
          comment.totalCalifications === 40 ||
          this.emailRepeated(comment.usersEmails)
        ) {
          this.getNext();
        } else {
          this.currentComment = comment;
          this.loading = false;
        }
      });
    });
  }

  public getNext() {
    this.loading = true;
    this.disabled = true;
    this.commentService.getNext().then(res => {
      res.__toPromise().then(comment => {
        if (
          comment.totalCalifications === 40 ||
          this.emailRepeated(comment.usersEmails)
        ) {
          this.getNext();
        } else {
          this.currentComment = comment;
          this.loading = false;
          this.disabled = false;
        }
      });
    });
  }

  public emailRepeated(emails: Array<string>): boolean {
    let index = emails.findIndex(element => element === this.userEmail);
    return index >= 0;
  }

  public calificate(toxic: boolean) {
    this.loading = true;
    this.disabled = true;
    if (toxic) this.currentComment.negativeCalifications += 1;
    this.currentComment.totalCalifications += 1;
    this.counter.total += 1;
    this.commentService.updateCounter(this.counter);
    if (!this.currentComment.usersEmails) {
      this.currentComment.usersEmails = [];
    }
    this.currentComment.usersEmails.push(this.userEmail);
    this.commentService.update(this.currentComment);
    this.getNext();
  }
}
