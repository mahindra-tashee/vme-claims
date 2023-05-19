import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { AvailConcession } from '../models/avail-concession.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-avail-concession',
  templateUrl: './avail-concession.component.html',
  styleUrls: ['./avail-concession.component.scss']
})
export class AvailConcessionComponent implements OnInit {
  availConcessionLoading: boolean = false;
  availConcessionForm: FormGroup;
  availConcessionObj: Array<AvailConcession>;
  chassisNo: string;
  claimId: string;
  schemeId:string;
  availConcessionDataObj: Array<AvailConcession>;
  

  constructor(private claimsService: ClaimsService, 
              private formbuilder: FormBuilder, 
              private sharedservice: SharedService, 
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.dragAndScrollTable();

    this.createOrViewForm();

    this.sharedservice.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != "") {
        this.chassisNo = response;

        if(this.chassisNo != null && this.chassisNo != "" && this.claimId != null && this.claimId != "" && this.schemeId != null && this.schemeId != ""){
          this.getAvailConcession();
        }
      }
    });

    this.sharedservice.getClaimId().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.claimId = response;

       if(this.chassisNo != null && this.chassisNo != "" && this.claimId != null && this.claimId != "" && this.schemeId != null && this.schemeId != ""){
          this.getAvailConcession();
        }
      }
    });
    this.sharedservice.getSchemeId().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.schemeId = response;

        if(this.chassisNo != null && this.chassisNo != "" && this.claimId != null && this.claimId != "" && this.schemeId != null && this.schemeId != ""){
          this.getAvailConcession();
        }
      }
    });
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#availConcessionTable');
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

  createOrViewForm() {
    this.availConcessionForm = this.formbuilder.group({
      DEALER_INVOICE_NO: [''],
      CONCESSION_CRM: [''],
      CREDIT_NOTE: [''],
      REMAINING_CONCESSION_CREDIT_NOTE: [''],
    });
  }

  getAvailConcession() {
    this.availConcessionLoading = true;

    let availInputParams: HttpParams = new HttpParams();

    availInputParams = availInputParams.set('chassis', this.chassisNo);
    availInputParams = availInputParams.set('claimId', this.claimId);
    availInputParams = availInputParams.set('schemeId', this.schemeId);
    this.claimsService.getAvailConcession(availInputParams).subscribe((availConcessionResponse) => {
      if(availConcessionResponse && availConcessionResponse != null && availConcessionResponse != "" && availConcessionResponse.STATUS_OUT != "" && availConcessionResponse.STATUS_OUT != null && availConcessionResponse.STATUS_OUT == "SUCCESS") {
        this.availConcessionObj = availConcessionResponse.RESPONSE_OUT.ClaimWiseDetails;
        this.availConcessionDataObj = availConcessionResponse.RESPONSE_OUT.DealerInvWiseDetails;

        this.availConcessionForm.controls.DEALER_INVOICE_NO.setValue(this.availConcessionDataObj[0].dlr_inv_no);
        this.availConcessionForm.controls.CONCESSION_CRM.setValue(this.availConcessionDataObj[0].concessionCRM);
        this.availConcessionForm.controls.CREDIT_NOTE.setValue(this.availConcessionDataObj[0].creditNote);
        this.availConcessionForm.controls.REMAINING_CONCESSION_CREDIT_NOTE.setValue(this.availConcessionDataObj[0].remainingConcession_CreditDLR);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'availConcessionMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Avail Concession', life: 7000});
      }

        this.availConcessionLoading = false;
    }, (error) => {
      this.availConcessionLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'availConcessionMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'availConcessionMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'availConcessionMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'availConcessionMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'availConcessionMessage', severity:'error', summary: 'Error', detail: 'Error Getting Avail Concession Data', life: 7000});
      }
    });
  }
}
