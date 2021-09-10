import { CountdownTimer } from "./countdown-timer";
import { fakeAsync, tick } from "@angular/core/testing";

describe("CountdownTimer", () => {

  it("5 second timer, 1 second interval", fakeAsync(() => {
    const timer = new CountdownTimer(5000, true, 1000);
    const observer = jasmine.createSpy();
    timer.getTimer$().subscribe((countdownTick) => {
      observer(countdownTick);
    });
    tick(7000);
    expect(observer).toHaveBeenCalledWith({ time: 5000, timeString: '05.000', isExpired: false, percent: 1 });
    expect(observer).toHaveBeenCalledWith({ time: 4000, timeString: '04.000', isExpired: false, percent: 0.8 });
    expect(observer).toHaveBeenCalledWith({ time: 3000, timeString: '03.000', isExpired: false, percent: 0.6 });
    expect(observer).toHaveBeenCalledWith({ time: 2000, timeString: "02.000", isExpired: false, percent: 0.4 });
    expect(observer).toHaveBeenCalledWith({ time: 1000, timeString: "01.000", isExpired: false, percent: 0.2 });
    expect(observer).toHaveBeenCalledWith({ time: 0, timeString: "", isExpired: true, percent: 0 });

    timer.destroy();
  }));
  
});
