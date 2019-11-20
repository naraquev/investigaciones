import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PredictionModelFive } from '../models/prediction-model-five';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  API_URL = 'http://localhost:8081/api/';

  constructor(private http: HttpClient) {
  }

  public getAvailableSubjects(studentId): Promise<{code: string, name: string, disabled: boolean}[]> {
    return new Promise<{code: string, name: string, disabled: boolean}[]>((resolve, reject) => {
      this.http.post(`${this.API_URL}getSubjects/${studentId}`, '').toPromise().then(res => {
        resolve(res as {code: string, name: string, disabled: boolean}[]);
      }).catch(err => {
        console.error( 'Error: Unable to complete request.', err);
        reject();
      });
    });
  }

  public predictPerformanceModel5(id, target, unique?:boolean): Promise<PredictionModelFive[]> {
    return new Promise<any>((resolve, reject) => {
      var quarters;
      if(unique) {
        quarters = [target];
      } else {
        quarters = target;
      }
      this.http.post(`${this.API_URL}predict-model/${id}`, quarters).toPromise().then(res => {
        resolve(res as PredictionModelFive);
      }).catch(err => {
        console.error( 'Error: Unable to complete request.', err);
        reject();
      });
    });
  }

  /** 
   * Funcion para obtener todas las combinaciones de materias posibles
   * para posteriormente predecir sus resectivos rendimientos */
  public getCombinations(availables, preselected, assignsNumber?): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.post(`${this.API_URL}getCombinations/${assignsNumber}`, {availables, preselected}).toPromise().then(res => {
        resolve(res);
      }).catch(err => {
        console.error( 'Error: Unable to complete request.', err);
        reject();
      });
    });
  }

}
