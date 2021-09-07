import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CountdownTimer, CountdownTimerTick } from "./countdown-timer";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

const PHASE1 = 'phase1';
const PHASE2 = 'phase2';

const DURATION_LOOKUP: Record<string, number> = {
  spear: 40000,
  thrust: 30000,
  drown: 60000
}

interface TimerStruct {
  timer?: CountdownTimer;
  timerTick?: CountdownTimerTick;
  duration: number;
  name: string;
  action: string;
  phase: 'phase1' | 'phase2';
}

@Component({
  selector: 'snake-timer-app',
  templateUrl: './snake-timer-app.component.html',
  styleUrls: ['./snake-timer-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeTimerAppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<boolean>();
  private currentMode = PHASE1;
  private timers: TimerStruct[] = [
    {
      duration: DURATION_LOOKUP.spear,
      name: "spear",
      action: "Wipe!",
      phase: PHASE1
    },
    {
      duration: DURATION_LOOKUP.thrust,
      name: "thrust",
      action: "Lure!",
      phase: PHASE1
    },
    {
      duration: DURATION_LOOKUP.drown,
      name: "drown",
      action: "Drown!",
      phase: PHASE1
    }
  ];

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.initializeTimers();
  }

  private initializeTimers(): void {
    this.timers.forEach((timerStruct) => {
      timerStruct.timer = new CountdownTimer(timerStruct.duration, false);
      timerStruct.timer
        .getTimer$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(timerTick => {
          timerStruct.timerTick = timerTick;
          if (timerTick.time <= 0) {
            timerStruct.timer = new CountdownTimer(timerStruct.duration, true);
          }

          this.changeDetectorRef.markForCheck();
        });
    });

    this.changeDetectorRef.markForCheck();
  }

  getTimers(): TimerStruct[] {
    return this.timers;
  }

  setMode(mode: string): void {
    if (mode == this.currentMode) {
      return;
    }
    this.currentMode = mode;
    this.timers.forEach((timerStruct) => {
      timerStruct.timer?.reset();
      timerStruct.timer?.resume();
      this.changeDetectorRef.markForCheck();
    });

    this.changeDetectorRef.markForCheck();
  }

  getMode(): string {
    return this.currentMode;
  }

  getProgressWidth(timerTick?: CountdownTimerTick): string {
    const percent = timerTick?.percent ?? 0;
    return (percent * 100).toString() + "%";
  }

  pause(timer?: CountdownTimer): void {
    timer?.pause();
    this.changeDetectorRef.markForCheck();
  }

  resume(timer?: CountdownTimer): void {
    timer?.resume();
    this.changeDetectorRef.markForCheck();
  }

  reset(timer?: CountdownTimer): void {
    timer?.reset();
    timer?.resume();
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
