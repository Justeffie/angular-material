import {Component, OnDestroy, OnInit} from '@angular/core';
import {TrainingService} from "../training.service";
import {NgForm} from "@angular/forms";
import {Subscription} from "rxjs";
import {Excercise} from "../excercise.model";

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  excercises: Excercise[];
  excerciseSub: Subscription;
  isLoading = true;

  constructor(private trainingService: TrainingService) { }

  ngOnInit() {
    this.excerciseSub = this.trainingService.excercisesChanged.subscribe( excercises => {
      this.excercises = excercises;
      this.isLoading = false
    });
    this.fetchExcercises();
  }

  fetchExcercises() {
    this.trainingService.fetchAvailableExcercise();
  }

  ngOnDestroy() {
    this.excerciseSub.unsubscribe();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExcercise(form.value.excercise);
  }
}
