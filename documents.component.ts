import { Component, OnInit } from '@angular/core';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Action } from '../models/action.model';
import { HttpParams } from '@angular/common/http';
import { IndividualDocument } from '../models/individual-document.model';
import { DocumentType } from '../models/document-type.model';
import { User } from '../models/user.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  documentForm: FormGroup;
  submitForm: FormGroup;
  businessUnit: string = "";
  claimDetailsObj: any;
  isDocumentFile: boolean = false;
  documentObj: Array<IndividualDocument> = [];
  isDocumentObj: boolean = false;
  documentCount: number = 0;
  documentLoading: boolean = false;
  documentFile: File = null;
  isEdit: boolean = false;
  actionList: Array<Action> = [];
  documentTypeList: Array<DocumentType> = [];
  isGDCChecker: boolean = false;
  isGDCFinance: boolean = false;
  isGDCHold: boolean = false;
  isIndividualUserList: boolean = false;
  isIndividualRemark: boolean = true;
  individualUserList: Array<User> = [];
  selectedDocuments: any;

  constructor(private messageService: MessageService,
              private formBuilder: FormBuilder, 
              private claimsService: ClaimsService,
              private sharedService: SharedService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
        this.businessUnit = response;

        if(this.sharedService.isClaimEdit){
          this.isEdit = true;

          setTimeout(() => {
            if(this.sharedService.claimObjById && this.sharedService.claimObjById != null && this.sharedService.claimObjById != ""){
              this.claimDetailsObj = this.sharedService.claimObjById;
  
              this.initializeComponent();
            }
          }, 0);
        }
        else{
          this.isEdit = false;
        }
      }
      else{
        this.messageService.add({key: 'documentChecklistMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getSchemeId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.documentForm.controls.SCHEME_ID.setValue(response);
      }
    });

    this.sharedService.getClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.documentForm.controls.CLAIM_ID.setValue(response);
        this.submitForm.controls.CLAIM_ID.setValue(response);

        if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
          this.getDocument(false);
        }
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

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          if(this.isEdit){
            this.submitForm.controls.ACTION.setValue( (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_document_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
          }

          setTimeout(() => {
            (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_document_action').dropdown('get value') == "APPR" ? this.isIndividualUserList = true : this.isIndividualUserList = false;

            this.isIndividualUserList ? this.getUserList() : '';
          }, 0);
        }, 0);
      }

      $('#dd_document_action').parent().removeClass('loading');
      $('#dd_document_action').parent().removeClass('disabled');
    });

    this.sharedService.getAction().subscribe((response) => {
      if(response && response != null && response != ""){
        this.submitForm.controls.ACTION.setValue(response);
        jQuery('#dd_document_action').dropdown('set selected', response);
      }
    });

    this.sharedService.getRemark().subscribe((response) => {
      if(response && response != null && response != ""){
        this.submitForm.controls.REMARK.setValue(response);
      }
    });
  }

  initializeComponent(){
    setTimeout(() => {
      jQuery('#dd_document_action').dropdown();
      jQuery('#dd_document_user').dropdown();
      jQuery('#dd_document_reason').dropdown();

      if(!(this.actionList && this.actionList != null && this.actionList.length > 0)){
        $('#dd_document_action').parent().addClass('loading');
        $('#dd_document_action').parent().addClass('disabled');
      }

      $('#dd_document_action').on('change', () => {
        (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_document_action').dropdown('get value') == "APPR" ? this.isIndividualUserList = true : this.isIndividualUserList = false;

        this.isIndividualUserList ? this.getUserList(): '';
      });

      $('#dd_document_reason').on('change', () => {
        if(jQuery('#dd_document_reason').dropdown('get value') == "Your Own Comment"){
          this.isIndividualRemark = true;
          this.submitForm.controls.REMARK.addValidators(Validators.required);
        }
        else{
          this.isIndividualRemark = false;
          this.submitForm.controls.REMARK.clearValidators();
        }

        this.submitForm.controls.REMARK.setValue('');
      });
    }, 0);

    this.createOrEditForm();
  }

  createOrEditForm(){
    this.documentForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', Validators.required],
      SCHEME_ID: [this.isEdit ? this.claimDetailsObj?.scheme_ID: ''],
      DOCUMENT: ['', Validators.required]
    });
    
    this.submitForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', Validators.required],
      ACTION: [this.isEdit ? (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action) : '', Validators.required],
      USER: ['', this.isIndividualUserList ? Validators.required : ''],
      REMARK: [this.isEdit ? this.claimDetailsObj?.remark : '', Validators.required]
    });

    setTimeout(() => {
      if(this.isEdit){
        jQuery('#dd_document_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));

        this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
        this.sharedService.changeRemark(this.claimDetailsObj?.remark);
      }
    }, 0);
  }

  getUserList(){
    $('#dd_document_user').parent().addClass('loading');
    $('#dd_document_user').parent().addClass('disabled');

    let approverUserListInputParams: HttpParams = new HttpParams();
    approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.submitForm.controls.CLAIM_ID.value);
    approverUserListInputParams = approverUserListInputParams.set('action_IN', this.submitForm.controls.ACTION.value);
    approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'IND');
    approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);

    this.claimsService.getApproverUserList(approverUserListInputParams).subscribe((documentResponse) => {
      if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse.STATUS_OUT && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.COUNT && documentResponse.COUNT != null && documentResponse.COUNT != "" && documentResponse.COUNT > 0){
        this.individualUserList = documentResponse.RESPONSE_OUT;
      }
      else if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse.STATUS_OUT && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.COUNT && documentResponse.COUNT != null && documentResponse.COUNT != "" && documentResponse.COUNT <= 0){
        this.individualUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail: 'No Data Available for User Names', life: 7000});
      }
      else{
        this.individualUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names: ' + documentResponse.RESPONSE_OUT, life: 7000});
      }
      
      $('#dd_document_user').parent().removeClass('loading');
      $('#dd_document_user').parent().removeClass('disabled');
    }, (error) => {
      $('#dd_document_user').parent().removeClass('loading');
      $('#dd_document_user').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names', life: 7000});
      }
    });
  }

  getDocument(flag){
    this.documentLoading = true;

    if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
      this.claimsService.getIndividualClaimsDocument(this.documentForm.controls.CLAIM_ID.value).subscribe((documentResponse) => {
        if(documentResponse && documentResponse != null && documentResponse.length > 0){
          this.documentObj = documentResponse;
          this.isDocumentObj = true;

          for(let i = 0; i < this.documentObj.length; i++){
            if(this.documentObj[i].is_VERIFIED == undefined || this.documentObj[i].is_VERIFIED == null || this.documentObj[i].is_VERIFIED == "" || this.documentObj[i].is_VERIFIED == "N"){
              this.documentObj[i].is_VERIFIED = "N";
            }
            else if(this.documentObj[i].is_VERIFIED == "Y"){
              this.documentObj[i].is_VERIFIED = "Y";
            }
          }

          setTimeout(() => {
            this.selectedDocuments = this.documentObj.filter((documentItem) => documentItem.is_VERIFIED == "Y");
          }, 0);
        }
        else if(flag){
          this.documentObj = [];
          this.isDocumentObj = false;
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claim Documents', life: 7000});
        }
  
        this.documentLoading = false;
      }, (error) => {
        this.documentLoading = false;
        this.isDocumentObj = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Documents', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'documentMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  getSelectedDocumentId(){
    let docId: string = "";
    let isVerified: string = "";

    isVerified = this.selectedDocuments == null || this.selectedDocuments.length < 1 ? "N" : "Y";

    isVerified == "N" ? this.documentObj.filter((item) => docId = docId + item.doc_ID + ",") : this.selectedDocuments.filter((item) => docId = docId + item.doc_ID + ","); 

    this.verifyDocument(docId.substring(0, docId.length - 1), isVerified, false);
  }

  verifyDocument(docId, isVerified, flag){
    let inputObj: any;

    if(flag){
      isVerified = this.selectedDocuments.map((item) => item.doc_ID).includes(docId) ? 'Y' : 'N';
    }
 
    if(this.isGDCChecker){
      
      this.claimsService.verifyIndividualClaimsDocument(docId, isVerified, inputObj).subscribe((documentResponse) => {
        if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse.STATUS_OUT && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.RESPONSE_OUT && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT != "" && documentResponse.RESPONSE_OUT == "Is Verified Updated successfully"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentMessage', severity: 'success', summary: 'Success', detail:'Document Verified Successfully', life: 7000});
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Individual Claim Document', life: 7000});
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'documentMessage', severity: 'error', summary: 'Error', detail:'Error Verifying Individual Claim Document', life: 7000});
        }
      });
   }
  }

  downloadDocument(documentItem){
    this.documentLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', documentItem.document_NAME);

    this.claimsService.downloadIndividualClaimsDocument(documentItem.doc_ID, individualClaimDocumentInputParams).subscribe((documentResponse) => {
      const blob = documentResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = documentItem.document_NAME;
      link.click(); 

      this.documentLoading = false;
    }, (error) => {
      this.documentLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Downloading Document', life: 7000});
      }
    });
  }

  updateCustody(){
   this.submitForm.markAllAsTouched();

    if(this.submitForm.controls.CLAIM_ID.value != null && this.submitForm.controls.CLAIM_ID .value != ""){
      if(this.submitForm.invalid){
        return;
      }
      else if(this.sharedService.userRole == "MGDC" && this.sharedService.status == "ESND" && (this.documentForm.controls.ACTION.value == "HOLD" || this.documentForm.controls.ACTION.value == "REJT" || this.documentForm.controls.ACTION.value == "RECO")){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail:'This Action is Not Allowed', life: 7000});

        return;
      }

      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.submitForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let individualClaimInputObj: any = {};
          individualClaimInputObj.pCLAIM_ID = this.submitForm.controls.CLAIM_ID.value;
          individualClaimInputObj.pAction = this.submitForm.controls.ACTION.value;

          if(jQuery('#dd_document_reason').dropdown('get value') == "Your Own Comment"){
            individualClaimInputObj.pRemark = this.submitForm.controls.REMARK.value;
          }
          else{
            individualClaimInputObj.pRemark = jQuery('#dd_document_reason').dropdown('get value');
          }

          individualClaimInputObj.pFromRole = this.sharedService.userRole;
          individualClaimInputObj.pToRole = this.submitForm.controls.USER.value;
      
          this.claimsService.updateApproverIndividualClaimCustody(individualClaimInputObj).subscribe((documentResponse) => {
            if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse.STATUS_OUT && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.RESPONSE_OUT && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT != "" && documentResponse.RESPONSE_OUT.length > 0){
              if(documentResponse.RESPONSE_OUT[0].successOut == "TRUE"){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Individual Claim Custody Updated Successfully', life: 7000});
                
                this.sharedService.changeModifiedAction(this.submitForm.controls.ACTION.value);
              }
              else{
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claim Custody: ' + documentResponse.RESPONSE_OUT[0].successMsgOut, life: 7000});
              }
            }
            else{
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claim Custody: ' + documentResponse.RESPONSE_OUT[0].successMsgOut, life: 7000});
            }
      
            $('.loader').hide();
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{
              this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claim Custody', life: 7000});
            }
          });
        },
        key: 'documentDialog'
      });
    }
    else{
      this.sharedService.changeClaimIdNotAvailable(true);
    }
  }

  getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((documentResponse) => {
      if(documentResponse && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT.length > 0){
        this.actionList = documentResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.submitForm.controls.ACTION.value);
        this.sharedService.changeModifiedAction(this.submitForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.submitForm.controls.REMARK.value);
      }, 0);
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'documentMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }

}