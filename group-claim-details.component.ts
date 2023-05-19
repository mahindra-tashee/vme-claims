import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { ClaimsService } from '../services/claims.service';
import { GrpClaimDetails } from '../models/grp-claim-details.model';
import { DatePipe } from '@angular/common';
import { SharedService } from '../services/shared.service';
import { Action } from '../models/action.model';
import { GroupClaim } from '../models/group-claim.model';
import { HttpParams } from '@angular/common/http';
import { GroupClaimIndividualInput, GroupClaimInput } from '../models/group-claim-input.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-group-claim-details',
  templateUrl: './group-claim-details.component.html',
  styleUrls: ['./group-claim-details.component.scss']
})
export class GroupClaimDetailsComponent implements OnInit {
  groupClaimDetailsForm: FormGroup;
  groupClaimOtherDetailsForm: FormGroup;
  groupClaimDetailsLoading: boolean = false;
  groupClaimDetailsObj: Array<GrpClaimDetails> = [];
  groupClaimDetailsCount: number = 0;
  groupClaimDetailsDataObj: Array<GroupClaim> = [];
  existingIndividualClaimObj: any;
  existingIndividualClaimLoading: boolean = false;
  groupInitialValidationObj: any;
  individualClaimDetailsObj: any;
  individualClaimViewUrl: any;
  isEdit: boolean = false;
  isChassis: boolean = true;
  actionList: Array<Action> = [];
  businessUnit: string = "";
  schemeId: string = "";
  chassisNo: string = "";
  ppl: string = "";
  status: string = "";
  dealerCode: string = "";
  isGenerateIRNInvoiceButton: boolean = false;
  isGenerateInvoiceButton: boolean = false;
  isDownloadInvoiceButton: boolean = false;
  isCancelIRNButton: boolean = false;
  isGenerateCreditNoteButton: boolean = false;
  isFISettlement: boolean = false;
  selectedIndividualClaims: any;
  isUnTag: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private sharedService: SharedService,
              private claimsService: ClaimsService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.createOrEditForm();
    this.dragAndScrollGroupClaimDetailsTable();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
        this.businessUnit = response;
        this.setClaimDetails();

