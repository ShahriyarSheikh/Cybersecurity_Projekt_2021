import { Component, OnInit, OnDestroy } from '@angular/core';
import { TotalUnreadCountEmitter } from '../messages/unreadcount.emitter';

declare let $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

    isAlive: boolean = true;
    totalCount: number = 0;
    ngOnDestroy() {
        this.isAlive = false;
    }

    ngOnInit() {

        TotalUnreadCountEmitter.takeWhile(() => this.isAlive).subscribe((res: number) => {
            this.totalCount = res
        });

        const mq = window.matchMedia("(min-width: 767px)");
        if (mq.matches) {
            $("a.email").click(function () {
                $(".cus-mail-list .chat-list-wrap").animate({ left: '80px' });
            });
            $(".conversion-wrap .full-chat-head a").click(function () {
                $(".cus-mail-list .chat-list-wrap").animate({ left: '80px' });
                $(".cus-mail-list .conversion-wrap").fadeOut();
            });
        } else {
            $("a.email").click(function () {
                $(".cus-mail-list .chat-list-wrap").animate({ left: '0' });
            });
            $(".conversion-wrap .full-chat-head a").click(function () {
                $(".cus-mail-list .chat-list-wrap").animate({ left: '0' });
                $(".cus-mail-list .conversion-wrap").fadeOut();
            });
        }

        // $(".chat-list-wrap .user-w").click(function () {
        //     $(".cus-mail-list .conversion-wrap").fadeIn();
        // });

        $(".chat-list-wrap .full-chat-head a").click(function () {
            $(".chat-list-wrap").animate({ left: '-330px' });
            $('body').removeClass('email-open')
        });



        $('a.email').click(function () {
            $('body').addClass('email-open');
        });
    }
    menuToggle() {
        $('.menu-mobile .menu-and-user').slideToggle(200, 'swing');
    }
}
