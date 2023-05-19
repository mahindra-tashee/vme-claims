import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { DealerConfirmationDetails } from '../models/dealer-confirmation-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-dealer-confirmation-audit',
  templateUrl: './dealer-confirmation-audit.component.html',
  styleUrls: ['./dealer-confirmation-audit.component.scss']
})
export class DealerConfirmationAuditComponent implements OnInit {
  isDealerConfirmationAuditObj: boolean = true;
  dealerConfirmationAuditLoading: boolean = false;
  dealerConfirmationAuditObj: Array<DealerConfirmationDetails> = [];
  claimId:string;

  constructor(private claimsService: ClaimsService,
              private sharedService: SharedService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.dragAndScroll();

    this.sharedService.getClaimId().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
       this.claimId=response;
       console.log(this.claimId)
      }
    });
    this.getDealerConfirmationAudit(this.claimId);
 
  }

  getDealerConfirmationAudit(claimId) {
    this.dealerConfirmationAuditLoading = true;

    this.claimsService.getDealerConfirmationAudit(claimId).subscribe((dealerConfirmationAuditResponse) => {
      if(dealerConfirmationAuditResponse && dealerConfirmationAuditResponse != null && dealerConfirmationAuditResponse.STATUS_OUT == "SUCCESS" && dealerConfirmationAuditResponse.RESPONSE_OUT.length > 0){
        this.dealerConfirmationAuditObj = dealerConfirmationAuditResponse.RESPONSE_OUT;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'dealerConfirmationAuditMessage', severity:'info', summary: 'Note', detail:'No Data Available for Dealer Confirmation Audit ', life: 7000}); 
      }
      
      this.dealerConfirmationAuditLoading = false;
    }, (error) => {
      this.dealerConfirmationAuditLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'dealerConfirmationAuditMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'dealerConfirmationAuditMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'dealerConfirmationAuditMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'dealerConfirmationAuditMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'dealerConfirmationAuditMessage', severity:'error', summary: 'Error', detail:'Error Getting Dealer Confirmation Audit', life: 7000}); 
      }
    });
  }

  dragAndScroll(){
    const slider = document.querySelector<HTMLElement>('#dealerConfirmationAuditTable');
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

}
