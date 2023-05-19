import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { Action } from '../models/action.model';
import { ChassisWiseDocs, GroupClaimDocs } from '../models/group-claim-docs.model';
import { GroupClaim } from '../models/group-claim.model';
import { User } from '../models/user.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-approver-documents',
  templateUrl: './group-claim-approver-documents.component.html',
  styleUrls: ['./group-claim-approver-documents.component.scss']
})
export class GroupClaimApproverDocumentsComponent implements OnInit {
  groupApproverSubmitForm: FormGroup;
  groupClaimApproverDocumentsObj: Array<GroupClaimDocs> = [];
  isGroupClaimApproverDocumentsObj: boolean = false;
  groupClaimApproverDocumentsLoading: boolean = false;
  chassisApproverDocumentsObj: Array<ChassisWiseDocs> = [];
  isChassisApproverDocumentsObj = true;
  chassisApproverDocumentsLoading: boolean = false;
  groupClaimApproverDetailsDataObj: Array<GroupClaim> = [];
  businessUnit: string = "";
  actionList: Array<Action> = [];
  isGDCChecker: boolean = false;
  isGDCFinance: boolean = false;
  isGDCHold: boolean = false;
  isGroupUserList: boolean = false;
  isGroupRemark: boolean = true;
  groupUserList: Array<User> = [];
  selectedGroupDocuments: any;
  selectedChassisDocuments: any;

