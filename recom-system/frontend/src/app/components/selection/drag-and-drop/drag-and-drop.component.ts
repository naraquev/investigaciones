import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent implements OnInit, OnChanges {
  @Input() id: string;
  @Input() loading;
  @Input() reset = false;
  @Input() recomendation: boolean;

  @Input() fixedSubjects: boolean;

  @Output() targetSubjects = new EventEmitter<string[]>();
  @Output() preselectSubjects = new EventEmitter<string[]>();
  @Output() loaded = new EventEmitter<boolean>();

  allSubjects = [];
  studentSubjects = [];
  preselSubjects = []; // Materias preseleccionadas;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if (changes.id && changes.id.currentValue) {
      // Se llama la funcion para obtener las materias disponibles por id del estudiante, y guardarla en allSubjects
      this.getAvailableSubjects(this.id);
    }
    if (this.reset) {
      this.studentSubjects = [];
      if (this.recomendation) {
        this.preselSubjects = [];
      }
      this.getAvailableSubjects(this.id);
      this.reset = false;
    }
  }

  getAvailableSubjects(id) {
    this.apiService.getAvailableSubjects(id).then(res => {
      this.allSubjects = res.filter(r => {
        if (!r.disabled) {
          return r;
        }
        return null;
      });
      this.loaded.emit(false);
      this.formatTarget();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.formatTarget();
  }

  formatTarget() {
    // Se crea un array con los codigos de las materias seleccionadas para el trimestre target, y se emite al componente padre
    const target = [];
    const presel = [];
    if (this.recomendation) {
      this.allSubjects.forEach( subject => {
        target.push(subject.code);
      });
      this.preselSubjects.forEach( subject => {
        presel.push(subject.code);
      });
    }  else {
      this.studentSubjects.forEach( subject => {
        target.push(subject.code);
      });
    }
    this.targetSubjects.emit(target);
    this.preselectSubjects.emit(presel);
  }
}
