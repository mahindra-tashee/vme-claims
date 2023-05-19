import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ActualConcessionCrm } from '../models/actual-concession-crm.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-actual-concession-crm',
  templateUrl: './actual-concession-crm.component.html',
  styleUrls: ['./actual-concession-crm.component.scss']
})
export class ActualConcessionCrmComponent implements OnInit {
  actualConcessionCRMLoading: boolean = false;
  actualConcessionCRMForm: FormGroup;
  actualConcessionCRMObj: Array<ActualConcessionCrm> = [];
  chassisNo: string = "";
  dealerInvoiceNo: string = "";
  
  constructor(private sharedService: SharedService, 
              private messageService: MessageService, 
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.dragAndScrollTable();

    this.sharedService.getDealerInvoiceNo().subscribe((response) => {
      if(response && response != null && response != "") {
        this.dealerInvoiceNo = response;

        if( this.dealerInvoiceNo != null && this.dealerInvoiceNo != ""){
          this.getActualConcessionCRM();
        }
      }
    });
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#actualConcessionCRMTable');
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

  getActualConcessionCRM() {
    this.actualConcessionCRMLoading = true;

    let actualInputParams: HttpParams = new HttpParams();
    actualInputParams = actualInputParams.set('dlrInvoiceNo', this.dealerInvoiceNo);

    this.claimsService.getActualConcessionCRM(actualInputParams).subscribe((actualConcessionCRMResponse) => {
      if(actualConcessionCRMResponse && actualConcessionCRMResponse != null && actualConcessionCRMResponse.STATUS_OUT != null && actualConcessionCRMResponse.STATUS_OUT != "" && actualConcessionCRMResponse.RESPONSE_OUT != null && actualConcessionCRMResponse.RESPONSE_OUT != "" && actualConcessionCRMResponse.RESPONSE_OUT.length > 0) {
        this.actualConcessionCRMObj = actualConcessionCRMResponse.RESPONSE_OUT;
      }
      else{
        this.actualConcessionCRMObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'actualConcessionCRMMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Actual Concession CRM', life: 7000});
      }

      this.actualConcessionCRMLoading = false;
    }, (error) => {
      this.actualConcessionCRMLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'actualConcessionCRMMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'actualConcessionCRMMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'actualConcessionCRMMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'actualConcessionCRMMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'actualConcessionCRMMessage', severity:'error', summary: 'Error', detail: 'Error Getting Actual Concession CRM Data', life: 7000});
      }
    });
  }
}