  constructor(private claimsService: ClaimsService,
              private sharedService: SharedService, 
              private formBuilder: FormBuilder,
              private datePipe: DatePipe, 
              private messageService: MessageService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();

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
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getRole().subscribe((response) => {
      if(response && response != null && response != "" && response == "CGDC"){
        this.isGDCChecker = true;
        this.isGDCFinance = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && response == "MGDC"){
        this.isGDCFinance = true;
        this.isGDCChecker = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && (response == "GDCH" || response == "OLHD" || response == "OPHD")){
        this.isGDCChecker = false;
        this.isGDCFinance = false;
        this.isGDCHold = true;
      }
      else{
        this.isGDCChecker = false;
        this.isGDCFinance = false;
        this.isGDCHold = false;
      }
    });

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != "") {
        this.groupApproverSubmitForm.controls.GROUP_CLAIM_ID.setValue(response);

        setTimeout(() => {
          this.getGroupClaimDocument(response);
          this.getChassisWiseDocument(response);
        }, 0);
      }
    });

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          this.groupApproverSubmitForm.controls.ACTION.setValue((this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_group_claim_approver_documents_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
       
            (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_group_claim_approver_documents_action').dropdown('get value') == "APPR" ? this.isGroupUserList = true : this.isGroupUserList = false;
            this.isGroupUserList ? this.getUserList(): '';
       
          }, 0);
      }

      $('#dd_group_claim_approver_documents_action').parent().removeClass('loading');
      $('#dd_group_claim_approver_documents_action').parent().removeClass('disabled');
    });

    this.sharedService.getAction().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupApproverSubmitForm.controls.ACTION.setValue(response);
        jQuery('#dd_group_claim_approver_documents_action').dropdown('set selected', response);
      }
    });

    this.sharedService.getRemark().subscribe((response) => {
      if(response && response != null && response != ""){
        this.groupApproverSubmitForm.controls.REMARK.setValue(response);
      }
    });
  }

  initializeComponent(): void {
    setTimeout(() => {
      jQuery('#dd_group_claim_approver_documents_action').dropdown();
      jQuery('#dd_group_claim_approver_documents_user').dropdown();
      jQuery('#dd_group_claim_approver_documents_reason').dropdown();

      $('#dd_group_claim_approver_documents_action').on('change', () => {
        (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_group_claim_approver_documents_action').dropdown('get value') == "APPR" ? this.isGroupUserList = true : this.isGroupUserList = false;

        this.isGroupUserList ? this.getUserList(): '';
      });

      $('#dd_group_claim_approver_documents_reason').on('change', () => {
        if(jQuery('#dd_group_claim_approver_documents_reason').dropdown('get value') == "Your Own Comment"){
          this.isGroupRemark = true;
          this.groupApproverSubmitForm.controls.REMARK.addValidators(Validators.required);
        }
        else{
          this.isGroupRemark = false;
          this.groupApproverSubmitForm.controls.REMARK.clearValidators();
        }

        this.groupApproverSubmitForm.controls.REMARK.setValue('');
      });
    }, 0);

    this.createOrEditForm();
  }

  createOrEditForm() {
    this.groupApproverSubmitForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [this.groupClaimApproverDetailsDataObj[0]?.g_CLAIM_ID, Validators.required],
      ACTION: [this.groupClaimApproverDetailsDataObj[0]?.action_SEL, Validators.required],
      USER: ['', this.isGroupUserList ? Validators.required : ''],
      REMARK: [this.groupClaimApproverDetailsDataObj[0]?.remarks, Validators.required]
    });

    setTimeout(() => {
      jQuery('#dd_group_claim_approver_documents_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));

      this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.groupClaimApproverDetailsDataObj[0]?.action_SEL) ? this.groupClaimApproverDetailsDataObj[0]?.action_SEL : this.actionList[0]?.action));
      this.sharedService.changeRemark(this.groupClaimApproverDetailsDataObj[0]?.remarks);
    }, 0);
  }

  dragAndScrollGroupDocumentTable(){
    const slider = document.querySelector<HTMLElement>('#groupClaimApproverDocumentsTable');
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

  dragAndScrollChassisDocumentTable(){
    const slider = document.querySelector<HTMLElement>('#chassisApproverDocumentsTable');
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

  getUserList(){
    $('#dd_group_claim_approver_documents_user').parent().addClass('loading');
    $('#dd_group_claim_approver_documents_user').parent().addClass('disabled');

    let approverUserListInputParams: HttpParams = new HttpParams();

    approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.groupApproverSubmitForm.controls.GROUP_CLAIM_ID.value);
    approverUserListInputParams = approverUserListInputParams.set('action_IN', this.groupApproverSubmitForm.controls.ACTION.value);
    approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'GRP');
    approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);

    this.claimsService.getApproverUserList(approverUserListInputParams).subscribe((groupClaimApproverDocumentsResponse) => {
      if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.COUNT && groupClaimApproverDocumentsResponse.COUNT != null && groupClaimApproverDocumentsResponse.COUNT != "" && groupClaimApproverDocumentsResponse.COUNT > 0){
        this.groupUserList = groupClaimApproverDocumentsResponse.RESPONSE_OUT;
      }
      else if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.COUNT && groupClaimApproverDocumentsResponse.COUNT != null && groupClaimApproverDocumentsResponse.COUNT != "" && groupClaimApproverDocumentsResponse.COUNT <= 0){
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'info', summary: 'Note', detail: 'No Data Available for User Names', life: 7000});
      }
      else{
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names: ' + groupClaimApproverDocumentsResponse.RESPONSE_OUT, life: 7000});
      }
      
      $('#dd_group_claim_approver_documents_user').parent().removeClass('loading');
      $('#dd_group_claim_approver_documents_user').parent().removeClass('disabled');
    }, (error) => {
      $('#dd_group_claim_approver_documents_user').parent().removeClass('loading');
      $('#dd_group_claim_approver_documents_user').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names', life: 7000});
      }
    });
  }

  getGroupClaimDocument(gClaimId){
    this.groupClaimApproverDocumentsLoading = true;

    this.claimsService.getGroupClaimDocuments(gClaimId).subscribe((groupClaimApproverDocumentsResponse) => {
      if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimApproverDocumentsObj = groupClaimApproverDocumentsResponse.RESPONSE_OUT;
        this.isGroupClaimApproverDocumentsObj = true;

        for(let i = 0; i < this.groupClaimApproverDocumentsObj.length; i++){
          if(this.groupClaimApproverDocumentsObj[i].is_VERIFIED == undefined || this.groupClaimApproverDocumentsObj[i].is_VERIFIED == null || this.groupClaimApproverDocumentsObj[i].is_VERIFIED == "" || this.groupClaimApproverDocumentsObj[i].is_VERIFIED == "N"){
            this.groupClaimApproverDocumentsObj[i].is_VERIFIED = "N";
          }
          else if(this.groupClaimApproverDocumentsObj[i].is_VERIFIED == "Y"){
            this.groupClaimApproverDocumentsObj[i].is_VERIFIED = "Y";
          }
        }

        setTimeout(() => {
          this.selectedGroupDocuments = this.groupClaimApproverDocumentsObj.filter((groupApproverDocumentItem) => groupApproverDocumentItem.is_VERIFIED == "Y");
        }, 0);
      }
      else{
        this.groupClaimApproverDocumentsObj = [];
        this.isGroupClaimApproverDocumentsObj = false;
      }

      this.groupClaimApproverDocumentsLoading = false;
    }, (error) => {
      this.groupClaimApproverDocumentsLoading = false;
      this.isGroupClaimApproverDocumentsObj = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim Documents', life: 7000 });
      }
    });
  }

  getChassisWiseDocument(gClaimId) {
    this.chassisApproverDocumentsLoading = true;

    this.claimsService.getChassisWiseDocuments(gClaimId).subscribe((groupClaimApproverDocumentsResponse) => {
      if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT.length > 0) {
        this.chassisApproverDocumentsObj = groupClaimApproverDocumentsResponse.RESPONSE_OUT;
        this.isChassisApproverDocumentsObj = true;

        for(let i = 0; i < this.chassisApproverDocumentsObj.length; i++){
          if(this.chassisApproverDocumentsObj[i].IS_VERIFIED == undefined || this.chassisApproverDocumentsObj[i].IS_VERIFIED == null || this.chassisApproverDocumentsObj[i].IS_VERIFIED == "" || this.chassisApproverDocumentsObj[i].IS_VERIFIED == "N"){
            this.chassisApproverDocumentsObj[i].IS_VERIFIED = "N";
          }
          else if(this.chassisApproverDocumentsObj[i].IS_VERIFIED == "Y"){
            this.chassisApproverDocumentsObj[i].IS_VERIFIED = "Y";
          }
        }

        setTimeout(() => {
          this.selectedChassisDocuments = this.chassisApproverDocumentsObj.filter((chassisApproverDocumentItem) => chassisApproverDocumentItem.IS_VERIFIED == "Y");
        }, 0);
      }
      else {
        this.chassisApproverDocumentsObj = [];
        this.isChassisApproverDocumentsObj = false;
      }

      this.chassisApproverDocumentsLoading = false;
    }, (error) => {
      this.chassisApproverDocumentsLoading = false;
      this.isChassisApproverDocumentsObj = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Chassis Wise Document', life: 7000 });
      }
    });
  }

  getSelectedGroupDocumentId(){
    let docId: string = "";
    let isVerified: string = "";

    isVerified = this.selectedGroupDocuments == null || this.selectedGroupDocuments.length < 1 ? "N" : "Y";

    isVerified == "N" ? this.groupClaimApproverDocumentsObj.filter((item) => docId = docId + item.doc_ID + ",") : this.selectedGroupDocuments.filter((item) => docId = docId + item.doc_ID + ","); 

    this.verifyGroupDocument(docId.substring(0, docId.length - 1), isVerified, false);
  }

  verifyGroupDocument(docId, isVerified, flag){
    let inputObj: any;

    if(flag){
      isVerified = this.selectedGroupDocuments.map((item) => item.doc_ID).includes(docId) ? 'Y' : 'N';
    }

    if(this.isGDCChecker){
      
      this.claimsService.verifyGroupClaimsDocument(docId, isVerified, inputObj).subscribe((groupClaimApproverDocumentsResponse) => {
        if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.RESPONSE_OUT && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT == "Is Verified Updated successfully"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'success', summary: 'Success', detail:'Document Verified Successfully', life: 7000});
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Group Claim Document', life: 7000});
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Group Claim Document', life: 7000});
        }
      });
    }
  }

  getSelectedChassisDocumentId(){
    let docId: string = "";
    let isVerified: string = "";

    isVerified = this.selectedChassisDocuments == null || this.selectedChassisDocuments.length < 1 ? "N" : "Y";

    isVerified == "N" ? this.chassisApproverDocumentsObj.filter((item) => docId = docId + item.DOC_ID + ",") : this.selectedChassisDocuments.filter((item) => docId = docId + item.doc_ID + ","); 

    this.verifyChassisDocument(docId.substring(0, docId.length - 1), isVerified, false);
  }

  verifyChassisDocument(docId, isVerified, flag){
    let inputObj: any;

    if(flag){
      isVerified = this.selectedChassisDocuments.map((item) => item.doc_ID).includes(docId) ? 'Y' : 'N';
    }
  
    if(this.isGDCChecker){

      this.claimsService.verifyIndividualClaimsDocument(docId, isVerified, inputObj).subscribe((groupClaimApproverDocumentsResponse) => {
        if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.RESPONSE_OUT && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT == "Is Verified Updated successfully"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'success', summary: 'Success', detail:'Document Verified Successfully', life: 7000});
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Chassiswise Document', life: 7000});
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Chassiswise Document', life: 7000});
        }
      });
    }
  }

  downloadIndividualDocument(individualDocumentItem) {
    this.chassisApproverDocumentsLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', individualDocumentItem.DOCUMENT_NAME);

    this.claimsService.downloadIndividualClaimsDocument(individualDocumentItem.DOC_ID, individualClaimDocumentInputParams).subscribe((groupClaimApproverDocumentsResponse) => {
      const blob = groupClaimApproverDocumentsResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = individualDocumentItem.DOCUMENT_NAME;
      link.click(); 

      this.chassisApproverDocumentsLoading = false;
    }, (error) => {
      this.chassisApproverDocumentsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Downloading Chassis Wise Document', life: 7000});
      }
    });
  }

  downloadGroupDocument(groupDocumentItem) {
    this.groupClaimApproverDocumentsLoading = true;

    let groupClaimDocumentInputParams: HttpParams = new HttpParams();
    groupClaimDocumentInputParams = groupClaimDocumentInputParams.set('pFILE_NAME', groupDocumentItem.document_NAME);

    this.claimsService.downloadGroupClaimsDocument(groupDocumentItem.doc_ID, groupClaimDocumentInputParams).subscribe((groupClaimApproverDocumentsResponse) => {
      const blob = groupClaimApproverDocumentsResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = groupDocumentItem.document_NAME;
      link.click(); 

      this.groupClaimApproverDocumentsLoading = false;
    }, (error) => {
      this.groupClaimApproverDocumentsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Downloading Group Claim Document', life: 7000});
      }
    });
  }

  updateCustody(){
    this.groupApproverSubmitForm.markAllAsTouched();
    
    if(this.groupApproverSubmitForm.invalid){
      return;
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.groupApproverSubmitForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let groupClaimApproverInputObj: any = {};
          groupClaimApproverInputObj.pGclaim_id = this.groupApproverSubmitForm.controls.GROUP_CLAIM_ID.value;
          groupClaimApproverInputObj.pAction = this.groupApproverSubmitForm.controls.ACTION.value;
          
          if(jQuery('#dd_group_claim_approver_documents_reason').dropdown('get value') == "Your Own Comment"){
            groupClaimApproverInputObj.pRemark = this.groupApproverSubmitForm.controls.REMARK.value;
          }
          else{
            groupClaimApproverInputObj.pRemark = jQuery('#dd_group_claim_approver_documents_reason').dropdown('get value');
          }

          groupClaimApproverInputObj.pFromRole = this.sharedService.userRole;
          groupClaimApproverInputObj.pToRole = this.groupApproverSubmitForm.controls.USER.value;

          this.claimsService.postApproverGroupClaim(groupClaimApproverInputObj).subscribe((groupClaimApproverDocumentsResponse) => {
            if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse != "" && groupClaimApproverDocumentsResponse.STATUS_OUT && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.RESPONSE_OUT && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT.length > 0){
              if(groupClaimApproverDocumentsResponse.RESPONSE_OUT[0].successOut == "TRUE"){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Group Claim Custody Updated Successfully', life: 7000});

                this.getGroupClaimDataById(this.groupApproverSubmitForm.controls.GROUP_CLAIM_ID.value);
                this.sharedService.changeModifiedAction(this.groupApproverSubmitForm.controls.ACTION.value);
              }
              else{
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claim Custody: ' + groupClaimApproverDocumentsResponse.RESPONSE_OUT[0].successMsgOut, life: 7000});
              }
            }
            else{
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }

            $('.loader').hide();
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{
            this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }
          });
        },
        key: 'groupClaimApproverDocumentsDialog'
      });
    }
  }

  getGroupClaimDataById(gClaimId){
    let groupClaimObjById: any;

    this.claimsService.getGroupClaimDetailsById(gClaimId).subscribe((groupClaimApproverDocumentsResponse) => {
      if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse != null && groupClaimApproverDocumentsResponse.STATUS_OUT != null && groupClaimApproverDocumentsResponse.STATUS_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsResponse.RESPONSE_OUT.length > 0){
        groupClaimObjById = groupClaimApproverDocumentsResponse.RESPONSE_OUT[0];

        this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, groupClaimObjById.status);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    });
  }

   getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((groupClaimApproverDocumentsResponse) => {
      if(groupClaimApproverDocumentsResponse && groupClaimApproverDocumentsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsResponse.RESPONSE_OUT.length > 0){
        this.actionList = groupClaimApproverDocumentsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.groupApproverSubmitForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.groupApproverSubmitForm.controls.REMARK.value);
      }, 0);
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }
}
