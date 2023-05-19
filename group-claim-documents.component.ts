import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { Action } from '../models/action.model';
import { DocumentType } from '../models/document-type.model';
import { ChassisWiseDocs, GroupClaimDocs } from '../models/group-claim-docs.model';
import { GroupClaim } from '../models/group-claim.model';
import { GrpClaimDetails } from '../models/grp-claim-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-documents',
  templateUrl: './group-claim-documents.component.html',
  styleUrls: ['./group-claim-documents.component.scss']
})
export class GroupClaimDocumentsComponent implements OnInit {
  groupDocumentForm: FormGroup;
  groupChassisDocumentForm: FormGroup;
  groupSubmitForm: FormGroup;
  isEdit: boolean = false;
  actionList: Array<Action> = [];
  groupDocumentTypeList: Array<DocumentType> = [];
  groupChassisDocumentTypeList: Array<DocumentType> = [];
  groupChassisClaimIdList: any;
  groupClaimDetailsObj: Array<GrpClaimDetails> = [];
  groupClaimDocumentObj: Array<GroupClaimDocs> = [];
  groupClaimDocumentLoading: boolean = false;
  groupChassisDocumentObj: Array<ChassisWiseDocs> = [];
  groupChassisDocumentLoading: boolean = false;
  isGroupDocumentFile: boolean = false;
  groupDocumentFile: File = null;
  isGroupChassisDocumentFile: boolean = false;
  groupChassisDocumentFile: File = null;
  groupClaimDetailsDataObj: Array<GroupClaim> = [];

