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
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-dealer-documents',
  templateUrl: './dealer-documents.component.html',
  styleUrls: ['./dealer-documents.component.scss']
})
export class DealerDocumentsComponent implements OnInit {
  documentForm: FormGroup;
  submitForm: FormGroup;
  claimDetailsObj: any;
  isDocumentFile: boolean = false;
  documentObj: Array<IndividualDocument> = [];
  documentCount: number = 0;
  documentLoading: boolean = false;
  documentFile: File = null;
  isEdit: boolean = false;
  actionList: Array<Action> = [];
  documentTypeList: Array<DocumentType> = [];

  constructor(private messageService: MessageService,
              private formBuilder: FormBuilder, 
              private claimsService: ClaimsService,
              private sharedService: SharedService,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollDocumentTable();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
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

        if(this.documentForm.controls.SCHEME_ID.value != null && this.documentForm.controls.SCHEME_ID.value != "" && this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
          this.getDocumentType();
        }
      }
    });

    this.sharedService.getClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.documentForm.controls.CLAIM_ID.setValue(response);
        this.submitForm.controls.CLAIM_ID.setValue(response);

        if(this.documentForm.controls.SCHEME_ID.value != null && this.documentForm.controls.SCHEME_ID.value != "" && this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
          this.getDocumentType();
        }

        if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
          this.getDocument(false);
        }
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
      jQuery('#dd_document_document_type').dropdown();
      
      jQuery('#dd_document_action').dropdown();

      if(!(this.actionList && this.actionList != null && this.actionList.length > 0)){
        $('#dd_document_action').parent().addClass('loading');
        $('#dd_document_action').parent().addClass('disabled');
      }
    }, 0);

    this.createOrEditForm();
  }

  dragAndScrollDocumentTable(){
    const slider = document.querySelector<HTMLElement>('#documentUploadTable');
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
    this.documentForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', Validators.required],
      SCHEME_ID: [this.isEdit ? this.claimDetailsObj?.scheme_ID: ''],
      DOCUMENT: ['', Validators.required]
    });

    this.submitForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', Validators.required],
      ACTION: [this.isEdit ? (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action) : '', Validators.required],
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

  getDocumentType(){
    if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != "" && this.documentForm.controls.SCHEME_ID.value != null && this.documentForm.controls.SCHEME_ID.value != ""){
      this.claimsService.getIndividualClaimsDocumentType(this.documentForm.controls.SCHEME_ID.value, this.documentForm.controls.CLAIM_ID.value).subscribe((documentResponse) => {
        if(documentResponse && documentResponse[0] && documentResponse[0] != null && documentResponse[0] != "" && documentResponse[0].STATUS_OUT && documentResponse[0].STATUS_OUT != null && documentResponse[0].STATUS_OUT != "" && documentResponse[0].STATUS_OUT == "SUCCESS" && documentResponse[0].RESPONSE_OUT && documentResponse[0].RESPONSE_OUT.length > 0){
          this.documentTypeList = documentResponse[0].RESPONSE_OUT;
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentMessage', severity: 'info', summary: 'Note', detail:'No Data Available for Document Type', life: 7000});
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
        this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Getting Document Type', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'documentMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id or Scheme Id Not Available', life: 7000});
    }
  }

  getDocument(flag){
    this.documentLoading = true;

    if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
      this.claimsService.getIndividualClaimsDocument(this.documentForm.controls.CLAIM_ID.value).subscribe((documentResponse) => {
        if(documentResponse && documentResponse != null && documentResponse.length > 0){
          this.documentObj = documentResponse;
        }
        else if(flag){
          this.documentObj = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claim Documents', life: 7000});
        }
  
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
        this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Documents', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'documentMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  chooseDocumentFile($event){
    this.documentFile = $event.target.files.item(0);

    if(this.documentFile != null && (this.documentFile.name.toLocaleLowerCase().endsWith('.pdf') || this.documentFile.name.toLocaleLowerCase().endsWith('.xlsx') || this.documentFile.name.toLocaleLowerCase().endsWith('.xls') || this.documentFile.name.toLocaleLowerCase().endsWith('.csv') || this.documentFile.name.toLocaleLowerCase().endsWith('.doc') || this.documentFile.name.toLocaleLowerCase().endsWith('.docx') || this.documentFile.name.toLocaleLowerCase().endsWith('.png') || this.documentFile.name.toLocaleLowerCase().endsWith('.jpg') || this.documentFile.name.endsWith('.jpeg') || this.documentFile.name.toLocaleLowerCase().endsWith('.txt'))){
      this.isDocumentFile = true;
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#file_document').val('');
      this.documentFile = null;
      this.isDocumentFile = false;
      this.messageService.add({key: 'documentMessage', severity:'info', summary: 'Note', detail:'Please Upload File With Specified Format Only', life: 7000});
    }
  }

  uploadDocumentFile(){
    this.documentForm.markAllAsTouched();

    if(this.documentForm.controls.CLAIM_ID.value != null && this.documentForm.controls.CLAIM_ID.value != ""){
      if(this.documentForm.invalid){
        return;
      }

      let claimDocs: any = {};
      claimDocs.claim_ID = this.documentForm.controls.CLAIM_ID.value;
      claimDocs.document_TYPE = jQuery('#dd_document_document_type').dropdown('get value');
      claimDocs.dig_SIGN_CHECK = this.documentTypeList.find(item => item.seq_ID == jQuery('#dd_document_document_type').dropdown('get value'))?.is_DIG_SIGN_CHK;
      claimDocs.viewer_ROLE = this.sharedService.userRole;

      let fileInfo : any = {};
      fileInfo.claim_ID = this.documentForm.controls.CLAIM_ID.value;

      if(this.documentFile != null){
        $('.loader').show();

        this.claimsService.uploadIndividualClaimsDocument(this.documentFile, claimDocs, fileInfo).subscribe((documentResponse) => {
          if(documentResponse && documentResponse != null && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'documentMessage', severity:'success', summary: 'Success', detail:'Document Uploaded Successfully', life: 7000});

            this.getDocument(true);
          }
          else if(documentResponse && documentResponse != null && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "ERROR" && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT != ""){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document. ' + documentResponse.RESPONSE_OUT, life: 7000});            
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});
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
          this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Uploading Document', life: 7000});         
          }
        });
      }
    }
    else{
      $('#file_document').val('');
      this.documentFile = null;
      this.isDocumentFile = false;
      this.sharedService.changeClaimIdNotAvailable(true);
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

  deleteDocument(documentItem){
    let confirmMessage: string = "Do You Want To Delete Document?";

    this.confirmationService.confirm({
      message: confirmMessage,
      header: 'Delete Document',
      accept: () => {
        this.claimsService.deleteIndividualClaimsDocument(documentItem.doc_ID).subscribe((documentResponse) => {
          if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse.STATUS_OUT != null && documentResponse.STATUS_OUT != "" && documentResponse.STATUS_OUT == "SUCCESS" && documentResponse.RESPONSE_OUT != null && documentResponse.RESPONSE_OUT != "" && documentResponse.RESPONSE_OUT == "Document Deleted Successfully"){
            this.getDocument(true);
          }
          else{
            this.documentLoading = false;
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
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
          this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Deleting Document', life: 7000});
          }
        });
      },
      key: 'documentDialog'
    });
  }

  updateCustody(){
    this.submitForm.markAllAsTouched();

    if(this.submitForm.controls.CLAIM_ID.value != null && this.submitForm.controls.CLAIM_ID .value != ""){
      if(this.submitForm.invalid){
        return;
      }

      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.submitForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let inputObj: Array<any> = [];
          inputObj[0] = new Object();
          inputObj[0].claimId = this.submitForm.controls.CLAIM_ID.value;
          inputObj[0].remarks = this.submitForm.controls.REMARK.value;
          inputObj[0].action = this.submitForm.controls.ACTION.value;
          inputObj[0].toUser = "";
          inputObj[0].fromRole = this.sharedService.userRole;
          inputObj[0].pPosition = this.sharedService.position;
      
          this.claimsService.updateIndividualClaimCustody(inputObj).subscribe((documentResponse) => {
            if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse[0] && documentResponse[0] != null && documentResponse[0] != "" && documentResponse[0].successOut && documentResponse[0].successOut != null && documentResponse[0].successOut != "" && documentResponse[0].successOut == "TRUE" && documentResponse[0].successMsgOut && documentResponse[0].successMsgOut != "" && documentResponse[0].successMsgOut != null){
              if(this.submitForm.controls.ACTION.value == 'SVDT'){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'documentMessage', severity:'success', summary: 'Success', detail:'Individual Claim Custody Updated Successfully', life: 7000});
              }
              else{
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Individual Claim Custody Updated Successfully', life: 7000});
              }
      
              this.getClaimDataById(this.submitForm.controls.CLAIM_ID.value);
              this.sharedService.changeModifiedAction(this.submitForm.controls.ACTION.value);
            }
            else if(documentResponse && documentResponse != null && documentResponse != "" && documentResponse[0] && documentResponse[0] != null && documentResponse[0] != "" && documentResponse[0].successOut && documentResponse[0].successOut != null && documentResponse[0].successOut != "" && documentResponse[0].successOut == "FALSE"){
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'documentMessage', severity:'error',  summary: 'Error', detail:'Error Updating Individual Claim Custody. ' + documentResponse[0].successMsgOut, life: 7000});
            }
            else{
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'documentMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claim Custody', life: 7000});
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

  getClaimDataById(claimId){
    let claimObjById: any;

    this.claimsService.getClaimDetailsById(claimId).subscribe((documentResponse) => {
      if(documentResponse && documentResponse.STATUS_OUT == "SUCCESS"  && documentResponse.RESPONSE_OUT != null){
        claimObjById = documentResponse.RESPONSE_OUT[0];

        setTimeout(() => {
          this.sharedService.status = claimObjById.status;

          this.getAction(this.sharedService.userRole, this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, this.sharedService.status);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    });
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
