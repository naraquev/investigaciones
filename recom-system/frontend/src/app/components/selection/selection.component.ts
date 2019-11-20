import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { PredictionModelFive } from 'src/app/models/prediction-model-five';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  success = false;

  predictionResult: {
    subjects: { code: string; name: string; disabled: boolean; }[],
    prediction: string
  }[];

  studentId: any;
  loading = false;
  loadingPred: boolean;
  resetList = false;

  predictionOption: string;
  predictionM5: {
    subjects: string[],
    prediction: string
  }[];

  allSubjects: { code: string; name: string; disabled: boolean; }[];
  isRecom = false;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(param => {
      this.predictionOption = param.selection;
      this.createForms();
    });
  }

  createForms() {
    this.firstFormGroup = this.formBuilder.group({
      id: ['', Validators.required]
    });

    this.secondFormGroup = this.formBuilder.group({
      targetSubjectsFirst: ['', Validators.required],
      targetSubjectsSecond: ['', Validators.required]
    });
  }

  nextStep(step) {
    switch (step) {
      case 1:
        this.resetList = false;
        if (this.studentId !== this.firstFormGroup.value.id) {
          this.loading = true;
          this.studentId = this.firstFormGroup.value.id;
        }
        this.getAvailableSubjects(this.studentId);
        break;
      case 2:
        this.loadingPred = true;
        this.predict();
        break;
    }
  }

  loaded(event) {
    this.loading = event;
  }

  saveSelection(event, trimNumber: number) {
    if (trimNumber === 1) {
      this.secondFormGroup.get('targetSubjectsFirst').setValue(event);
    } else if (trimNumber === 2) {
      this.secondFormGroup.get('targetSubjectsSecond').setValue(event);
    }
  }

  goBack() {
    this.location.back();
  }

  predict() {
    const targetQuarter = [this.secondFormGroup.value.targetSubjectsFirst, this.secondFormGroup.value.targetSubjectsSecond];
    switch (this.predictionOption) {
      case 'comparacion': {
        this.apiService.predictPerformanceModel5(this.studentId, targetQuarter, false).then(res => {
          this.predictionM5 = res;
          this.predictionResult = res.map(r => {
            return {
              prediction: r.prediction,
              subjects: this.getSubjectsName(r)
            };
          });
          if (Number(this.predictionM5[0].prediction) >= 0.5) {
            this.success = true;
          } else {
            this.success = false;
          }
          this.loadingPred = false;
        });
      }
    }
  }

  getSubjectsName(predictionRes: PredictionModelFive): { code: string; name: string; disabled: boolean; }[] {
    const subjectsInfo: { code: string; name: string; disabled: boolean; }[] = [];
    predictionRes.subjects.forEach(subjectCode => {

      if (subjectCode !== '') {
        this.allSubjects.forEach(s => {

          if (s.code === subjectCode) {
            subjectsInfo.push(s);
          }
        });
      }
    });
    return subjectsInfo;
  }

  getAvailableSubjects(id) {
    this.apiService.getAvailableSubjects(id).then(res => {
      this.allSubjects = res;
    });
  }

  reset() {
    this.secondFormGroup.reset();
    this.resetList = true;
  }

}
