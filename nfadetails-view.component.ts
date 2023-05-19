import { Component, OnInit, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimsService } from '../services/claims.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedService } from '../services/shared.service';
import { DatePipe } from '@angular/common';
import { NFADetails } from '../models/nfadetails.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-nfadetails-view',
  templateUrl: './nfadetails-view.component.html',
  styleUrls: ['./nfadetails-view.component.scss']
})
export class NFADetailsViewComponent implements OnInit {
  nfaDetailsViewForm: FormGroup;
  nfaNo: string;
  claimId: string;
  chassisNo: string;
  schemeId: string;
  dealerInvoiceNo: string;
  nfaDetailsObj: Array<NFADetails> = [];
  nfaDetailsLoading: boolean = false;
  nfaDetailsCalculationVASObj: any = [];
  nfaDetailsCalculationVASLoading: boolean = false;
  nfaDetailsCalculationObj: any = [];
  nfaDetailsCalculationLoading: boolean = false;
  nfaDetailsCalculationDetailsObj: any = [];
  nfaDetailsCalculationDetailsLoading: boolean = false;
  sapFlatDetailsCalculationObj: any = [];
  sapFlatDetailsCalculationLoading: boolean = false;
  concessionDetailsObj: any = [];
  concessionDetailsLoading: boolean = false;
  claimDetailsObj: any = [];
  claimDetailsLoading: boolean = false;

