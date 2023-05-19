import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { CrmCreditAmount } from '../models/crm-credit-amount.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-crm-credit-amount',
  templateUrl: './crm-credit-amount.component.html',
  styleUrls: ['./crm-credit-amount.component.scss']
})
export class CrmCreditAmountComponent implements OnInit {
  crmCreditAmountLoading: boolean = false;
  crmCreditAmountForm: FormGroup;
  crmCreditAmountObj: Array<CrmCreditAmount> = [];
  chassisNo: string = "";
  dealerInvoiceNo: string = "";
 
  constructor(private sharedService: SharedService, 
              private messageService: MessageService, 
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.dragAndScrollTable();
    
    this.sharedService.getDealerInvoiceNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != "") {
        this.dealerInvoiceNo = response;

        if(this.dealerInvoiceNo != null && this.dealerInvoiceNo != ""){
          this.getCRMCreditAmount();
        }
      }
    });
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#crmCreditAmountTable');
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

  getCRMCreditAmount(){
    this.crmCreditAmountLoading = true;

    let crmCreditAmountInputParams: HttpParams = new HttpParams();
    crmCreditAmountInputParams = crmCreditAmountInputParams.set('dlrInvoiceNo', this.dealerInvoiceNo);

    this.claimsService.getCRMCreditAmount(crmCreditAmountInputParams).subscribe((crmCreditAmountResponse) => {
      if(crmCreditAmountResponse && crmCreditAmountResponse != null && crmCreditAmountResponse.STATUS_OUT != null && crmCreditAmountResponse.STATUS_OUT != "" && crmCreditAmountResponse.RESPONSE_OUT != null && crmCreditAmountResponse.RESPONSE_OUT != "" && crmCreditAmountResponse.RESPONSE_OUT.length > 0) {
        this.crmCreditAmountObj = crmCreditAmountResponse.RESPONSE_OUT;
      }
      else {
        this.crmCreditAmountObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for CRM Credit Amount', life: 10000 });
      }
  
      this.crmCreditAmountLoading = false;
    }, (error) => {
      this.crmCreditAmountLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'crmCreditAmountMessage', severity: 'error', summary: 'Error', detail: 'Error Getting CRM Credit Amount Data', life: 10000 });
      }
    });
  }
}
