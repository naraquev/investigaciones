import { Injectable, HostListener } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { EventManager } from '@angular/platform-browser';

@Injectable()
export class WindowSize {

    public innerWidth: any;
    public mobile: boolean;
    private subject: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    public get isMobileObservable() {
        return this.subject.asObservable();
    }

    //Hacer con un behavior subject
    constructor(
        private eventManager: EventManager
    ) {
        this.innerWidth = window.innerWidth;
        this.subject.next(this.isMobile());
        this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    }

    onResize(event) {
        this.innerWidth = window.innerWidth;
        this.subject.next(this.isMobile());
    }

    public isMobile(width = '767'): boolean {
        return this.innerWidth < width
    }


}