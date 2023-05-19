import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ActionHistory } from '../models/action-history.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-action-history',
  templateUrl: './group-claim-action-history.component.html',
  styleUrls: ['./group-claim-action-history.component.scss']
})
export class GroupClaimActionHistoryComponent implements OnInit {
  isGroupActionHistoryObj: boolean = true;
  groupActionHistoryLoading: boolean = false;
  groupActionHistoryObj: Array<ActionHistory> = [];
  
  constructor(private claimsService: ClaimsService,
              private sharedservice: SharedService, 
              private messageService: MessageService) { }

  ngOnInit() {
    this.dragAndScroll();

    this.sharedservice.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getGroupActionHistory(response);
      }
    }); 
  }

  dragAndScroll(){
    const slider = document.querySelector<HTMLElement>('#groupActionHistoryTable');
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

  getGroupActionHistory(gClaimId: string) {
    this.groupActionHistoryLoading = true;

    this.claimsService.getGroupActionHistory(gClaimId).subscribe((groupActionHistoryResponse) => {
      if(groupActionHistoryResponse && groupActionHistoryResponse != null && groupActionHistoryResponse.STATUS_OUT == "SUCCESS" && groupActionHistoryResponse.RESPONSE_OUT.length > 0){
        this.groupActionHistoryObj = groupActionHistoryResponse.RESPONSE_OUT;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupActionHistoryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action History', life: 7000}); 
      }
      
      this.groupActionHistoryLoading = false;
    }, (error) => {
      this.groupActionHistoryLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupActionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupActionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupActionHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupActionHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupActionHistoryMessage', severity:'error', summary: 'Error', detail:'Error Getting Action History', life: 7000}); 
      }
    });
  }

}
