import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { FinancierNameDetails } from '../models/financier-name-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-financier-details',
  templateUrl: './financier-details.component.html',
  styleUrls: ['./financier-details.component.scss']
})
export class FinancierDetailsComponent implements OnInit {
  financierDetailsForm: FormGroup;
  chassisNo: string;
  financierDetailsLoading: boolean = false;
  financierDetailsObj: Array<FinancierNameDetails> = [];
  financierDetailsInputParams: HttpParams;
  
  constructor(private messageService: MessageService,
              private claimsservice: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService) { }

  ngOnInit(): void {
    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if (response && response != null && response != "") {
        this.chassisNo = response;

        if(this.chassisNo != null && this.chassisNo != ""){
          this.getFinancierDetails();
          }
        }
      });

    this.initializeComponent();
  }

  initializeComponent(): void {
    this.createOrEditForm();
  }

  createOrEditForm() {
    this.financierDetailsForm = this.formBuilder.group({
      CHASSIS_NO: [''],
      DELIVERY_ORDER_DATE: [''],
      DELIVERY_ORDER_NO: [''],
      EMI: [''],
      FINANCIER_NAME: [''],
      IRR: [''],
      LOAN_SANCTION_AMT:[''],
      LOAN_TENURE:[''],
      LTV: [''],
      ORDER_NO: [''],
      SEQ_ID: [''],
      USER_ID:['']   
    });
  }

  getFinancierDetails() {
    this.financierDetailsLoading = true;
    
    this.claimsservice.getFinancierDetails(this.chassisNo).subscribe((financierDetailsResponse) => {
      if(financierDetailsResponse && financierDetailsResponse != null && financierDetailsResponse != "" && financierDetailsResponse.STATUS_OUT != "" && financierDetailsResponse.STATUS_OUT == "SUCCESS" && financierDetailsResponse.STATUS_OUT != null && financierDetailsResponse.RESPONSE_OUT != "" && financierDetailsResponse.RESPONSE_OUT != null) {
        this.financierDetailsObj = financierDetailsResponse.RESPONSE_OUT;
    
        this.financierDetailsForm.controls.CHASSIS_NO.setValue(this.financierDetailsObj[0].chassis_NO);
        this.financierDetailsForm.controls.DELIVERY_ORDER_DATE.setValue(this.financierDetailsObj[0].delivery_ORDER_DATE);
        this.financierDetailsForm.controls.DELIVERY_ORDER_NO.setValue(this.financierDetailsObj[0].delivery_ORDER_NO);
        this.financierDetailsForm.controls.EMI.setValue(this.financierDetailsObj[0].emi);
        this.financierDetailsForm.controls.FINANCIER_NAME.setValue(this.financierDetailsObj[0].financier_NAME);
        this.financierDetailsForm.controls.IRR.setValue(this.financierDetailsObj[0].iir);
        this.financierDetailsForm.controls.LOAN_SANCTION_AMT.setValue(this.financierDetailsObj[0].loan_SANCTION_AMT);
        this.financierDetailsForm.controls.LOAN_TENURE.setValue(this.financierDetailsObj[0].loan_TENURE);
        this.financierDetailsForm.controls.LTV.setValue(this.financierDetailsObj[0].ltv);
        this.financierDetailsForm.controls.ORDER_NO.setValue(this.financierDetailsObj[0].order_NO);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'financierDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Financier Details available for Chassis No', life: 7000 });
      }

      this.financierDetailsLoading = false;
    }, (error) => {
      this.financierDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'financierDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'financierDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'financierDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'financierDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'financierDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Financier Details', life: 7000 });
      }
    });
  }
}

