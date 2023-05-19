import { HttpParams } from '@angular/common/http';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ClaimsService } from 'src/app/services/claims.service';
import { ActionHistory } from '../models/action-history.model';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-action-history',
  templateUrl: './action-history.component.html',
  styleUrls: ['./action-history.component.scss']
})
export class ActionHistoryComponent implements OnInit {
  isActionHistoryObj: boolean = true;
  actionHistoryLoading: boolean = false;
  actionHistoryObj: Array<ActionHistory> = [];

  constructor(private claimsService: ClaimsService,
              private sharedService: SharedService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.dragAndScroll();

    this.sharedService.getClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getIndividualActionHistory(response);
      }
    });
  }

  dragAndScroll(){
    const slider = document.querySelector<HTMLElement>('#actionHistoryTable');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  getIndividualActionHistory(claimId: string) {
    this.actionHistoryLoading = true;

    this.claimsService.getIndividualActionHistory(claimId).subscribe((actionHistoryResponse) => {
      if(actionHistoryResponse && actionHistoryResponse != null && actionHistoryResponse.STATUS_OUT == "SUCCESS" && actionHistoryResponse.RESPONSE_OUT.length > 0){
        this.actionHistoryObj = actionHistoryResponse.RESPONSE_OUT;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'actionHistoryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action History', life: 7000}); 
      }
      
      this.actionHistoryLoading = false;
    }, (error) => {
      this.actionHistoryLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'actionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'actionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'actionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'actionHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'actionHistoryMessage', severity:'error', summary: 'Error', detail:'Error Getting Action History', life: 7000}); 
      }
    });
  }
}