  constructor(private formBuilder: FormBuilder,
              private sharedService: SharedService,
              private claimsService: ClaimsService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollGroupDocumentTable();
    this.dragAndScrollGroupChassisDocumentTable();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
        if(this.sharedService.isGroupClaimEdit){
          this.isEdit = true;

          setTimeout(() => {
            if(this.sharedService.groupClaimObjById && this.sharedService.groupClaimObjById != null && this.sharedService.groupClaimObjById != ""){
              this.groupClaimDetailsDataObj[0] = this.sharedService.groupClaimObjById;
            }
          }, 0);
        }
        else{
          this.isEdit = false;
        }
      }
      else{
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getSchemeId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupDocumentForm.controls.SCHEME_ID.setValue(response);
        this.groupChassisDocumentForm.controls.SCHEME_ID.setValue(response);

        if(this.groupDocumentForm.controls.SCHEME_ID.value != null && this.groupDocumentForm.controls.SCHEME_ID.value != "" && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
          this.getGroupDocumentType();
        }
      }
    });

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupDocumentForm.controls.GROUP_CLAIM_ID.setValue(response);
        this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.setValue(response);
        this.groupSubmitForm.controls.GROUP_CLAIM_ID.setValue(response);

        if(this.groupDocumentForm.controls.SCHEME_ID.value != null && this.groupDocumentForm.controls.SCHEME_ID.value != "" && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
          this.getGroupDocumentType();
        }

        if(this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
          this.getGroupClaimDocument(false);
        }

        if(this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
          this.getTaggedIndividualGroupClaims(this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value);
        }

        if(this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
          this.getGroupChassisDocument(false);
        }
      }
    });

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          if(this.isEdit){
            this.groupSubmitForm.controls.ACTION.setValue((this.actionList.map((item) => item.action).includes(this.groupClaimDetailsObj[0]?.action_SEL) ? this.groupClaimDetailsObj[0]?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_group_document_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsObj[0]?.action_SEL) ? this.groupClaimDetailsObj[0]?.action_SEL : this.actionList[0]?.action));
          }
        }, 0);
      }

      $('#dd_group_document_action').parent().removeClass('loading');
      $('#dd_group_document_action').parent().removeClass('disabled');
    });

    this.sharedService.getAction().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupSubmitForm.controls.ACTION.setValue(response);
        jQuery('#dd_group_document_action').dropdown('set selected', response);
      }
    });

    this.sharedService.getRemark().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupSubmitForm.controls.REMARK.setValue(response);
      }
    });
  }

  initializeComponent() {
    jQuery('#dd_group_document_document_type').dropdown();
    jQuery('#dd_group_chassis_document_document_type').dropdown();
    jQuery('#dd_group_chassis_document_claim_id').dropdown();
    jQuery('#dd_group_document_action').dropdown();

    $('#dd_group_chassis_document_claim_id').on('change', () => {
      this.getGroupChassisDocumentType();
    });

    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);

    if(!(this.actionList && this.actionList != null && this.actionList.length > 0)){
      $('#dd_group_document_action').parent().addClass('loading');
      $('#dd_group_document_action').parent().addClass('disabled');
    }

    this.createOrEditForm();
  }

  dragAndScrollGroupDocumentTable(){
    const slider = document.querySelector<HTMLElement>('#groupClaimDocumentTable');
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

  dragAndScrollGroupChassisDocumentTable(){
    const slider = document.querySelector<HTMLElement>('#groupChassisDocumentTable');
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

  createOrEditForm(){
    this.groupDocumentForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.g_CLAIM_ID : '', Validators.required],
      SCHEME_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.scheme_ID: ''],
      DOCUMENT: ['', Validators.required]
    });

    this.groupChassisDocumentForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.g_CLAIM_ID : '', Validators.required],
      CLAIM_ID: ['', Validators.required],
      SCHEME_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.scheme_ID: ''],
      DOCUMENT: ['', Validators.required]
    });

    this.groupSubmitForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.g_CLAIM_ID : '', Validators.required],
      ACTION: [this.isEdit ? (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action) : '', Validators.required],
      REMARK: [this.isEdit ? this.groupClaimDetailsDataObj[0]?.remarks : '', Validators.required]
    });

    setTimeout(() => {
      if(this.isEdit){
        jQuery('#dd_group_document_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));

        this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.groupClaimDetailsDataObj[0]?.action_SEL) ? this.groupClaimDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
        this.sharedService.changeRemark(this.groupClaimDetailsDataObj[0]?.remarks);
      }
    }, 0);
  }

  getGroupDocumentType(){
    if(this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != "" && this.groupDocumentForm.controls.SCHEME_ID.value != null && this.groupDocumentForm.controls.SCHEME_ID.value != ""){
      this.claimsService.getGroupClaimsDocumentType(this.groupDocumentForm.controls.SCHEME_ID.value, this.groupDocumentForm.controls.GROUP_CLAIM_ID.value).subscribe((groupClaimDocumentResponse) => {
        if(groupClaimDocumentResponse && groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse.STATUS_OUT && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT && groupClaimDocumentResponse.RESPONSE_OUT.length > 0){
          this.groupDocumentTypeList = groupClaimDocumentResponse.RESPONSE_OUT;
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDocumentMessage', severity: 'info', summary: 'Note', detail:'No Data Available for Document Type', life: 7000});
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Getting Document Type', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDocumentMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id or Scheme Id Not Available', life: 7000});
    }
  }

  getGroupChassisDocumentType(){
    if(this.groupChassisDocumentForm.controls.CLAIM_ID.value != null && this.groupChassisDocumentForm.controls.CLAIM_ID.value != "" && this.groupChassisDocumentForm.controls.SCHEME_ID.value != null && this.groupChassisDocumentForm.controls.SCHEME_ID.value != ""){
      $('#dd_group_chassis_document_document_type').parent().addClass('loading');
      $('#dd_group_chassis_document_document_type').parent().addClass('disabled');

      this.claimsService.getIndividualClaimsDocumentType(this.groupChassisDocumentForm.controls.SCHEME_ID.value, this.groupChassisDocumentForm.controls.CLAIM_ID.value).subscribe((groupClaimDocumentResponse) => {
        if(groupClaimDocumentResponse && groupClaimDocumentResponse[0] && groupClaimDocumentResponse[0] != null && groupClaimDocumentResponse[0] != "" && groupClaimDocumentResponse[0].STATUS_OUT && groupClaimDocumentResponse[0].STATUS_OUT != null && groupClaimDocumentResponse[0].STATUS_OUT != "" && groupClaimDocumentResponse[0].STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse[0].RESPONSE_OUT && groupClaimDocumentResponse[0].RESPONSE_OUT.length > 0){
          this.groupChassisDocumentTypeList = groupClaimDocumentResponse[0].RESPONSE_OUT;
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimDocumentMessage', severity: 'info', summary: 'Note', detail:'No Data Available for Document Type', life: 7000});
        }

        $('#dd_group_chassis_document_document_type').parent().removeClass('loading');
        $('#dd_group_chassis_document_document_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_group_chassis_document_document_type').parent().removeClass('loading');
        $('#dd_group_chassis_document_document_type').parent().removeClass('disabled');
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Getting Document Type', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'groupClaimDocumentMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id or Scheme Id Not Available', life: 7000});
    }
  }

  getGroupClaimDocument(flag){
    this.groupClaimDocumentLoading = true;

    this.claimsService.getGroupClaimDocuments(this.groupDocumentForm.controls.GROUP_CLAIM_ID.value).subscribe((groupClaimDocumentResponse) => {
      if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimDocumentObj = groupClaimDocumentResponse.RESPONSE_OUT;
      }
      else{
        this.groupClaimDocumentObj = [];

        if(flag){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Claim Documents', life: 7000 });
        }
      }

      this.groupClaimDocumentLoading = false;
    }, (error) => {
      this.groupClaimDocumentLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim Documents', life: 7000 });
      }
    });
  }

  getGroupChassisDocument(flag) {
    this.groupChassisDocumentLoading = true;

    this.claimsService.getChassisWiseDocuments(this.groupChassisDocumentForm.controls.GROUP_CLAIM_ID.value).subscribe((groupClaimDocumentResponse) => {
      if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT.length > 0) {
        this.groupChassisDocumentObj = groupClaimDocumentResponse.RESPONSE_OUT;
      }
      else {
        this.groupChassisDocumentObj = [];

        if(flag){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Chassis Wise Document', life: 7000 });
        }
      }

      this.groupChassisDocumentLoading = false;
    }, (error) => {
      this.groupChassisDocumentLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Chassis Wise Document', life: 7000 });
      }
    });
  }

  chooseGroupDocumentFile($event){
    this.groupDocumentFile = $event.target.files.item(0);

    if(this.groupDocumentFile != null && (this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.pdf') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.xlsx') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.xls') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.csv') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.doc') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.docx') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.png') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.jpg') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.jpeg') || this.groupDocumentFile.name.toLocaleLowerCase().endsWith('.txt'))){
      this.isGroupDocumentFile = true;
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#file_group_document').val('');
      this.groupDocumentFile = null;
      this.isGroupDocumentFile = false;
      this.messageService.add({key: 'groupClaimDocumentMessage', severity:'info', summary: 'Note', detail:'Please Upload File With Specified Format Only', life: 7000});
    }
  }

  uploadGroupDocumentFile(){
    this.groupDocumentForm.markAllAsTouched();

    if(this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != null && this.groupDocumentForm.controls.GROUP_CLAIM_ID.value != ""){
      if(this.groupDocumentForm.invalid){
        return;
      }

      let claimDocs: any = {};
      claimDocs.g_CLAIM_ID = this.groupDocumentForm.controls.GROUP_CLAIM_ID.value;
      claimDocs.document_TYPE = jQuery('#dd_group_document_document_type').dropdown('get value');
      claimDocs.dig_SIGN_CHECK = this.groupDocumentTypeList.find(item => item.seq_ID == jQuery('#dd_group_document_document_type').dropdown('get value'))?.is_DIG_SIGN_CHK;
      claimDocs.viewer_ROLE = this.sharedService.userRole;

      let fileInfo : any = {};
      fileInfo.g_CLAIM_ID = this.groupDocumentForm.controls.GROUP_CLAIM_ID.value;

      if(this.groupDocumentFile != null){
        $('.loader').show();

        this.claimsService.uploadGroupClaimsDocument(this.groupDocumentFile, claimDocs, fileInfo).subscribe((groupClaimDocumentResponse) => {
          if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'success', summary: 'Success', detail:'Document Uploaded Successfully', life: 7000});

            this.getGroupClaimDocument(true);
          }
          else if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "ERROR" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document. ' + groupClaimDocumentResponse.RESPONSE_OUT, life: 7000});            
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});
          }

          $('.loader').hide();
        }, (error) => {
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{
          this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});         
          }
        });
      }
    }
    else{
      $('#file_group_document').val('');
      this.groupDocumentFile = null;
      this.isGroupDocumentFile = false;
      this.sharedService.changeGroupClaimIdNotAvailable(true);
    }
  }

  chooseGroupChassisDocumentFile($event){
    this.groupChassisDocumentFile = $event.target.files.item(0);

    if(this.groupChassisDocumentFile != null && (this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.pdf') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.xlsx') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.xls') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.csv') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.doc') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.docx') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.png') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.jpg') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.jpeg') || this.groupChassisDocumentFile.name.toLocaleLowerCase().endsWith('.txt'))){
      this.isGroupChassisDocumentFile = true;
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#file_group_chassis_document').val('');
      this.groupChassisDocumentFile = null;
      this.isGroupChassisDocumentFile = false;
      this.messageService.add({key: 'groupClaimDocumentMessage', severity:'info', summary: 'Note', detail:'Please Upload File With Specified Format Only', life: 7000});
    }
  }

  uploadGroupChassisDocumentFile(){
    this.groupChassisDocumentForm.markAllAsTouched();

    if(this.groupChassisDocumentForm.controls.CLAIM_ID.value != null && this.groupChassisDocumentForm.controls.CLAIM_ID.value != ""){
      if(this.groupChassisDocumentForm.invalid){
        return;
      }

      let claimDocs: any = {};
      claimDocs.claim_ID = this.groupChassisDocumentForm.controls.CLAIM_ID.value;
      claimDocs.document_TYPE = jQuery('#dd_group_chassis_document_document_type').dropdown('get value');
      claimDocs.dig_SIGN_CHECK = this.groupChassisDocumentTypeList.find(item => item.seq_ID == jQuery('#dd_group_chassis_document_document_type').dropdown('get value'))?.is_DIG_SIGN_CHK;
      claimDocs.viewer_ROLE = this.sharedService.userRole;

      let fileInfo : any = {};
      fileInfo.claim_ID = this.groupChassisDocumentForm.controls.CLAIM_ID.value;

      if(this.groupChassisDocumentFile != null){
        $('.loader').show();

        this.claimsService.uploadIndividualClaimsDocument(this.groupChassisDocumentFile, claimDocs, fileInfo).subscribe((groupClaimDocumentResponse) => {
          if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'success', summary: 'Success', detail:'Document Uploaded Successfully', life: 7000});

            this.getGroupChassisDocument(true);
          }
          else if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "ERROR" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document. ' + groupClaimDocumentResponse.RESPONSE_OUT, life: 7000});            
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});
          }

          $('.loader').hide();
        }, (error) => {
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{
          this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});         
          }
        });
      }
    }
    else{
      $('#file_group_chassis_document').val('');
      this.groupChassisDocumentFile = null;
      this.isGroupChassisDocumentFile = false;
      this.sharedService.changeGroupClaimIdNotAvailable(true);
    }
  }

  downloadIndividualDocument(individualDocumentItem) {
    this.groupChassisDocumentLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', individualDocumentItem.DOCUMENT_NAME);

    this.claimsService.downloadIndividualClaimsDocument(individualDocumentItem.DOC_ID, individualClaimDocumentInputParams).subscribe((groupClaimDocumentResponse) => {
      const blob = groupClaimDocumentResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = individualDocumentItem.DOCUMENT_NAME;
      link.click(); 

      this.groupChassisDocumentLoading = false;
    }, (error) => {
      this.groupChassisDocumentLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Downloading Chassis Wise Document', life: 7000});
      }
    });
  }

  downloadGroupDocument(groupDocumentItem) {
    this.groupClaimDocumentLoading = true;

    let groupClaimDocumentInputParams: HttpParams = new HttpParams();
    groupClaimDocumentInputParams = groupClaimDocumentInputParams.set('pFILE_NAME', groupDocumentItem.document_NAME);

    this.claimsService.downloadGroupClaimsDocument(groupDocumentItem.doc_ID, groupClaimDocumentInputParams).subscribe((groupClaimDocumentResponse) => {
      const blob = groupClaimDocumentResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = groupDocumentItem.document_NAME;
      link.click(); 

      this.groupClaimDocumentLoading = false;
    }, (error) => {
      this.groupClaimDocumentLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Downloading Group Claim Document', life: 7000});
      }
    });
  }

  getTaggedIndividualGroupClaims(gClaimId){
    this.claimsService.getTaggedIndividualGroupClaims(gClaimId).subscribe((groupClaimDetailsResponse) => {
      if(groupClaimDetailsResponse && groupClaimDetailsResponse != null && groupClaimDetailsResponse.STATUS_OUT != null && groupClaimDetailsResponse.STATUS_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT != null && groupClaimDetailsResponse.RESPONSE_OUT != "" && groupClaimDetailsResponse.RESPONSE_OUT.length > 0) {
        this.groupChassisClaimIdList = groupClaimDetailsResponse.RESPONSE_OUT;
      }
      else {
        this.groupClaimDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'groupClaimDetailsMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Tagged Individual Claims for Group', life: 7000 });
      }
    }, (error) => {
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

  deleteGroupClaimDocument(documentItem){
    let confirmMessage: string = "Do You Want To Delete Document?";

    this.confirmationService.confirm({
      message: confirmMessage,
      header: 'Delete Document',
      accept: () => {
        this.claimsService.deleteGroupClaimsDocument(documentItem.doc_ID).subscribe((groupClaimDocumentResponse) => {
          if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT == "Document Deleted Successfully"){
            this.getGroupClaimDocument(true);
          }
          else{
            this.groupClaimDocumentLoading = false;
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
        }, (error) => {
          this.groupClaimDocumentLoading = false;
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{
          this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
        });
      },
      key: 'groupDocumentDialog'
    });
  }

  deleteIndividualDocument(documentItem){
    let confirmMessage: string = "Do You Want To Delete Document?";

    this.confirmationService.confirm({
      message: confirmMessage,
      header: 'Delete Document',
      accept: () => {
        this.claimsService.deleteIndividualClaimsDocument(documentItem.DOC_ID).subscribe((groupClaimDocumentResponse) => {
          if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT == "Document Deleted Successfully"){
            this.getGroupChassisDocument(true);
          }
          else{
            this.groupChassisDocumentLoading = false;
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
        }, (error) => {
          this.groupChassisDocumentLoading = false;
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{
          this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
        });
      },
      key: 'groupDocumentDialog'
    });
  }

  updateGroupCustody(){
    this.groupSubmitForm.markAllAsTouched();
 
     if(this.groupSubmitForm.controls.GROUP_CLAIM_ID.value != null && this.groupSubmitForm.controls.GROUP_CLAIM_ID.value != ""){
       if(this.groupSubmitForm.invalid){
         return;
       }
 
       this.confirmationService.confirm({
         message: this.sharedService.getMessageBasedOnAction(this.groupSubmitForm.controls.ACTION.value),
         header: 'Save Claim',
         accept: () => {
           $('.loader').show();
 
           let inputObj: Array<any> = [];
           inputObj[0] = new Object();
           inputObj[0].claimId = this.groupSubmitForm.controls.GROUP_CLAIM_ID.value;
           inputObj[0].remarks = this.groupSubmitForm.controls.REMARK.value;
           inputObj[0].action = this.groupSubmitForm.controls.ACTION.value;
           inputObj[0].toUser = "";
           inputObj[0].fromRole = this.sharedService.userRole;
           inputObj[0].pPosition = this.sharedService.position;
       
           this.claimsService.updateGroupClaimCustody(inputObj).subscribe((groupClaimDocumentResponse) => {
             if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse[0] && groupClaimDocumentResponse[0] != null && groupClaimDocumentResponse[0] != "" && groupClaimDocumentResponse[0].successOut && groupClaimDocumentResponse[0].successOut != null && groupClaimDocumentResponse[0].successOut != "" && groupClaimDocumentResponse[0].successOut == "TRUE" && groupClaimDocumentResponse[0].successMsgOut && groupClaimDocumentResponse[0].successMsgOut != "" && groupClaimDocumentResponse[0].successMsgOut != null){
               if(this.groupSubmitForm.controls.ACTION.value == 'SVDT'){
                 $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                 this.messageService.add({key: 'groupClaimDocumentMessage', severity:'success', summary: 'Success', detail:'Group Claim Custody Updated Successfully', life: 7000});
               }
               else{
                 $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                 this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Group Claim Custody Updated Successfully', life: 7000});
               }
       
               this.getGroupClaimDataById(this.groupSubmitForm.controls.GROUP_CLAIM_ID.value);
               this.sharedService.changeModifiedAction(this.groupSubmitForm.controls.ACTION.value)
             }
             else if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse != "" && groupClaimDocumentResponse[0] && groupClaimDocumentResponse[0] != null && groupClaimDocumentResponse[0] != "" && groupClaimDocumentResponse[0].successOut && groupClaimDocumentResponse[0].successOut != null && groupClaimDocumentResponse[0].successOut != "" && groupClaimDocumentResponse[0].successOut == "FALSE"){
               $('html,body,div').animate({ scrollTop: 0 }, 'slow');
               this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error',  summary: 'Error', detail:'Error Updating Group Claim Custody. ' + groupClaimDocumentResponse[0].successMsgOut, life: 7000});
             }
             else{
               $('html,body,div').animate({ scrollTop: 0 }, 'slow');
               this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claim Custody', life: 7000});
             }
       
             $('.loader').hide();
           }, (error) => {
             $('.loader').hide();
             $('html,body,div').animate({ scrollTop: 0 }, 'slow');
             if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{
             this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claim Custody', life: 7000});
            }
          });
         },
         key: 'groupDocumentDialog'
       });
     }
     else{
       this.sharedService.changeGroupClaimIdNotAvailable(true);
     }
   }

   getGroupClaimDataById(gClaimId){
    let groupClaimObjById: any;

    this.claimsService.getGroupClaimDetailsById(gClaimId).subscribe((groupClaimDocumentResponse) => {
      if(groupClaimDocumentResponse && groupClaimDocumentResponse != null && groupClaimDocumentResponse.STATUS_OUT != null && groupClaimDocumentResponse.STATUS_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT != "" && groupClaimDocumentResponse.RESPONSE_OUT.length > 0){
        groupClaimObjById = groupClaimDocumentResponse.RESPONSE_OUT[0];

        this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, groupClaimObjById.status);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    });
  }

   getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((groupClaimDocumentResponse) => {
      if(groupClaimDocumentResponse && groupClaimDocumentResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentResponse.RESPONSE_OUT != null && groupClaimDocumentResponse.RESPONSE_OUT.length > 0){
        this.actionList = groupClaimDocumentResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.groupSubmitForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.groupSubmitForm.controls.REMARK.value);
      }, 0);
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'groupClaimDocumentMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }
}
