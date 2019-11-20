import { Component, OnInit } from '@angular/core';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../models/comments';
import { LstmService } from '../services/lstm.service';
import { Observable, interval } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/takeUntil';
import { TwitterService } from '../services/twitter.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  public singleText: string = '';
  public singleResult;
  public singleLoading: Boolean = false;

  public keyword: string = '';
  public tweetsLoading: Boolean = false;
  public tweetsLoadingMsg: String = '';
  public rankedTweets = [];
  public filterValue: Number = 50;

  constructor(private lstm: LstmService, private twitterService: TwitterService) { }

  ngOnInit() { }

  public rankText() {
    this.singleLoading = true;
    this.lstm.rankTexts([this.singleText]).then(result => {
      this.singleLoading = false;
      console.log(result);
      this.singleResult = result.results[0].toxic[0].toFixed(2);
    });
  }

  public async rankTweets() {
    this.tweetsLoading = true;
    this.tweetsLoadingMsg = 'Buscando tweets...';
    let tweetRes = await this.twitterService.getComments(this.keyword);
    this.tweetsLoadingMsg = 'Limpiando tweets...';
    let tweetsArray = tweetRes['results'].map(tweet => {
      return this.cleanString(tweet);
    });
    tweetsArray = this.removeDuplicates(tweetsArray);
    this.tweetsLoadingMsg = 'Introduciendo tweets en la red...';
    let rankRes = await this.lstm.rankTexts(tweetsArray);
    this.rankedTweets = rankRes.results;
    this.tweetsLoading = false;
  }

  private cleanString(str: string): string {
    let cleaned = str
      .replace('RT', '')
      .replace(/(https:\/\/\w+\W+\w+\W+\w+)/i, '')
      .replace(
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu,
        ''
      );
    let prev = cleaned,
      aux = cleaned.replace(/(@\w+)/i, '');
    while (prev != aux) {
      prev = aux;
      aux = aux.replace(/(@\w+)/i, '');
    }
    cleaned = prev;
    cleaned.replace(/\:/g, '').trim();
    return cleaned;
  }

  private removeDuplicates(array: Array<String>): Array<String> {
    let cleanArray = [];
    array.forEach(comment => {
      if (!cleanArray.includes(comment)) {
        cleanArray.push(comment);
      }
    });
    return cleanArray;
  }
}