  constructor(private messageService: MessageService,
              private claimsService: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService,
              private confirmationService: ConfirmationService,
              private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();
    this.dragAndScrollNFADetailsCalculationTable();
    this.dragAndScrollSAPFlatDetailsCalculationTable();

    this.sharedService.getNFANo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.nfaNo = response;

        if(this.nfaNo != null && this.nfaNo != "" && this.claimId != null && this.claimId != "" && this.chassisNo != null && this.chassisNo != "" && this.schemeId != null && this.schemeId != ""){
          this.getNFADetails();
          this.getNFADetailsByChassis();
        }
      }
    });

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.chassisNo = response;

        if(this.nfaNo != null && this.nfaNo != "" && this.claimId != null && this.claimId != "" && this.chassisNo != null && this.chassisNo != "" && this.schemeId != null && this.schemeId != ""){
          this.getNFADetails();
          this.getNFADetailsByChassis();
        }
      }
    });

    this.sharedService.getClaimId().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.claimId = response;

        if(this.nfaNo != null && this.nfaNo != "" && this.claimId != null && this.claimId != "" && this.chassisNo != null && this.chassisNo != "" && this.schemeId != null && this.schemeId != ""){
          this.getNFADetails();
          this.getNFADetailsByChassis();
        }
      }
    });

    this.sharedService.getSchemeId().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.schemeId = response;

        if(this.nfaNo != null && this.nfaNo != "" && this.claimId != null && this.claimId != "" && this.chassisNo != null && this.chassisNo != "" && this.schemeId != null && this.schemeId != ""){
          this.getNFADetails();
          this.getNFADetailsByChassis();
        }
      }
    });
  }

  initializeComponent(): void {
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();

      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_nfa_details_nfa_approval_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.nfaDetailsViewForm.controls.NFA_APPROVAL_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));
      
      $('#txt_nfa_details_nfa_approval_date').parent().addClass('disabled');
    }, 0);

    this.createOrEditForm();
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#nfaDetailsTable');
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

  dragAndScrollNFADetailsCalculationTable(){
    const slider = document.querySelector<HTMLElement>('#nfaDetailsCalculationTable');
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

  dragAndScrollSAPFlatDetailsCalculationTable(){
    const slider = document.querySelector<HTMLElement>('#sapFlatDetailsCalculationTable');
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

  createOrEditForm() {
    this.nfaDetailsViewForm = this.formBuilder.group({
      NFA_NO: [''],
      OPTY_ID: [''],
      TML_DISCOUNT: [''],
      USED_DISCOUNT: [''],
      DEALER_MARGIN: [''],
      RETENSION: [''],
      FLAT_SCHEME: [''],
      APPROVED_AMOUNT: [''],
      APPROVED_DEAL_SIZE: [''],
      APPROVED_AMOUNT_PER_CHASSIS: [''],
      REQUIRED_DEAL_SIZE: [''],
      NO_OF_RETAILS: [''],
      NFA_STATUS: [''],
      CREDIT_AMOUNT: [''],
      NFA_APPROVAL_DATE: ['']
    });

    setTimeout(() => {
      this.nfaDetailsViewForm.controls.NFA_APPROVAL_DATE.disable();
    }, 0);
  }

  getNFADetails(){
    let nfaDetailsInputParam: HttpParams = new HttpParams();
    nfaDetailsInputParam = nfaDetailsInputParam.set('nfaNo', this.nfaNo);
    nfaDetailsInputParam = nfaDetailsInputParam.set('claimid', this.claimId);
    nfaDetailsInputParam = nfaDetailsInputParam.set('chassis', this.chassisNo);

    this.claimsService.getNFADetails(nfaDetailsInputParam).subscribe((nfaDetailsViewResponse) => {
      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT && nfaDetailsViewResponse.RESPONSE_OUT != "" && nfaDetailsViewResponse.RESPONSE_OUT != null){
        this.nfaDetailsViewForm.controls.NFA_NO.setValue(nfaDetailsViewResponse.RESPONSE_OUT.nfa_REQUEST_NO);
        this.nfaDetailsViewForm.controls.OPTY_ID.setValue(nfaDetailsViewResponse.RESPONSE_OUT.opty_ID);
        this.nfaDetailsViewForm.controls.TML_DISCOUNT.setValue(nfaDetailsViewResponse.RESPONSE_OUT.discount_TML);
        this.nfaDetailsViewForm.controls.USED_DISCOUNT.setValue(nfaDetailsViewResponse.RESPONSE_OUT.used_FLAT_DISC);
        this.nfaDetailsViewForm.controls.DEALER_MARGIN.setValue(nfaDetailsViewResponse.RESPONSE_OUT.delaer_MARGIN);
        this.nfaDetailsViewForm.controls.RETENSION.setValue(nfaDetailsViewResponse.RESPONSE_OUT.retention);
        this.nfaDetailsViewForm.controls.FLAT_SCHEME.setValue(nfaDetailsViewResponse.RESPONSE_OUT.flat_SCHEME);
        this.nfaDetailsViewForm.controls.APPROVED_AMOUNT.setValue(nfaDetailsViewResponse.RESPONSE_OUT.final_APPROVED_AMOUNT);
        this.nfaDetailsViewForm.controls.APPROVED_DEAL_SIZE.setValue(nfaDetailsViewResponse.RESPONSE_OUT.deal_SIZE);
        this.nfaDetailsViewForm.controls.APPROVED_AMOUNT_PER_CHASSIS.setValue(nfaDetailsViewResponse.RESPONSE_OUT.amount_PER_CHASSIS);
        this.nfaDetailsViewForm.controls.REQUIRED_DEAL_SIZE.setValue(nfaDetailsViewResponse.RESPONSE_OUT.req_DEAL_SIZE);
        this.nfaDetailsViewForm.controls.NO_OF_RETAILS.setValue(nfaDetailsViewResponse.RESPONSE_OUT.no_RETAILS);
        this.nfaDetailsViewForm.controls.NFA_STATUS.setValue(nfaDetailsViewResponse.RESPONSE_OUT.status);
        this.nfaDetailsViewForm.controls.CREDIT_AMOUNT.setValue(nfaDetailsViewResponse.RESPONSE_OUT.syscredit);
        this.nfaDetailsViewForm.controls.NFA_APPROVAL_DATE.setValue(this.datePipe.transform(nfaDetailsViewResponse.RESPONSE_OUT.assigned_DATE, 'dd-MMM-yyyy'));
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for NFA Details', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting NFA Details', life: 7000});
      }
    });
  }

  getNFADetailsByChassis(){
    this.nfaDetailsLoading = true;

    let nfaDetailsInputParam: HttpParams = new HttpParams();
    nfaDetailsInputParam = nfaDetailsInputParam.set('chassis', this.chassisNo);

    this.claimsService.getNFADetailsByChassis(nfaDetailsInputParam).subscribe((nfaDetailsViewResponse) => {
      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT && nfaDetailsViewResponse.RESPONSE_OUT != "" && nfaDetailsViewResponse.RESPONSE_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT.length > 0){
        this.nfaDetailsObj = nfaDetailsViewResponse.RESPONSE_OUT;
        this.dealerInvoiceNo = this.nfaDetailsObj[0].dealerInvoiceNo;

        setTimeout(() => {
          this.getConcessionDetailsCalculation();
          this.getNFADetailsCalculation();
          this.getSAPFlatDetailsCalculation();
        }, 0);
      }
      else{
        this.nfaDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for NFA Details', life: 7000});
      }

      this.nfaDetailsLoading = false;
    }, (error) => {
      this.nfaDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'nfaDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting NFA Details', life: 7000});
      }
    });
  }

  getNFADetailsCalculation(){
    this.nfaDetailsCalculationLoading = true;

    let nfaDetailsCalculationInputParam: HttpParams = new HttpParams();
    nfaDetailsCalculationInputParam = nfaDetailsCalculationInputParam.set('nfaNo', this.nfaNo);
    nfaDetailsCalculationInputParam = nfaDetailsCalculationInputParam.set('chassis', this.chassisNo);
    nfaDetailsCalculationInputParam = nfaDetailsCalculationInputParam.set('schemeid', this.schemeId);

    this.claimsService.getNFADetailsCalculation(nfaDetailsCalculationInputParam).subscribe((nfaDetailsViewResponse) => {
      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT[0] && nfaDetailsViewResponse.RESPONSE_OUT[0] != "" && nfaDetailsViewResponse.RESPONSE_OUT[0] != null && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaVASDetails && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaVASDetails != "" && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaVASDetails != ""){
        this.nfaDetailsCalculationVASObj[0] = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaVASDetails;
      }
      else{
        this.nfaDetailsCalculationVASObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for NFA Calculation', life: 7000});
      }

      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT[0] && nfaDetailsViewResponse.RESPONSE_OUT[0] != "" && nfaDetailsViewResponse.RESPONSE_OUT[0] != null && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaDetails && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaDetails != "" && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaDetails != ""){
        this.nfaDetailsCalculationDetailsObj[0] = new Object();
        this.nfaDetailsCalculationDetailsObj[0].header = "TML Discount";
        this.nfaDetailsCalculationDetailsObj[0].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.tmlDiscount;

        this.nfaDetailsCalculationDetailsObj[1] = new Object();
        this.nfaDetailsCalculationDetailsObj[1].header = "Flat as per NFA Portal";
        this.nfaDetailsCalculationDetailsObj[1].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.flatAsPerNFA;

        this.nfaDetailsCalculationDetailsObj[2] = new Object();
        this.nfaDetailsCalculationDetailsObj[2].header = "Dealer Share (Dealer Margin - Dealer Retention)";
        this.nfaDetailsCalculationDetailsObj[2].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.dealerShare;

        this.nfaDetailsCalculationDetailsObj[3] = new Object();
        this.nfaDetailsCalculationDetailsObj[3].header = "Net NFA Support Seeked";
        this.nfaDetailsCalculationDetailsObj[3].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.netSupportSeeked;

        this.nfaDetailsCalculationDetailsObj[4] = new Object();
        this.nfaDetailsCalculationDetailsObj[4].header = "Approved TML Discount";
        this.nfaDetailsCalculationDetailsObj[4].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.approvedTMLDiscount;

        this.nfaDetailsCalculationDetailsObj[5] = new Object();
        this.nfaDetailsCalculationDetailsObj[5].header = "Approval Difference";
        this.nfaDetailsCalculationDetailsObj[5].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaDetails?.approvalDiff;
      }
      else{
        this.nfaDetailsCalculationDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for NFA Calculation', life: 7000});
      }

      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT[0] && nfaDetailsViewResponse.RESPONSE_OUT[0] != "" && nfaDetailsViewResponse.RESPONSE_OUT[0] != null && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaCalcualtion && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaCalcualtion != "" && nfaDetailsViewResponse.RESPONSE_OUT[0].nfaCalcualtion != ""){
        let count: number = 0;

        if(this.schemeId == "SCHM-X"){
          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Revised Cash Discount";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.revisedCashDisc;

          count++;
          
          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Approval Difference (Consumed)";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.approvalDiffConsumed;

          count++;
        }
        else{
          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Revised TML Discount (Before Financial Subvention and Price hike Adjustment)";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.revisedtmlDisc;

          count++;

          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Financial Subvention";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.financierSubvention;

          count++;

          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Price Hike";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.priceHike;

          count++;

          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Adjusted TML Discount";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.adjTmlDisc;

          count++;
        }

        this.nfaDetailsCalculationObj[count] = new Object();
        this.nfaDetailsCalculationObj[count].header = "Flat Discount As Per SAP (Consumed)";
        this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.flatDiscountConsumed;

        count++;

        this.nfaDetailsCalculationObj[count] = new Object();
        this.nfaDetailsCalculationObj[count].header = "Net TML Support";
        this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.netTMLSupp;

        count++;

        if(this.schemeId == "SCHM-X"){
          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Final TML Support";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.finalTMLSupp;

          count++;
        }

        this.nfaDetailsCalculationObj[count] = new Object();
        this.nfaDetailsCalculationObj[count].header = "Pre GST TML Support";
        this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.preGstTmlSupp;

        count++;

        if(this.schemeId != "SCHM-X"){
          this.nfaDetailsCalculationObj[count] = new Object();
          this.nfaDetailsCalculationObj[count].header = "Dealer share (Dealer Margin - Dealer Retention)";
          this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.dealerShare;

          count++;
        }

        this.nfaDetailsCalculationObj[count] = new Object();
        this.nfaDetailsCalculationObj[count].header = "Net Pre GST TML Support";
        this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.netPreGsttmlSupp;

        count++;

        this.nfaDetailsCalculationObj[count] = new Object();
        this.nfaDetailsCalculationObj[count].header = "Net NFA Support Seeked";
        this.nfaDetailsCalculationObj[count].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.nfaCalcualtion?.netNfaSupSeeked;

        count++;
      }
      else{
        this.nfaDetailsCalculationObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for NFA Calculation', life: 7000});
      }

      this.nfaDetailsCalculationLoading = false;
    }, (error) => {
      this.nfaDetailsCalculationLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: 'Error Getting NFA Calculation Details', life: 7000});
      }
    });
  }

  getSAPFlatDetailsCalculation(){
    this.sapFlatDetailsCalculationLoading = true;

    let sapFlatDetailsCalculationInputParam: HttpParams = new HttpParams();
    sapFlatDetailsCalculationInputParam = sapFlatDetailsCalculationInputParam.set('chassis', this.chassisNo);

    this.claimsService.getSAPFlatDetailsCalculation(sapFlatDetailsCalculationInputParam).subscribe((nfaDetailsViewResponse) => {
      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT && nfaDetailsViewResponse.RESPONSE_OUT != "" && nfaDetailsViewResponse.RESPONSE_OUT != null){
        this.sapFlatDetailsCalculationObj[0] = new Object();
        this.sapFlatDetailsCalculationObj[0].header = "Total (Pre GST)";
        this.sapFlatDetailsCalculationObj[0].value = nfaDetailsViewResponse.RESPONSE_OUT?.total;

        this.sapFlatDetailsCalculationObj[1] = new Object();
        this.sapFlatDetailsCalculationObj[1].header = "GST Amount (@28%)";
        this.sapFlatDetailsCalculationObj[1].value = nfaDetailsViewResponse.RESPONSE_OUT?.gstAMount;

        this.sapFlatDetailsCalculationObj[2] = new Object();
        this.sapFlatDetailsCalculationObj[2].header = "Total (Post GST)";
        this.sapFlatDetailsCalculationObj[2].value = nfaDetailsViewResponse.RESPONSE_OUT?.postGST;
      }
      else{
        this.sapFlatDetailsCalculationObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for SAP Flat Calculation', life: 7000});
      }

      this.sapFlatDetailsCalculationLoading = false;
    }, (error) => {
      this.sapFlatDetailsCalculationLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'nfaDetailsViewNFACalculationMessage', severity: 'error', summary: 'Error', detail: 'Error Getting SAP Flat Calculation Details', life: 7000});
      }
    });
  }

  getConcessionDetailsCalculation(){
    this.nfaDetailsCalculationLoading = true;

    let concessionDetailsCalculationInputParam: HttpParams = new HttpParams();
    concessionDetailsCalculationInputParam = concessionDetailsCalculationInputParam.set('nfaNo', this.nfaNo);
    concessionDetailsCalculationInputParam = concessionDetailsCalculationInputParam.set('chassis', this.chassisNo);
    concessionDetailsCalculationInputParam = concessionDetailsCalculationInputParam.set('schemeid', this.schemeId);
    concessionDetailsCalculationInputParam = concessionDetailsCalculationInputParam.set('retailInvNo', this.dealerInvoiceNo);
    concessionDetailsCalculationInputParam = concessionDetailsCalculationInputParam.set('claimId', this.claimId);

    this.claimsService.getNFAConcessionDetailsCalculation(concessionDetailsCalculationInputParam).subscribe((nfaDetailsViewResponse) => {
      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT[0] && nfaDetailsViewResponse.RESPONSE_OUT[0] != "" && nfaDetailsViewResponse.RESPONSE_OUT[0] != null && nfaDetailsViewResponse.RESPONSE_OUT[0].concessionDetails && nfaDetailsViewResponse.RESPONSE_OUT[0].concessionDetails != "" && nfaDetailsViewResponse.RESPONSE_OUT[0].concessionDetails != ""){
        this.concessionDetailsObj[0] = new Object();
        this.concessionDetailsObj[0].header = "Cash Discount";
        this.concessionDetailsObj[0].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.tmldiscount;

        this.concessionDetailsObj[1] = new Object();
        this.concessionDetailsObj[1].header = "CRM Concession";
        this.concessionDetailsObj[1].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.crmconcession;

        this.concessionDetailsObj[2] = new Object();
        this.concessionDetailsObj[2].header = "Concession Adjusted So Far";
        this.concessionDetailsObj[2].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.concessionAdjustedSoFar;

        this.concessionDetailsObj[3] = new Object();
        this.concessionDetailsObj[3].header = "Balance Concession Available To Claim";
        this.concessionDetailsObj[3].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.balanceConcessionAvailable;

        this.concessionDetailsObj[4] = new Object();
        this.concessionDetailsObj[4].header = "CRM Credit Note";
        this.concessionDetailsObj[4].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.crmcreditnote;

        this.concessionDetailsObj[5] = new Object();
        this.concessionDetailsObj[5].header = "Total Concession Plus Credit Note";
        this.concessionDetailsObj[5].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.totalConcessionPlusCreditNote;

        this.concessionDetailsObj[6] = new Object();
        this.concessionDetailsObj[6].header = "Difference Excess Claim To Be Reduced";
        this.concessionDetailsObj[6].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.diffExcessReduced;

        this.concessionDetailsObj[7] = new Object();
        this.concessionDetailsObj[7].header = "Additional Credit Note Required (If Desires To Claim Full)";
        this.concessionDetailsObj[7].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.concessionDetails?.additionalCreditNote;
      }
      else{
        this.concessionDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewConcessionDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Concession Details', life: 7000});
      }

      if(nfaDetailsViewResponse && nfaDetailsViewResponse != "" && nfaDetailsViewResponse != null && nfaDetailsViewResponse.STATUS_OUT && nfaDetailsViewResponse.STATUS_OUT != "" && nfaDetailsViewResponse.STATUS_OUT != null && nfaDetailsViewResponse.RESPONSE_OUT[0] && nfaDetailsViewResponse.RESPONSE_OUT[0] != "" && nfaDetailsViewResponse.RESPONSE_OUT[0] != null && nfaDetailsViewResponse.RESPONSE_OUT[0].claimDetails && nfaDetailsViewResponse.RESPONSE_OUT[0].claimDetails != "" && nfaDetailsViewResponse.RESPONSE_OUT[0].claimDetails != ""){
        this.claimDetailsObj[0] = new Object();
        this.claimDetailsObj[0].header = "Eligible Amount";
        this.claimDetailsObj[0].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.claimDetails?.eligibleAmount;

        this.claimDetailsObj[1] = new Object();
        this.claimDetailsObj[1].header = "Claim amount (Max upto Eligible Amount)";
        this.claimDetailsObj[1].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.claimDetails?.claimAMount;

        this.claimDetailsObj[2] = new Object();
        this.claimDetailsObj[2].header = "GDC Approved Amount";
        this.claimDetailsObj[2].value = nfaDetailsViewResponse.RESPONSE_OUT[0]?.claimDetails?.gdcApprovedAmount; 
      }
      else{
        this.claimDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'nfaDetailsViewConcessionDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claim Details', life: 7000});
      }

      this.nfaDetailsCalculationLoading = false;
    }, (error) => {
      this.nfaDetailsCalculationLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'nfaDetailsViewConcessionDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewConcessionDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'nfaDetailsViewConcessionDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'nfaDetailsViewConcessionDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'nfaDetailsViewConcessionDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Concession Calculation Details', life: 7000});
      }
    });
  }

  openNFACalculation(){
    jQuery('#modal_nfa_details_view_nfa_calculation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  openConcessionDetails(){
    jQuery('#modal_nfa_details_view_concession_calculation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }
}
