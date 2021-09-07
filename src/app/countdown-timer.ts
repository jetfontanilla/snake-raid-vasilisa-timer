import { concat, distinctUntilChanged, interval, NEVER, Observable, of, Subject } from "rxjs";
import { map, startWith, switchMap, takeUntil, takeWhile, tap } from "rxjs/operators";
import { format } from "date-fns";

export interface CountdownTimerTick {
  time: number;
  timeString: string;
  isExpired: boolean;
  percent: number;
}

export class CountdownTimer {
  private remainingTime: string = "";
  private remainingTimeMs: number = 0;
  private endTime: number = 0;

  private onDestroy$ = new Subject<void>();
  private timer$!: Observable<CountdownTimerTick>;
  private active$ = new Subject<boolean>();

  private paused: boolean = false;

  constructor(private durationMs: number = 0,
              private autoStart: boolean = false,
              private intervalMs: number = 25,
              private format: string = "ss.SSS") {
    this.reset(this.autoStart);
  }

  reset(autoStart: boolean = true): void {
    this.endTime = Date.now() + this.durationMs;
    this.remainingTimeMs = this.durationMs;
    this.remainingTime = this.computeRemainingTimeString();
    this.timer$ = concat(of({
      time: this.remainingTimeMs,
      timeString: this.remainingTime,
      isExpired: this.isExpired(),
      percent: this.durationMs > 0 ? this.remainingTimeMs / this.durationMs : 0
    }), this.generateTimer$(autoStart));
  }

  private generateTimer$(autoStart: boolean): Observable<CountdownTimerTick> {
    let baseTimer$ = this.generateIntervalTimer$(this.intervalMs);
    return this.active$.pipe(
      startWith(autoStart),
      tap(isActive => this.paused = !isActive),
      switchMap(isActive => isActive ? baseTimer$ : NEVER),
      takeUntil(this.onDestroy$),
      takeWhile(timerTick => timerTick?.time >= 0),
      distinctUntilChanged()
    );
  }

  private generateIntervalTimer$(intervalMs: number): Observable<CountdownTimerTick> {
    return interval(intervalMs)
      .pipe(
        takeUntil(this.onDestroy$),
        map(() => {
          this.remainingTime = this.computeRemainingTimeString();
          return {
            time: this.remainingTimeMs,
            timeString: this.remainingTime,
            isExpired: this.isExpired(),
            percent: this.durationMs > 0 ? this.remainingTimeMs / this.durationMs : 0
          };
        })
      );
  }

  private computeRemainingTimeString(): string {
    this.remainingTimeMs = this.endTime - Date.now();
    if (this.remainingTimeMs <= 0) {
      this.remainingTimeMs = 0;
      return "";
    }
    return format(this.remainingTimeMs, this.format);
  }

  pause(): void {
    if (this.isExpired()) {
      return;
    }
    this.remainingTimeMs = this.endTime - Date.now();
    this.active$.next(false);
  }

  isPaused(): boolean {
    return this.paused;
  }

  resume(): void {
    if (this.isExpired()) {
      return;
    }
    this.endTime = Date.now() + this.remainingTimeMs;
    this.active$.next(true);
  }

  getRemainingTime(): string {
    return this.remainingTime;
  }

  getRemainingTimeMs(): number {
    return this.remainingTimeMs;
  }

  isExpired(): boolean {
    return this.endTime <= Date.now();
  }

  getTimer$(): Observable<CountdownTimerTick> {
    return this.timer$;
  }

  destroy(): void {
    this.onDestroy$.next();
  }

}
