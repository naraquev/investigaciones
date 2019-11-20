import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TwitterService } from "./twitter.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LstmService {
  private base = 'http://127.0.0.1:5000/'
  // private base =  'https://toxic-comments-detection.herokuapp.com/'
  private endpoint = this.base + "rank/";

  constructor(private http: HttpClient, private twitter: TwitterService) { }

  public rankTexts(texts: Array<string>): Promise<any> {
    return this.http.post(`${this.endpoint}`, { texts }).toPromise();
  }
}