        setTimeout(() => {
          if(this.sharedService.isGroupClaimEdit){
            this.isEdit = true;

            setTimeout(() => {
              if(this.sharedService.groupClaimObjById && this.sharedService.groupClaimObjById != null && this.sharedService.groupClaimObjById != ""){
                this.groupClaimDetailsDataObj[0] = this.sharedService.groupClaimObjById;
    
                setTimeout(() => {
                  this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.setValue(this.groupClaimDetailsDataObj[0].g_CLAIM_ID);
                  this.groupClaimDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.setValue(this.groupClaimDetailsDataObj[0].claim_AMT);
                  // this.claimDetailsForm.controls.FINAL_CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT);
                  this.groupClaimOtherDetailsForm.controls.GST_INVOICE_NO.setValue(this.sharedService.groupClaimObjById.gst_INV_NO);
                  this.groupClaimOtherDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.sharedService.groupClaimObjById.gst_INV_DT, 'dd-MMM-yyyy'));
                  this.groupClaimOtherDetailsForm.controls.IRN.setValue(this.sharedService.groupClaimObjById.irn_NUMBER);
                  this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.sharedService.groupClaimObjById.acknowledgement_NO);
                  this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.sharedService.groupClaimObjById.acknowledgement_DATE, 'dd-MMM-yyyy'));

                  setTimeout(() => {
                    this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
                    this.checkButtonVisibility();
                  }, 0);
                }, 0);
              }
            }, 0);
          }
          else{
            this.isEdit = false;
          }
        }, 0);
      }
      else{
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getSchemeId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.schemeId = response;
      }
    });

    this.sharedService.getPPL().subscribe((response) => {
      if(response && response != null && response != ""){
        this.ppl = response;
      }
    });

    this.sharedService.getGroupClaimStatus().subscribe((response) => {
      if(response && response != null && response != ""){
        this.status = response;
      }
    });

    this.sharedService.getDealerCode().subscribe((response) => {
      if(response && response != null && response != ""){
        this.dealerCode = response;
      }
    });

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          if(this.isEdit){
            this.groupClaimOtherDetailsForm.controls.ACTION.setValue( (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_group_claim_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
          }
        }, 0);
      }

      $('#dd_group_claim_details_action').parent().removeClass('loading');
      $('#dd_group_claim_details_action').parent().removeClass('disabled');
    });
  }

  dragAndScrollGroupClaimDetailsTable(){
    const slider = document.querySelector<HTMLElement>('#groupClaimDetailsTable');
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

  initializeComponent() {
    jQuery('#dd_group_claim_details_action').dropdown();
    jQuery('.checkbox').checkbox();
    jQuery('#dd_addclaimid').dropdown();

    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);

    if (!(this.actionList && this.actionList != null && this.actionList.length > 0)) {
      $('#dd_group_claim_details_action').parent().addClass('loading');
      $('#dd_group_claim_details_action').parent().addClass('disabled');
    }

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;
  }

  createOrEditForm() {
    this.groupClaimDetailsForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.g_CLAIM_ID : '', this.isEdit ? Validators.required : ''],
      GROUP_CLAIM_AMOUNT_TOTAL: [this.isEdit ? 0 : 0],
      SCHEME_NAME: [this.isEdit ? '' : '', Validators.required],
      SCHEME_ID: [this.isEdit ? '' : '', Validators.required],
      PER_CHASSIS_CLAIM_LIMIT: [this.isEdit ? '' : '', Validators.required]
    });

    this.groupClaimOtherDetailsForm = this.formBuilder.group({
      DEALER_BUSINESS_UNIT: [this.isEdit ? '' : ''],
      DEALER_CODE: [this.isEdit ? '' : ''],
      DEALER_NAME: [this.isEdit ? '' : ''],
      DEALER_LOCATION: [this.isEdit ? '' : ''],
      DEALER_REGION: [this.isEdit ? '' : ''],
      DEALER_AREA: [this.isEdit ? '' : ''],
      DEALER_ZONE: [this.isEdit ? '' : ''],
      CHASSIS_BUSINESS_UNIT: [this.isEdit ? '' : ''],
      LOB: [this.isEdit ? '' : ''],
      PPL: [this.isEdit ? '' : ''],
      IRN: [this.isEdit ? '' : ''],
      ACKNOWLEDGEMENT_NO: [this.isEdit ? '' : ''],
      ACKNOWLEDGEMENT_DATE: [this.isEdit ? '' : ''],
      GST_INVOICE_NO: [this.isEdit ? '' : ''],
      GST_INVOICE_DATE: [this.isEdit ? '' : ''],
      SETTLEMENT_TYPE: [this.isEdit ? '' : ''],
      IRN_CATEGORY: [this.isEdit ? '' : ''],
      ACTION: [this.isEdit ? '' : '', Validators.required],
      REMARK: [this.isEdit ? '' : '', Validators.required]
    });

    setTimeout(() => {
      if(this.isEdit){
        jQuery('#dd_group_claim_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));

        this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
        this.sharedService.changeRemark(this.groupClaimDetailsDataObj[0]?.remarks);
      }
    }, 0);
  }

  setClaimDetails(){
    this.isFISettlement = this.sharedService.groupClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE == "FI" ? true : false;
    this.groupClaimDetailsForm.controls.PER_CHASSIS_CLAIM_LIMIT.setValue(Number(this.sharedService.groupClaimsPreSelectedData?.schemeMasterDetailsEntity?.claim_LIMIT));
    this.groupClaimDetailsForm.controls.SCHEME_NAME.setValue(this.sharedService.groupClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME);
    this.groupClaimDetailsForm.controls.SCHEME_ID.setValue(this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity?.scheme_ID);
    this.groupClaimOtherDetailsForm.controls.DEALER_BUSINESS_UNIT.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_BU);
    this.groupClaimOtherDetailsForm.controls.DEALER_CODE.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_CODE);
    this.groupClaimOtherDetailsForm.controls.DEALER_NAME.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_NAME);
    this.groupClaimOtherDetailsForm.controls.DEALER_LOCATION.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.location);
    this.groupClaimOtherDetailsForm.controls.DEALER_REGION.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_REGION);
    this.groupClaimOtherDetailsForm.controls.DEALER_AREA.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_AREA);
    this.groupClaimOtherDetailsForm.controls.DEALER_ZONE.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_ZONE);
    this.groupClaimOtherDetailsForm.controls.CHASSIS_BUSINESS_UNIT.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.bu);
    this.groupClaimOtherDetailsForm.controls.LOB.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.lob);
    this.groupClaimOtherDetailsForm.controls.PPL.setValue(this.sharedService.groupClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.ppl);
    this.groupClaimOtherDetailsForm.controls.GST_INVOICE_NO.setValue('');
    this.groupClaimOtherDetailsForm.controls.GST_INVOICE_DATE.setValue('');
    this.groupClaimOtherDetailsForm.controls.IRN.setValue('');
    this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue('');
    this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue('');
    this.groupClaimOtherDetailsForm.controls.SETTLEMENT_TYPE.setValue(this.sharedService.groupClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE);
    this.groupClaimOtherDetailsForm.controls.IRN_CATEGORY.setValue(this.sharedService.groupClaimsPreSelectedData?.iRN_Applicability?.irn_category);
  }

  addIndividualClaim(){
    if(this.isChassis && ($('#txt_group_claim_details_cbk_chassis_no').val() == null || $('#txt_group_claim_details_cbk_chassis_no').val() == "")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Enter Chassis No', life: 7000});
      
      return;
    }

    if(!this.isChassis && ($('#txt_group_claim_details_cbk_claim_id').val() == null || $('#txt_group_claim_details_cbk_claim_id').val() == "")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Enter Claim Id', life: 7000});
      
      return;
    }
    
    if(this.isChassis && (jQuery('#txt_group_claim_details_cbk_chassis_no').val().trim() != null && jQuery('#txt_group_claim_details_cbk_chassis_no').val().trim() != "")){
      this.checkAndAddChassis();
    }

    if(!this.isChassis && (jQuery('#txt_group_claim_details_cbk_claim_id').val().trim() != null && jQuery('#txt_group_claim_details_cbk_claim_id').val().trim() != "")){
      this.checkAndAddClaimId();
    }
  }

  checkAndAddChassis(){
    $('.loader').show();

    let flag: boolean = false;

    this.groupClaimDetailsObj.filter((item) => {
      if(item.chassis_NO == jQuery('#txt_group_claim_details_cbk_chassis_no').val().trim()){
        flag = true;
        return;
      }
    });

    if(flag){
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Duplicate Chassis Already Exists', life: 7000});
      return;
    }

    if(this.chassisNo != null && this.chassisNo != ""){
      this.chassisNo = "_" + this.chassisNo;
    }
    else{
      this.chassisNo = "";
    }

    this.claimsService.groupClaimChassisValidation(jQuery('#txt_group_claim_details_cbk_chassis_no').val().trim() + this.chassisNo, this.schemeId, this.ppl).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT === "SUCCESS" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        this.getChassisDetails(jQuery('#txt_group_claim_details_cbk_chassis_no').val().trim());
        jQuery('#txt_group_claim_details_cbk_chassis_no').val('');
      }
      else if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT === "ERROR" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        jQuery('#modal_group_details_initial_validation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show'); 

        setTimeout(() => {
          this.groupInitialValidationObj = groupClaimDetailsResponse.RESPONSE_OUT;
        }, 0);
        
        $('.loader').hide();
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Validating Claim', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Validating Chassis', life: 7000});
      }
    });
  }

  getChassisDetails(chassisNo){
    this.claimsService.getChassisDetails(chassisNo).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        this.groupClaimDetailsObj[this.groupClaimDetailsCount] = new GrpClaimDetails();

        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_ID = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].chassis_NO = groupClaimDetailsResponse.RESPONSE_OUT[0]?.CHASSIS;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_AMOUNT_ORG = 0;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].used_FLAT_DISC = 0;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].avail_FLAT_DISC = 0;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_AMOUNT = 0;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].bu_ID = groupClaimDetailsResponse.RESPONSE_OUT[0]?.BU;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].cust_NAME = groupClaimDetailsResponse.RESPONSE_OUT[0]?.CUST_NAME;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].chassi_BU = groupClaimDetailsResponse.RESPONSE_OUT[0]?.BU;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].lob = groupClaimDetailsResponse.RESPONSE_OUT[0]?.LOB;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].ppl = groupClaimDetailsResponse.RESPONSE_OUT[0]?.PPL;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].pl = groupClaimDetailsResponse.RESPONSE_OUT[0]?.PL;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].vc = groupClaimDetailsResponse.RESPONSE_OUT[0]?.VC;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].vc_CATEGORY = groupClaimDetailsResponse.RESPONSE_OUT[0]?.VC_CATEGORY;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].dlr_INV_NO = groupClaimDetailsResponse.RESPONSE_OUT[0]?.Dealer_Invoice_Number;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].dlr_INV_DATE = groupClaimDetailsResponse.RESPONSE_OUT[0]?.Dealer_Invoice_Date;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].tm_INV_NO = groupClaimDetailsResponse.RESPONSE_OUT[0]?.TM_INVOICE_NO;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].tm_INV_DT = groupClaimDetailsResponse.RESPONSE_OUT[0]?.TM_Invoice_Date;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].gst_INV_NO = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].gst_INV_DT = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].irn_NUMBER = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].acknowledgement_NO = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].acknowledgement_DATE = '';
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].stock_TRANSFER = groupClaimDetailsResponse.RESPONSE_OUT[0]?.StockTransfer;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].delivery_STATUS = groupClaimDetailsResponse.RESPONSE_OUT[0]?.DELIVERY_STATUS;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].manf_DATE = groupClaimDetailsResponse.RESPONSE_OUT[0]?.MANF_DATE;

        this.groupClaimDetailsCount++;

        setTimeout(() => {
          this.calculateClaimAmount();

          $('.loader').hide();
        }, 0);
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Chassis Detail', life: 7000 });
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Chassis Details', life: 7000});
      }
    });
  }

  checkAndAddClaimId(){
    $('.loader').show();
    this.groupInitialValidationObj = [];

    let flag: boolean = false;

    this.groupClaimDetailsObj.filter((item) => {
      if(item.claim_ID == jQuery('#txt_group_claim_details_cbk_claim_id').val().trim()){
        flag = true;
        return;
      }
    });
    
    if(flag){
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Duplicate Claim Already Exists', life: 7000});
      return;
    }

    this.claimsService.groupClaimClaimValidation(jQuery('#txt_group_claim_details_cbk_claim_id').val().trim(), this.chassisNo).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT === "SUCCESS" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        jQuery('#txt_group_claim_details_cbk_claim_id').val('');

        this.groupClaimDetailsObj[this.groupClaimDetailsCount] = new GrpClaimDetails();

        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_ID = this.individualClaimDetailsObj.claim_ID;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].chassis_NO = this.individualClaimDetailsObj.chassis_NO;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_AMOUNT_ORG = this.individualClaimDetailsObj.claim_AMOUNT_ORG;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].used_FLAT_DISC = this.individualClaimDetailsObj.used_FLAT_DISC;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].claim_AMOUNT = this.individualClaimDetailsObj.claim_AMOUNT;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].bu_ID = this.individualClaimDetailsObj.bu_ID;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].cust_NAME = this.individualClaimDetailsObj.cust_NAME;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].chassi_BU = this.individualClaimDetailsObj.chassi_BU;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].lob = this.individualClaimDetailsObj.lob;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].ppl = this.individualClaimDetailsObj.ppl;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].pl = this.individualClaimDetailsObj.pl;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].vc = this.individualClaimDetailsObj.vc;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].vc_CATEGORY = this.individualClaimDetailsObj.vc_CATEGORY;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].dlr_INV_NO = this.individualClaimDetailsObj.dlr_INV_NO;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].dlr_INV_DATE = this.individualClaimDetailsObj.dlr_INV_DATE;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].tm_INV_NO = this.individualClaimDetailsObj.tm_INV_NO;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].tm_INV_DT = this.individualClaimDetailsObj.tm_INV_DT;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].stock_TRANSFER = this.individualClaimDetailsObj.stock_TRANSFER;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].delivery_STATUS = this.individualClaimDetailsObj.delivery_STATUS;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].manf_DATE = this.individualClaimDetailsObj.manf_DATE;
        this.groupClaimDetailsObj[this.groupClaimDetailsCount].remarks = this.individualClaimDetailsObj.remarks;

        this.groupClaimDetailsCount++;

        setTimeout(() => {
          this.calculateClaimAmount();

          $('.loader').hide();
        }, 0);
      }
      else if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT === "ERROR" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        this.groupInitialValidationObj = groupClaimDetailsResponse.RESPONSE_OUT;
        jQuery('#modal_group_details_initial_validation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show'); 
        
        $('.loader').hide();
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Validating Claim', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Validating Claim', life: 7000});
      }
    });
  }

  checkSaveGroup(){
    this.groupClaimDetailsForm.markAllAsTouched();
    
    if(this.groupClaimDetailsForm.invalid){
      return;
    }

    if(this.groupClaimDetailsObj.length < 2){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail: 'Group Claim can be created for atleast two Individual Claims', life: 7000});
    }
    else if(this.groupClaimOtherDetailsForm.controls.ACTION.value == "SBMT" && this.isGenerateIRNInvoiceButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Generate IRN', life: 7000});
    }
    else if(this.isCancelIRNButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Cancel IRN', life: 7000});
    }
    else if(this.isGenerateCreditNoteButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Generate Credit Note', life: 7000});
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.groupClaimOtherDetailsForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          this.saveGroupClaim(false);
        },
        key: 'groupClaimDetailsDialog'
      });
    }
  }

  saveGroupClaim(flag){
    $('.loader').show();

    let groupClaimDetailsInputObj: GroupClaimInput = new GroupClaimInput();
    groupClaimDetailsInputObj.schemeId = this.groupClaimDetailsForm.controls.SCHEME_ID.value;
    groupClaimDetailsInputObj.claimAmt = this.groupClaimDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.value;
    groupClaimDetailsInputObj.dealerCode = this.dealerCode;
    groupClaimDetailsInputObj.gClaimId = this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value;
    groupClaimDetailsInputObj.ppl = this.ppl;
    groupClaimDetailsInputObj.action = this.groupClaimOtherDetailsForm.controls.ACTION.value;
    groupClaimDetailsInputObj.remark = this.groupClaimOtherDetailsForm.controls.REMARK.value;
    groupClaimDetailsInputObj.role = this.sharedService.userRole;
    groupClaimDetailsInputObj.status = "";

    for(let i = 0; i < this.groupClaimDetailsObj.length; i++){
      groupClaimDetailsInputObj.individualClaimDetails[i] = new GroupClaimIndividualInput();
      groupClaimDetailsInputObj.individualClaimDetails[i].claimId = this.groupClaimDetailsObj[i].claim_ID;
      groupClaimDetailsInputObj.individualClaimDetails[i].chasisNumber = this.groupClaimDetailsObj[i].chassis_NO;
      groupClaimDetailsInputObj.individualClaimDetails[i].indClaimAmount = this.groupClaimDetailsObj[i].claim_AMOUNT_ORG;
    }

    this.claimsService.postGroupClaim(groupClaimDetailsInputObj).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT == "SUCCESS"){
        if((groupClaimDetailsInputObj.gClaimId == undefined || groupClaimDetailsInputObj.gClaimId == null || groupClaimDetailsInputObj.gClaimId == "") && (groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != null && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != "")){
          this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.setValue(groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP?.G_CLAIM_ID);
          this.sharedService.changeGroupClaimId(groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP?.G_CLAIM_ID);
          
          if(this.groupClaimOtherDetailsForm.controls.ACTION.value == 'SVDT'){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDetailsMessage', severity:'success', summary: 'Success', detail:'Claim Id ' + this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value + ' Created Successfully', life: 7000});
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Claim Custody Updated Successfully', life: 7000});
          }

          this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.checkButtonVisibility();
          this.sharedService.changeModifiedAction(this.groupClaimOtherDetailsForm.controls.ACTION.value);
        }
        else if((groupClaimDetailsInputObj.gClaimId != undefined || groupClaimDetailsInputObj.gClaimId != null || groupClaimDetailsInputObj.gClaimId != "") && (groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != null && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != "" && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP.RESPONSE_OUT == "Group Claim Updated Successfully")){
          if(this.groupClaimOtherDetailsForm.controls.ACTION.value == 'SVDT'){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDetailsMessage', severity:'success', summary: 'Success', detail:'Claim Id ' + this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value + ' Updated Successfully', life: 7000});
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Claim Custody Updated Successfully', life: 7000});
          }

          this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.checkButtonVisibility();
          this.sharedService.changeModifiedAction(this.groupClaimOtherDetailsForm.controls.ACTION.value);
        }
        else if((groupClaimDetailsInputObj.gClaimId != undefined || groupClaimDetailsInputObj.gClaimId != null || groupClaimDetailsInputObj.gClaimId != "") && (groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != null && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP != "" && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP.RESPONSE_OUT != "")){
          if(this.groupClaimOtherDetailsForm.controls.ACTION.value == 'SVDT'){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDetailsMessage', severity:'success', summary: 'Success', detail:'Claim Id ' + this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value + ' Updated Successfully', life: 7000});
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Claim Custody Updated Successfully', life: 7000});
          }

          this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          this.checkButtonVisibility();
          this.sharedService.changeModifiedAction(this.groupClaimOtherDetailsForm.controls.ACTION.value);
        }
        else if(groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT == "ERROR"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error in Saving Claim Details: ' + groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP?.RESPONSE_OUT, life: 7000});
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Claim Details', life: 7000});
        }
      }
      else if(groupClaimDetailsResponse && groupClaimDetailsResponse.STATUS_OUT == "ERROR"){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Group Claim Details: ' + groupClaimDetailsResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP?.RESPONSE_OUT, life: 7000});
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Group Claim Details', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Group Claim Details', life: 7000});
      }
    });
  }

  checkButtonVisibility(){
    if(this.groupClaimOtherDetailsForm.controls.IRN.value == null || this.groupClaimOtherDetailsForm.controls.IRN.value == ""){
      if(this.groupClaimOtherDetailsForm.controls.SETTLEMENT_TYPE.value == "FI" && this.groupClaimOtherDetailsForm.controls.IRN_CATEGORY.value == "Mandate" && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
        this.isGenerateIRNInvoiceButton = true;
      }
      else if(this.groupClaimOtherDetailsForm.controls.SETTLEMENT_TYPE.value == "FI" && this.groupClaimOtherDetailsForm.controls.IRN_CATEGORY.value != "Mandate" && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
        this.isGenerateInvoiceButton = true;
      }
      else{
        this.isGenerateIRNInvoiceButton = false;
        this.isGenerateInvoiceButton = false;
      }
    }
    else{
      this.isGenerateIRNInvoiceButton = false;
      this.isDownloadInvoiceButton = true;
    }
  }

  checkIRNCancelButtonVisibility(operation){
    if(this.groupClaimOtherDetailsForm.controls.IRN.value != null && this.groupClaimOtherDetailsForm.controls.IRN.value != ""){
      $('.loader').show();

      if(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){ 
        let irnAndInvoiceInputParams: HttpParams = new HttpParams();
        irnAndInvoiceInputParams = irnAndInvoiceInputParams.set('pGclaim', this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);

        this.claimsService.irnDurationCheck(irnAndInvoiceInputParams).subscribe((claimDetailsResponse) => {
          if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != ""){
            this.isCancelIRNButton = claimDetailsResponse.RESPONSE_OUT.CancelIRN;

            if(this.isCancelIRNButton){
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Please Cancel IRN', life: 7000});
            }
            else{
              this.isGenerateCreditNoteButton = true;
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Please Generate Credit Note', life: 7000});
            }

            $('.loader').hide();
          }
          else{
            this.isCancelIRNButton = false;
            
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error Getting IRN Duration', life: 7000});
          }
        }, (error) => {
          this.isCancelIRNButton = false;
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error Getting IRN Duration', life: 7000});
          }
        });
      }
      else{
        this.isCancelIRNButton = false;
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
      }
    }
    else if(operation == 'add'){
      this.addIndividualClaim();
    }
    else if(operation == 'untag'){
      this.untagIndividualClaim();
    }
  }

  generateIRNAndInvoice(){
    if(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
      $('.loader').show();

      let irnAndInvoiceInputParams: HttpParams = new HttpParams();
      irnAndInvoiceInputParams = irnAndInvoiceInputParams.set('pGclaim', this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);

      this.claimsService.generateIRNAndInvoice(irnAndInvoiceInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE && claimDetailsResponse.RESPONSE_OUT.RESPONSE != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status == "700"){
          this.isGenerateIRNInvoiceButton = false;
          this.isDownloadInvoiceButton = true;

          this.groupClaimOtherDetailsForm.controls.GST_INVOICE_NO.setValue(claimDetailsResponse.RESPONSE_OUT.Invoice_Number);
          this.groupClaimOtherDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(new Date(claimDetailsResponse.RESPONSE_OUT.Invoice_Date), 'dd-MMM-yyyy'));
          this.groupClaimOtherDetailsForm.controls.IRN.setValue(claimDetailsResponse.RESPONSE_OUT.RESPONSE.irn_no);
          this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(claimDetailsResponse.RESPONSE_OUT.RESPONSE.ack_no);
          this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(new Date(claimDetailsResponse.RESPONSE_OUT.RESPONSE.ack_dt), 'dd-MMM-yyyy'));
          
          this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'success',  summary: 'Success', detail: 'IRN and Invoice Generated Successfully', life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != null && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS == "FAIL"){
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation: ' + claimDetailsResponse.RESPONSE_OUT.IRNValidation_PMSG, life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != ""){
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation: ' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
        }
        else{
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation', life: 7000});
        }
      }, (error) => {
        this.isDownloadInvoiceButton = false;
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation', life: 7000});
        }
      }); 
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  donwloadInvoice(){
    if(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
      $('.loader').show();

      let downloadInvoiceInputParams: HttpParams = new HttpParams();
      downloadInvoiceInputParams = downloadInvoiceInputParams.set('pGclaim', this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);

      this.claimsService.downloadInvoice(downloadInvoiceInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null){
          const blob = claimDetailsResponse;
          const url = window.URL.createObjectURL(blob);
    
          var link = document.createElement('a');
          link.href = url;
          link.download = "GST-Invoice-" + this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value + ".pdf";
          link.click(); 
          $('.loader').hide();

          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Downloading Invoice', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Downloading Invoice', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  cancelIRN(){
    if(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
      $('.loader').show();

      let cancelIRNInputParams: HttpParams = new HttpParams();
      cancelIRNInputParams = cancelIRNInputParams.set('pGclaim', this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);

      this.claimsService.cancelIRN(cancelIRNInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE && claimDetailsResponse.RESPONSE_OUT.RESPONSE != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message == "IRN Cancelled"){
          this.isCancelIRNButton = false;
          this.isDownloadInvoiceButton = false;
          this.isGenerateIRNInvoiceButton = true;

          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          // this.saveGroupClaim(true);

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'success',  summary: 'Success', detail: 'IRN Cancelled Successfully', life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != null && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS == "FAIL"){
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'IRN Cancellation Failed: ' + claimDetailsResponse.RESPONSE_OUT.IRNValidation_PMSG, life: 7000});
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Cancelling IRN', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Cancelling IRN', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  generateCreditNote(){
    if(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
      $('.loader').show();

      let creditNoteInputParams: HttpParams = new HttpParams();
      creditNoteInputParams = creditNoteInputParams.set('pGclaim', this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);

      this.claimsService.generateCreditNote(creditNoteInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null){
          this.isGenerateCreditNoteButton = false;
          this.isDownloadInvoiceButton = false;
          this.isGenerateIRNInvoiceButton = true;

          this.getGroupClaimDataById(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
          // this.saveGroupClaim(true);

          const blob = claimDetailsResponse;
          const url = window.URL.createObjectURL(blob);
    
          var link = document.createElement('a');
          link.href = url;
          link.download = "Credit-Note-" + this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value + ".pdf";
          link.click(); 
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Generating Credit Note', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Generating Credit Note', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  getGroupClaimDataById(gClaimId){
    let groupClaimObjById: any;

    this.claimsService.getGroupClaimDetailsById(gClaimId).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.length > 0){
        groupClaimObjById = claimDetailsResponse.RESPONSE_OUT[0];

        this.groupClaimOtherDetailsForm.controls.GST_INVOICE_NO.setValue(groupClaimObjById.gst_INV_NO);
        this.groupClaimOtherDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(groupClaimObjById.gst_INV_DT, 'dd-MMM-yyyy'));
        this.groupClaimOtherDetailsForm.controls.IRN.setValue(groupClaimObjById.irn_NUMBER);
        this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(groupClaimObjById.acknowledgement_NO);
        this.groupClaimOtherDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(groupClaimObjById.acknowledgement_DATE, 'dd-MMM-yyyy'));

        setTimeout(() => {
          this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, groupClaimObjById.status);
        }, 0);
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    });
  }

   getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT.length > 0){
        this.actionList = claimDetailsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.groupClaimOtherDetailsForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.groupClaimOtherDetailsForm.controls.REMARK.value);
      }, 0);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }

  getTaggedIndividualGroupClaims(gClaimId){
    $('.loader').show();
    
    this.claimsService.getTaggedIndividualGroupClaims(gClaimId).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimDetailsObj = groupClaimDetailsResponse.RESPONSE_OUT;
        this.sharedService.taggedIndividualGroupClaimById = this.groupClaimDetailsObj;
        this.groupClaimDetailsCount = this.groupClaimDetailsObj.length;
        this.isUnTag = false;

        setTimeout(() => {
          this.calculateClaimAmount();

          $('.loader').hide();
        }, 0);
      }
      else {
        $('.loader').hide();
        this.groupClaimDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Tagged Individual Claims for Group', life: 7000 });
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Tagged Individual Claims for Group', life: 7000 });
      }
    });
  }

  getExistingIndividualClaim(){
    this.existingIndividualClaimLoading = true;

    let existingIndividualClaimInputParams: HttpParams = new HttpParams();
    existingIndividualClaimInputParams = existingIndividualClaimInputParams.set('SCHEME_ID', this.schemeId);
    existingIndividualClaimInputParams = existingIndividualClaimInputParams.set('DEALERCODE', this.dealerCode);
    existingIndividualClaimInputParams = existingIndividualClaimInputParams.set('ST_ID', this.status);
    existingIndividualClaimInputParams = existingIndividualClaimInputParams.set('PPL', this.ppl);
    existingIndividualClaimInputParams = existingIndividualClaimInputParams.set('pPOSITION', this.sharedService.position);

    this.claimsService.getExistingIndividualClaims(existingIndividualClaimInputParams).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT === "SUCCESS" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT.length > 0){
        this.existingIndividualClaimObj = groupClaimDetailsResponse.RESPONSE_OUT;
        this.existingIndividualClaimLoading = false;
      }
      else{
        this.existingIndividualClaimLoading = false;
        this.existingIndividualClaimObj = [];

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'existingIndividualClaimMessage', severity:'info', summary: 'Note', detail:'No Data Available for Existing Individual Claims', life: 7000});
      }
    }, (error) => {
      this.existingIndividualClaimLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'existingIndividualClaimMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'existingIndividualClaimMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'existingIndividualClaimMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'existingIndividualClaimMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'existingIndividualClaimMessage', severity:'error', summary: 'Error', detail:'Error Getting Existing Individual Claims Data', life: 7000});
      }
    });
  }

  untagIndividualClaim(){
    let groupClaimInputObj: any = {};
    groupClaimInputObj.pCLAIM_ID = this.selectedIndividualClaims[0].claim_ID;
    groupClaimInputObj.pG_CLAIM_ID = this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value;
    groupClaimInputObj.pACTION = "UNGROUP";
    groupClaimInputObj.pfromRole = "";
    groupClaimInputObj.pwfAction = null;
    groupClaimInputObj.pqueueUserId = "";

    this.groupClaimDetailsLoading = true;

    this.claimsService.updateGroupClaim(groupClaimInputObj).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT == "SUCCESS" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != ""){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'success', summary: 'Success', detail: 'Claim Id: ' + this.selectedIndividualClaims[0].claim_ID + " Untagged Successfully", life: 7000});

        this.getTaggedIndividualGroupClaims(this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value);
      }
      else if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse != "" && groupClaimDetailsResponse.STATUS_OUT && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.STATUS_OUT == "ERROR" && groupClaimDetailsResponse.RESPONSE_OUT && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != ""){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Untagging Individual Claim. ' + groupClaimDetailsResponse.RESPONSE_OUT, life: 7000});
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Untagging Individual Claim', life: 7000});
      }

      this.groupClaimDetailsLoading = false;
    }, (error) => {
      this.groupClaimDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'error', summary: 'Error', detail:'Error Untagging Individual Claim', life: 7000});
      }
    });
  }

  selectExistingIndividualClaim(individualClaimItem){
    this.closeExistingIndividualClaim();

    this.individualClaimDetailsObj = individualClaimItem;
    $('#txt_group_claim_details_cbk_claim_id').val(individualClaimItem.claim_ID);
  }

  isValidNumber($event, i, position){
    if(position == 1){
      let tempNum = $('#txt_group_claim_details_claim_amount_' + i).val();

      if($event.key == "."){
        $('#txt_group_claim_details_claim_amount_' + i).val("");
      }

      $('#txt_group_claim_details_claim_amount_' + i).val(Number(tempNum).toString());
    }
  }

  validate(claimId, chassisNo, i){
    this.groupClaimDetailsObj[i].claim_AMOUNT_ORG = Number(jQuery('#txt_group_claim_details_claim_amount_' + i).val().trim());
    
    if((claimId != null && claimId != "") || (chassisNo != null && chassisNo != "")){
      if(this.groupClaimDetailsForm.controls.PER_CHASSIS_CLAIM_LIMIT.value < $('#txt_group_claim_details_claim_amount_' + i).val()){
        this.groupClaimDetailsObj[i].claim_AMOUNT_ORG = 0;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info', summary: 'Note', detail:'Claim Amount Should Not Exceed Claim Limit', life: 7000});
      }

      setTimeout(() => {
        this.calculateClaimAmount();
      }, 0);
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDetailsMessage', severity: 'info', summary: 'Note', detail:'Either Claim Id or Chassis No Should be Present', life: 7000});
    }
  }

  calculateClaimAmount(){
    this.groupClaimDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.setValue(Number(0));

    this.groupClaimDetailsObj.map((item) => {
      this.groupClaimDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.setValue(Number(Number(this.groupClaimDetailsForm.controls.GROUP_CLAIM_AMOUNT_TOTAL.value) + Number(item.claim_AMOUNT_ORG)));
    });
  }

  openExistingIndividualClaim(){
    jQuery('#modal_group_claim_creation').addClass('disabled');
    jQuery('#modal_existing_individual_claim').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    setTimeout(() => {
      this.getExistingIndividualClaim();
    }, 0);
  }

  closeExistingIndividualClaim(){
    this.existingIndividualClaimObj = [];
    jQuery('#modal_group_claim_creation').removeClass('disabled');
    jQuery('#modal_existing_individual_claim').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  closeGroupInitialValidation(){
    this.groupInitialValidationObj = [];
    jQuery('#modal_group_details_initial_validation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide'); 
  }
  
  checkboxChange(){
    this.isChassis = $("input[name='cbk_group_claim_details_type']:checked").val() == 'true' ? true : false;
  }

  toggleCheckbox(){
    const latestIndividualClaim = this.selectedIndividualClaims[this.selectedIndividualClaims.length - 1];
    this.selectedIndividualClaims.length = 0;
    this.selectedIndividualClaims = [];

    if(latestIndividualClaim && latestIndividualClaim != null){
      this.selectedIndividualClaims.push(latestIndividualClaim);
    }

    if(this.selectedIndividualClaims && this.selectedIndividualClaims != null && this.selectedIndividualClaims[0].claim_ID != null && this.selectedIndividualClaims[0].claim_ID != "" && this.selectedIndividualClaims.length > 0 && this.groupClaimDetailsObj.length > 2 && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != null && this.groupClaimDetailsForm.controls.GROUP_CLAIM_ID.value != ""){
      this.isUnTag = true;
    }
    else{
      this.isUnTag = false;
    }
  }
    
}