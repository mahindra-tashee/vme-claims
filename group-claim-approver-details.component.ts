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
import { Action } from '../models/action.model';
import { User } from '../models/user.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-group-claim-approver-details',
  templateUrl: './group-claim-approver-details.component.html',
  styleUrls: ['./group-claim-approver-details.component.scss']
})
export class GroupClaimApproverDetailsComponent implements OnInit {
  groupClaimApproverDetailsForm: FormGroup;
  groupClaimOtherApproverDetailsForm: FormGroup;
  groupClaimApproverDetailsLoading: boolean = false;
  groupClaimApproverDetailsObj: Array<GrpClaimDetails> = [];
  groupClaimApproverDetailsDataObj: Array<GroupClaim> = [];
  individualClaimViewUrl: any;
  businessUnit: string = "";
  role: string = "";
  actionList: Array<Action> = [];
  isGDCFinance: boolean = false;
  isGDCChecker: boolean = false;
  isGDCHold: boolean = false;
  isGroupUserList: boolean = false;
  isGroupRemark: boolean = true;
  groupUserList: Array<User> = [];

  constructor(private claimsService: ClaimsService,
              private sharedService: SharedService, 
              private formBuilder: FormBuilder,
              private datePipe: DatePipe, 
              private messageService: MessageService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScroll();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
        this.businessUnit = response;

        setTimeout(() => {
          if(this.sharedService.groupClaimObjById && this.sharedService.groupClaimObjById != null && this.sharedService.groupClaimObjById != ""){
            this.groupClaimApproverDetailsDataObj[0] = this.sharedService.groupClaimObjById;
          }
        }, 0);
      }
      else{
        this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getRole().subscribe((response) => {
      if(response && response != null && response != "" && response == "MGDC"){
        this.isGDCFinance = true;
        this.isGDCChecker = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && response == "CGDC"){
        this.isGDCChecker = true;
        this.isGDCFinance = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && (response == "GDCH" || response == "OLHD" || response == "OPHD")){
        this.isGDCChecker = false;
        this.isGDCFinance = false;
        this.isGDCHold = true;
      }
      else{
        this.isGDCFinance = false;
        this.isGDCChecker = false;
        this.isGDCHold = false;
      }
    });

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getTaggedIndividualGroupClaims(response);
        this.getGroupClaimDetailsById(response);
      }
    });

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          this.groupClaimOtherApproverDetailsForm.controls.ACTION.setValue((this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_group_claim_approver_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
        
          (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_group_claim_approver_details_action').dropdown('get value') == "APPR" ? this.isGroupUserList = true : this.isGroupUserList = false;
          this.isGroupUserList ? this.getUserList(): '';
          }, 0);
      }

      $('#dd_group_claim_approver_details_action').parent().removeClass('loading');
      $('#dd_group_claim_approver_details_action').parent().removeClass('disabled');
    });

    this.sharedService.getAction().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupClaimOtherApproverDetailsForm.controls.ACTION.setValue(response);
        jQuery('#dd_group_claim_approver_details_action').dropdown('set selected', response);
      }
    });

    this.sharedService.getRemark().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupClaimOtherApproverDetailsForm.controls.REMARK.setValue(response);
      }
    });
  }

  initializeComponent() {
    setTimeout(() => {
      jQuery('#dd_group_claim_approver_details_action').dropdown();
      jQuery('#dd_group_claim_approver_details_user').dropdown();
      jQuery('#dd_group_claim_approver_details_reason').dropdown();

      $('#dd_group_claim_approver_details_action').on('change', () => {
        (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_group_claim_approver_details_action').dropdown('get value') == "APPR" ? this.isGroupUserList = true : this.isGroupUserList = false;

        this.isGroupUserList ? this.getUserList(): '';
      });

      $('#dd_group_claim_approver_details_reason').on('change', () => {
        if(jQuery('#dd_group_claim_approver_details_reason').dropdown('get value') == "Your Own Comment"){
          this.isGroupRemark = true;
          this.groupClaimOtherApproverDetailsForm.controls.REMARK.addValidators(Validators.required);
        }
        else{
          this.isGroupRemark = false;
          this.groupClaimOtherApproverDetailsForm.controls.REMARK.clearValidators();
        }

        this.groupClaimOtherApproverDetailsForm.controls.REMARK.setValue('');
      });

      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();

      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_group_claim_approver_details_gst_invoice_date").calendar({
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
          this.groupClaimOtherApproverDetailsForm.controls.GST_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

      jQuery("#cal_group_claim_approver_details_acknowledgement_date").calendar({
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
          this.groupClaimOtherApproverDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

      $('#txt_group_claim_approver_details_gst_invoice_date').parent().addClass('disabled');
      $('#txt_group_claim_approver_details_acknowledgement_date').parent().addClass('disabled');
    }, 0);

    this.createOrEditForm();
  }

  dragAndScroll() {
    const slider = document.querySelector<HTMLElement>('#groupClaimApproverDetailsTable');
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

  createOrEditForm() {
    this.groupClaimApproverDetailsForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [''],
      GROUP_CLAIM_AMOUNT_TOTAL: [0],
      SCHEME_NAME: [''],
      SCHEME_ID: [''],
      PER_CHASSIS_CLAIM_LIMIT: ['']
    });

    this.groupClaimOtherApproverDetailsForm = this.formBuilder.group({
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
      GST_INVOICE_DATE: [''],
      ACTION: ['', Validators.required],
      REMARK: ['', Validators.required],
      USER: ['', this.isGroupUserList ? Validators.required : '']
    });

    setTimeout(() => {
      jQuery('#dd_group_claim_approver_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));

      this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
      this.sharedService.changeRemark(this.groupClaimApproverDetailsDataObj[0]?.remarks);
    }, 0);
  }

  getUserList(){
    $('#dd_group_claim_approver_details_user').parent().addClass('loading');
    $('#dd_group_claim_approver_details_user').parent().addClass('disabled');

    let approverUserListInputParams: HttpParams = new HttpParams();

    approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.groupClaimApproverDetailsForm.controls.GROUP_CLAIM_ID.value);
    approverUserListInputParams = approverUserListInputParams.set('action_IN', this.groupClaimOtherApproverDetailsForm.controls.ACTION.value);
    approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'GRP');
    approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);

    this.claimsService.getApproverUserList(approverUserListInputParams).subscribe((groupClaimApproverDetailsResponse) => {
      if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse != "" && groupClaimApproverDetailsResponse.STATUS_OUT && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDetailsResponse.COUNT && groupClaimApproverDetailsResponse.COUNT != null && groupClaimApproverDetailsResponse.COUNT != "" && groupClaimApproverDetailsResponse.COUNT > 0){
        this.groupUserList = groupClaimApproverDetailsResponse.RESPONSE_OUT;
      }
      else if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse != "" && groupClaimApproverDetailsResponse.STATUS_OUT && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDetailsResponse.COUNT && groupClaimApproverDetailsResponse.COUNT != null && groupClaimApproverDetailsResponse.COUNT != "" && groupClaimApproverDetailsResponse.COUNT <= 0){
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'info', summary: 'Note', detail: 'No Data Available for User Names', life: 7000});
      }
      else{
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names: ' + groupClaimApproverDetailsResponse.RESPONSE_OUT, life: 7000});
      }
      
      $('#dd_group_claim_approver_details_user').parent().removeClass('loading');
      $('#dd_group_claim_approver_details_user').parent().removeClass('disabled');
    }, (error) => {
      $('#dd_group_claim_approver_details_user').parent().removeClass('loading');
      $('#dd_group_claim_approver_details_user').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names', life: 7000});
      }
    });
  }

  getTaggedIndividualGroupClaims(gClaimId) {
    this.groupClaimApproverDetailsLoading = true;
    
    this.claimsService.getTaggedIndividualGroupClaims(gClaimId).subscribe((groupClaimApproverDetailsResponse) => {
      if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT != null && groupClaimApproverDetailsResponse.RESPONSE_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimApproverDetailsObj = groupClaimApproverDetailsResponse.RESPONSE_OUT;
        this.sharedService.taggedIndividualGroupClaimById = this.groupClaimApproverDetailsObj;

        setTimeout(() => {
          this.setGroupClaimData();
        }, 0);
      }
      else {
        this.groupClaimApproverDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Tagged Individual Claims for Group', life: 7000 });
      }

      this.groupClaimApproverDetailsLoading = false;
    }, (error) => {
      this.groupClaimApproverDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Tagged Individual Claims for Group', life: 7000 });
      }
    });
  }

  getGroupClaimDetailsById(groupClaimId) {
    let claimdetailsParams = new HttpParams();
    claimdetailsParams = claimdetailsParams.set('groupClaimId', groupClaimId);
    
    this.claimsService.getGroupClaimDetailsById(groupClaimId).subscribe((groupClaimApproverDetailsResponse) => {
      if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT != null && groupClaimApproverDetailsResponse.RESPONSE_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimApproverDetailsDataObj = groupClaimApproverDetailsResponse.RESPONSE_OUT;
        this.sharedService.groupClaimObjById = this.groupClaimApproverDetailsDataObj;
        this.groupClaimApproverDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.setValue(this.groupClaimApproverDetailsDataObj[0].claim_AMT);
      }
      else {
        this.groupClaimApproverDetailsDataObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Claim', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim', life: 7000 });
      }
    });
  }

  setGroupClaimData(){
    this.groupClaimApproverDetailsForm.controls.GROUP_CLAIM_ID.setValue(this.groupClaimApproverDetailsObj[0].g_CLAIM_ID);
    this.groupClaimApproverDetailsForm.controls.SCHEME_NAME.setValue(this.groupClaimApproverDetailsObj[0].scheme_NAME);
    this.groupClaimApproverDetailsForm.controls.SCHEME_ID.setValue(this.groupClaimApproverDetailsObj[0].scheme_ID);
    this.groupClaimApproverDetailsForm.controls.PER_CHASSIS_CLAIM_LIMIT.setValue(this.groupClaimApproverDetailsObj[0].max_CLAIM_AMT);
    
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_BUSINESS_UNIT.setValue(this.groupClaimApproverDetailsObj[0].bu_ID);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_CODE.setValue(this.groupClaimApproverDetailsObj[0].dealercode);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_NAME.setValue(this.groupClaimApproverDetailsObj[0].dlr_NAME);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_LOCATION.setValue(this.groupClaimApproverDetailsObj[0].dlr_LOCATION);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_REGION.setValue(this.groupClaimApproverDetailsObj[0].region);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_AREA.setValue(this.groupClaimApproverDetailsObj[0].area);
    this.groupClaimOtherApproverDetailsForm.controls.DEALER_ZONE.setValue(this.groupClaimApproverDetailsObj[0].zone);
    this.groupClaimOtherApproverDetailsForm.controls.CHASSIS_BUSINESS_UNIT.setValue(this.groupClaimApproverDetailsObj[0].chassi_BU);
    this.groupClaimOtherApproverDetailsForm.controls.LOB.setValue(this.groupClaimApproverDetailsObj[0].lob);
    this.groupClaimOtherApproverDetailsForm.controls.PPL.setValue(this.groupClaimApproverDetailsObj[0].ppl);
    this.groupClaimOtherApproverDetailsForm.controls.IRN.setValue(this.groupClaimApproverDetailsObj[0].irn_NUMBER);
    this.groupClaimOtherApproverDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.groupClaimApproverDetailsObj[0].acknowledgement_NO);
    this.groupClaimOtherApproverDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.groupClaimApproverDetailsObj[0].acknowledgement_DATE, 'dd-MMM-yyyy'));
    this.groupClaimOtherApproverDetailsForm.controls.GST_INVOICE_NO.setValue(this.groupClaimApproverDetailsObj[0].gst_INV_NO);
    this.groupClaimOtherApproverDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.groupClaimApproverDetailsObj[0].gst_INV_DT, 'dd-MMM-yyyy'));
  }

  updateCustody(){
    this.groupClaimOtherApproverDetailsForm.markAllAsTouched();
    
    if(this.groupClaimOtherApproverDetailsForm.invalid){
      return;
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.groupClaimOtherApproverDetailsForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let groupClaimApproverInputObj: any = {};
          groupClaimApproverInputObj.pGclaim_id = this.groupClaimApproverDetailsForm.controls.GROUP_CLAIM_ID.value;
          groupClaimApproverInputObj.pAction = this.groupClaimOtherApproverDetailsForm.controls.ACTION.value;

          if(jQuery('#dd_group_claim_approver_details_reason').dropdown('get value') == "Your Own Comment"){
            groupClaimApproverInputObj.pRemark = this.groupClaimOtherApproverDetailsForm.controls.REMARK.value;
          }
          else{
            groupClaimApproverInputObj.remark = jQuery('#dd_group_claim_approver_details_reason').dropdown('get value');
          }
          
          groupClaimApproverInputObj.pFromRole = this.sharedService.userRole;
          groupClaimApproverInputObj.pToRole = this.groupClaimOtherApproverDetailsForm.controls.USER.value;

          this.claimsService.postApproverGroupClaim(groupClaimApproverInputObj).subscribe((groupClaimApproverDetailsResponse) => {
            if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse != "" && groupClaimApproverDetailsResponse.STATUS_OUT && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDetailsResponse.RESPONSE_OUT && groupClaimApproverDetailsResponse.RESPONSE_OUT != null && groupClaimApproverDetailsResponse.RESPONSE_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT.length > 0){
              if(groupClaimApproverDetailsResponse.RESPONSE_OUT[0].successOut == "TRUE"){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Group Claim Custody Updated Successfully', life: 7000});

                this.getGroupClaimDataById(this.groupClaimApproverDetailsForm.controls.GROUP_CLAIM_ID.value);
                this.sharedService.changeModifiedAction(this.groupClaimOtherApproverDetailsForm.controls.ACTION.value);
              }
              else{
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claim Custody: ' + groupClaimApproverDetailsResponse.RESPONSE_OUT[0].successMsgOut, life: 7000});
              }
            }
            else{
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }

            $('.loader').hide();
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{
            this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }
          });
        },
        key: 'groupClaimApproverDetailsDialog'
      });
    }
  }

  getGroupClaimDataById(gClaimId){
    let groupClaimObjById: any;

    this.claimsService.getGroupClaimDetailsById(gClaimId).subscribe((groupClaimApproverDetailsResponse) => {
      if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse != null && groupClaimApproverDetailsResponse.STATUS_OUT != null && groupClaimApproverDetailsResponse.STATUS_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT != null && groupClaimApproverDetailsResponse.RESPONSE_OUT != "" && groupClaimApproverDetailsResponse.RESPONSE_OUT.length > 0){
        groupClaimObjById = groupClaimApproverDetailsResponse.RESPONSE_OUT[0];

        this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, groupClaimObjById.status);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    });
  }

   getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((groupClaimApproverDetailsResponse) => {
      if(groupClaimApproverDetailsResponse && groupClaimApproverDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDetailsResponse.RESPONSE_OUT != null && groupClaimApproverDetailsResponse.RESPONSE_OUT.length > 0){
        this.actionList = groupClaimApproverDetailsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.groupClaimOtherApproverDetailsForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.groupClaimOtherApproverDetailsForm.controls.REMARK.value);
      }, 0);
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }

}
