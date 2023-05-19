import { DatePipe } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimsService } from '../services/claims.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { GrpClaimDetails } from '../models/grp-claim-details.model';
import { SharedService } from '../services/shared.service';
import { HttpParams } from '@angular/common/http';
import { GroupClaim } from '../models/group-claim.model';
import { environment } from 'src/environments/environment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-group-claim-details-view',
  templateUrl: './group-claim-details-view.component.html',
  styleUrls: ['./group-claim-details-view.component.scss']
})
export class GroupClaimDetailsViewComponent implements OnInit {
  groupClaimDetailsViewForm: FormGroup;
  groupClaimOtherDetailsViewForm: FormGroup;
  groupClaimDetailsViewLoading: boolean = false;
  groupClaimDetailsViewObj: Array<GrpClaimDetails> = [];
  groupClaimDetailsViewDataObj: Array<GroupClaim> = [];
  individualClaimViewUrl: any;

  constructor(private claimsService: ClaimsService,
              private sharedService: SharedService, 
              private formBuilder: FormBuilder,
              private datePipe: DatePipe, 
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScroll();

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getTaggedIndividualGroupClaims(response);
        this.getGroupClaimDetailsById(response);
      }
    });
  }

  initializeComponent() {
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();

      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_group_claim_details_view_gst_invoice_date").calendar({
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
          this.groupClaimOtherDetailsViewForm.controls.GST_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

      jQuery("#cal_group_claim_details_view_acknowledgement_date").calendar({
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
          this.groupClaimOtherDetailsViewForm.controls.ACKNOWLEDGEMENT_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

      $('#txt_group_claim_details_view_gst_invoice_date').parent().addClass('disabled');
      $('#txt_group_claim_details_view_acknowledgement_date').parent().addClass('disabled');
    }, 0);

    this.createOrViewForm();
  }

  dragAndScroll() {
    const slider = document.querySelector<HTMLElement>('#groupClaimDetailsViewTable');
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
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  createOrViewForm() {
    this.groupClaimDetailsViewForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [''],
      GROUP_CLAIM_AMOUNT_TOTAL: [0],
      SCHEME_NAME: [''],
      SCHEME_ID: [''],
      PER_CHASSIS_CLAIM_LIMIT: ['']
    });

    this.groupClaimOtherDetailsViewForm = this.formBuilder.group({
      DEALER_BUSINESS_UNIT: [''],
      DEALER_CODE: [''],
      DEALER_NAME: [''],
      DEALER_LOCATION: [''],
      DEALER_REGION: [''],
      DEALER_AREA: [''],
      DEALER_ZONE: [''],
      GROUP_CLAIM_ID: [''],
      CHASSIS_BUSINESS_UNIT: [''],
      LOB: [''],
      PPL: [''],
      IRN: [''],
      ACKNOWLEDGEMENT_NO: [''],
      ACKNOWLEDGEMENT_DATE: [''],
      GST_INVOICE_NO: [''],
      GST_INVOICE_DATE: ['']
    });
  }

  getTaggedIndividualGroupClaims(gClaimId) {
    this.groupClaimDetailsViewLoading = true;
    
    this.claimsService.getTaggedIndividualGroupClaims(gClaimId).subscribe((groupClaimDetailsViewResponse) => {
      if(groupClaimDetailsViewResponse && groupClaimDetailsViewResponse != null && groupClaimDetailsViewResponse.STATUS_OUT != null && groupClaimDetailsViewResponse.STATUS_OUT != "" && groupClaimDetailsViewResponse.RESPONSE_OUT != null && groupClaimDetailsViewResponse.RESPONSE_OUT != "" && groupClaimDetailsViewResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimDetailsViewObj = groupClaimDetailsViewResponse.RESPONSE_OUT;
        this.sharedService.taggedIndividualGroupClaimById = this.groupClaimDetailsViewObj;

        setTimeout(() => {
          this.setGroupClaimData();
        }, 0);
      }
      else {
        this.groupClaimDetailsViewObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Tagged Individual Claims for Group', life: 7000 });
      }

      this.groupClaimDetailsViewLoading = false;
    }, (error) => {
      this.groupClaimDetailsViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Tagged Individual Claims for Group', life: 7000 });
      }
    });
  }

  getGroupClaimDetailsById(groupClaimId) {
    let claimdetailsParams = new HttpParams();
    claimdetailsParams = claimdetailsParams.set('groupClaimId', groupClaimId);
    
    this.claimsService.getGroupClaimDetailsById(groupClaimId).subscribe((groupClaimDetailsViewResponse) => {
      if(groupClaimDetailsViewResponse && groupClaimDetailsViewResponse != null && groupClaimDetailsViewResponse.STATUS_OUT != null && groupClaimDetailsViewResponse.STATUS_OUT != "" && groupClaimDetailsViewResponse.RESPONSE_OUT != null && groupClaimDetailsViewResponse.RESPONSE_OUT != "" && groupClaimDetailsViewResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimDetailsViewDataObj = groupClaimDetailsViewResponse.RESPONSE_OUT;
        this.sharedService.groupClaimObjById = this.groupClaimDetailsViewDataObj;
        this.groupClaimDetailsViewForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.setValue(this.groupClaimDetailsViewDataObj[0].claim_AMT);
      }
      else {
        this.groupClaimDetailsViewDataObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Claim', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim', life: 7000 });
      }
    });
  }

  setGroupClaimData(){
    this.groupClaimDetailsViewForm.controls.GROUP_CLAIM_ID.setValue(this.groupClaimDetailsViewObj[0].g_CLAIM_ID);
    this.groupClaimDetailsViewForm.controls.SCHEME_NAME.setValue(this.groupClaimDetailsViewObj[0].scheme_NAME);
    this.groupClaimDetailsViewForm.controls.SCHEME_ID.setValue(this.groupClaimDetailsViewObj[0].scheme_ID);
    this.groupClaimDetailsViewForm.controls.PER_CHASSIS_CLAIM_LIMIT.setValue(this.groupClaimDetailsViewObj[0].max_CLAIM_AMT);
    
    this.groupClaimOtherDetailsViewForm.controls.DEALER_BUSINESS_UNIT.setValue(this.groupClaimDetailsViewObj[0].bu_ID);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_CODE.setValue(this.groupClaimDetailsViewObj[0].dealercode);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_NAME.setValue(this.groupClaimDetailsViewObj[0].dlr_NAME);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_LOCATION.setValue(this.groupClaimDetailsViewObj[0].dlr_LOCATION);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_REGION.setValue(this.groupClaimDetailsViewObj[0].region);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_AREA.setValue(this.groupClaimDetailsViewObj[0].area);
    this.groupClaimOtherDetailsViewForm.controls.DEALER_ZONE.setValue(this.groupClaimDetailsViewObj[0].zone);
    this.groupClaimOtherDetailsViewForm.controls.CHASSIS_BUSINESS_UNIT.setValue(this.groupClaimDetailsViewObj[0].chassi_BU);
    this.groupClaimOtherDetailsViewForm.controls.LOB.setValue(this.groupClaimDetailsViewObj[0].lob);
    this.groupClaimOtherDetailsViewForm.controls.PPL.setValue(this.groupClaimDetailsViewObj[0].ppl);
    this.groupClaimOtherDetailsViewForm.controls.IRN.setValue(this.groupClaimDetailsViewObj[0].irn_NUMBER);
    this.groupClaimOtherDetailsViewForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.groupClaimDetailsViewObj[0].acknowledgement_NO);
    this.groupClaimOtherDetailsViewForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.groupClaimDetailsViewObj[0].acknowledgement_DATE, 'dd-MMM-yyyy'));
    this.groupClaimOtherDetailsViewForm.controls.GST_INVOICE_NO.setValue(this.groupClaimDetailsViewObj[0].gst_INV_NO);
    this.groupClaimOtherDetailsViewForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.groupClaimDetailsViewObj[0].gst_INV_DT, 'dd-MMM-yyyy'));
  }

}