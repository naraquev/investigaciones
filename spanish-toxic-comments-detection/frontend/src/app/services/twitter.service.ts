import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class TwitterService {
  private base = 'http://127.0.0.1:5000/'
  // private base =  'https://toxic-comments-detection.herokuapp.com/'
  private endpoint = this.base + 'comments/'

  constructor(
    private http: HttpClient,
  ) { }

  public getComments(hashtag: string): Promise<any> {
    return this.http.get(`${this.endpoint}${hashtag}`).toPromise();
  }

}//end of class
