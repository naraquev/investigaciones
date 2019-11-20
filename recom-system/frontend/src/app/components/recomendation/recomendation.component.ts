import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { PredictionModelFive } from 'src/app/models/prediction-model-five';
import { Location } from '@angular/common';

@Component({
  selector: 'app-recomendation',
  templateUrl: './recomendation.component.html',
  styleUrls: ['./recomendation.component.scss']
})
export class RecomendationComponent implements OnInit {
  dataForm: FormGroup;
  secondFormGroup: FormGroup;

  allSubjects: { code: string; name: string; disabled: boolean; }[];
  allCombinations = [];
  loading = false;
  studentId: string;
  numberAssigns: string;
  predictionResult: {
    subjects: { code: string; name: string; disabled: boolean; }[],
    prediction: string
  }[];
  loadingPred = false;
  success = false;

  availablesFiltered: { code: string; name: string; disabled: boolean; }[];
  preselectedFiltered: { code: string; name: string; disabled: boolean; }[];
  resetList = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.dataForm = this.formBuilder.group({
      id: ['', Validators.required],
      numberAssigns: ['']
    });

    this.secondFormGroup = this.formBuilder.group({
      targetSubjects: ['', Validators.required],
      preselectedSubjects: ['']
    });
  }

  nextStep(step) {
    console.log(step);
    switch (step) {
      case 1:
        this.resetList = false;
        console.log('dataformmmm:', this.dataForm.value);
        console.log('second formmmm:', this.secondFormGroup.value);
        if (this.studentId !== this.dataForm.value.id) {
          this.loading = true;
          console.log(step, this.dataForm.value);
          this.studentId = this.dataForm.value.id;
        }
        this.numberAssigns = this.dataForm.value.numberAssigns;
        if (this.numberAssigns === "" || !this.numberAssigns) {
          this.numberAssigns = 'all';
        }
        this.getAvailableSubjects(this.studentId);
        break;
      case 2:
        this.loadingPred = true;
        this.getCombinations();
        break;
    }
  }

  getAvailablesFiltered(filtered) {
    this.secondFormGroup.get('targetSubjects').setValue(filtered);
  }

  getPreselected(filtered) {
    this.secondFormGroup.get('preselectedSubjects').setValue(filtered);
  }

  /**
   * Funcion que genera todas las posibles combinaciones de materias a partir de
   * el array de las materias disponibles escogidas por el usuario
   */
  getCombinations() {
    this.availablesFiltered = this.secondFormGroup.value.targetSubjects;
    this.preselectedFiltered = this.secondFormGroup.value.preselectedSubjects;
    this.apiService.getCombinations(this.availablesFiltered, this.preselectedFiltered, this.numberAssigns).then(res => {
      this.allCombinations = res;
      this.predict();
    });
  }

  predict() {
    this.apiService.predictPerformanceModel5(this.studentId, this.allCombinations).then(res => {
      this.predictionResult = res.map(r => {

        return {
          prediction: r.prediction,
          subjects: this.getSubjectsName(r)
        }
      });
      this.loadingPred = false;
    });
  }

  getSubjectsName(predictionRes: PredictionModelFive): { code: string; name: string; disabled: boolean; }[] {
    let subjectsInfo: { code: string; name: string; disabled: boolean; }[] = [];
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

  loaded(event) {
    console.log(event);
    this.loading = event;
  }

  getAvailableSubjects(id) {
    this.apiService.getAvailableSubjects(id).then(res => {
      this.allSubjects = res;
    });
  }

  goBack() {
    this.location.back();
  }

  reset() {
    this.secondFormGroup.get('preselectedSubjects').setValue([]);
    this.secondFormGroup.get('targetSubjects').setValue([]);
    this.resetList = true;
  }

}
