import {Excercise} from "./excercise.model";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators'
import {Subscription} from "rxjs/Rx";
import {UiService} from "../shared/ui.service";

@Injectable({providedIn: 'root'})
export class TrainingService {

  excerciseChanged = new Subject<Excercise>();
  excercisesChanged = new Subject<Excercise[]>();
  finishedExcercisesChanged = new Subject<Excercise[]>();

  availableExcercise: Excercise[] = [
    { id: 'crunches', name: 'Crunches', duration: 30, calories: 8 },
    { id: 'touch-toes', name: 'Touch Toes', duration: 180, calories: 15 },
    { id: 'side-lunges', name: 'Side Lunges', duration: 120, calories: 18 },
    { id: 'burpees', name: 'Burpees', duration: 60, calories: 8 }
  ];

  private runningExercise: Excercise;
  private firebaseSubscriptions: Subscription[] = [];

  constructor(private db: AngularFirestore, private uiService: UiService) {}

  fetchAvailableExcercise() {
    let subscription: Subscription = this.db
      .collection('availableExcercise')
      .snapshotChanges()
      .pipe(map(docData => {
        return docData.map(doc => {
          return {
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories']
          };
        });
      }))
      .subscribe((excercises: Excercise[]) => {
        this.availableExcercise = excercises;
        this.excercisesChanged.next([...this.availableExcercise]);
      }, error => {
      this.uiService.loadingStateChanged.next(false);
      this.uiService.showSnackBar('Fetching Exercises failed, please try again later', null, 3000);
      this.excerciseChanged.next(null);
      });
    console.log(subscription);
    this.firebaseSubscriptions.push(subscription);
  }

  startExcercise(selectedId: string) {
    this.runningExercise = this.availableExcercise.find( ex => ex.id === selectedId);
    this.excerciseChanged.next({...this.runningExercise});
  }

  getRunningExcercise() {
    return {...this.runningExercise};
  }

  completeExcercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'});
    this.runningExercise = null;
    this.excerciseChanged.next(null);
  }

  cancelExcercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.duration * (progress / 100),
      date: new Date(),
      state: 'cancelled'});
    this.runningExercise = null;
    this.excerciseChanged.next(null);
  }

  fetchCompletedOrCancelledExcercise() {
    let subscription: Subscription = this.db.collection('finishedExcercises').valueChanges()
      .subscribe((excercises: Excercise[]) => {
        this.finishedExcercisesChanged.next(excercises);
      });
    this.firebaseSubscriptions.push(subscription);
  }

  cancelSubscriptions() {
    this.firebaseSubscriptions.forEach( sub => sub.unsubscribe());
  }

  private addDataToDatabase(excercise: Excercise) {
    this.db.collection('finishedExcercises').add(excercise);
  }
}
