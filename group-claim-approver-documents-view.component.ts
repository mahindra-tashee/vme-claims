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
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-approver-documents-view',
  templateUrl: './group-claim-approver-documents-view.component.html',
  styleUrls: ['./group-claim-approver-documents-view.component.scss']
})
export class GroupClaimApproverDocumentsViewComponent implements OnInit {
  groupClaimApproverDocumentsViewObj: Array<GroupClaimDocs> = [];
  isGroupClaimApproverDocumentsViewObj: boolean = false;
  groupClaimApproverDocumentsViewLoading: boolean = false;
  chassisApproverDocumentsViewObj: Array<ChassisWiseDocs> = [];
  chassisApproverDocumentsViewLoading: boolean = false;
  isChassisApproverDocumentsViewObj: boolean = false;
  groupClaimApproverDetailsViewDataObj: Array<GroupClaim> = [];
  selectedGroupDocuments: any;
  selectedChassisDocuments: any;
  actionList: Array<Action> = [];
  isGDCChecker: boolean = false;

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
        setTimeout(() => {
          if(this.sharedService.groupClaimObjById && this.sharedService.groupClaimObjById != null && this.sharedService.groupClaimObjById != ""){
            this.groupClaimApproverDetailsViewDataObj[0] = this.sharedService.groupClaimObjById;
          }
        }, 0);
      }
      else{
        this.messageService.add({key: 'groupClaimApproverDocumentsViewMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getRole().subscribe((response) => {
      if(response && response != null && response != "" && response == "CGDC"){
        this.isGDCChecker = true;
      }
      else{
        this.isGDCChecker = false;
      }
    });

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != "") {
        setTimeout(() => {
          this.getGroupClaimDocument(response);
          this.getChassisWiseDocument(response);
        }, 0);
      }
    });
  }

  initializeComponent(): void {     
    this.createOrViewForm();
  }

  createOrViewForm() { }

  dragAndScrollGroupDocumentViewTable(){
    const slider = document.querySelector<HTMLElement>('#groupClaimApproverDocumentsViewTable');
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

  dragAndScrollChassisDocumentViewTable(){
    const slider = document.querySelector<HTMLElement>('#chassisApproverDocumentsViewTable');
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

  getGroupClaimDocument(gClaimId){
    this.groupClaimApproverDocumentsViewLoading = true;

    this.claimsService.getGroupClaimDocuments(gClaimId).subscribe((groupClaimApproverDocumentsViewResponse) => {
      if(groupClaimApproverDocumentsViewResponse && groupClaimApproverDocumentsViewResponse != null && groupClaimApproverDocumentsViewResponse != "" && groupClaimApproverDocumentsViewResponse.STATUS_OUT != "" && groupClaimApproverDocumentsViewResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsViewResponse.STATUS_OUT != null && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimApproverDocumentsViewObj = groupClaimApproverDocumentsViewResponse.RESPONSE_OUT;
        this.isGroupClaimApproverDocumentsViewObj = true;

        for(let i = 0; i < this.groupClaimApproverDocumentsViewObj.length; i++){
          if(this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED == undefined || this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED == null || this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED == "" || this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED == "N"){
            this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED = "N";
          }
          else if(this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED == "Y"){
            this.groupClaimApproverDocumentsViewObj[i].is_VERIFIED = "Y";
          }
        }

        setTimeout(() => {
          this.selectedGroupDocuments = this.groupClaimApproverDocumentsViewObj.filter((groupApproverDocumentItem) => groupApproverDocumentItem.is_VERIFIED == "Y");
        }, 0);
      }
      else{
        this.groupClaimApproverDocumentsViewObj = [];
        this.isGroupClaimApproverDocumentsViewObj = false;
      }

      this.groupClaimApproverDocumentsViewLoading = false;
    }, (error) => {
      this.groupClaimApproverDocumentsViewLoading = false;
      this.isGroupClaimApproverDocumentsViewObj = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim Documents', life: 7000 });
      }
    });
  }

  getChassisWiseDocument(gClaimId) {
    this.chassisApproverDocumentsViewLoading = true;

    this.claimsService.getChassisWiseDocuments(gClaimId).subscribe((groupClaimApproverDocumentsViewResponse) => {
      if(groupClaimApproverDocumentsViewResponse && groupClaimApproverDocumentsViewResponse != null && groupClaimApproverDocumentsViewResponse != "" && groupClaimApproverDocumentsViewResponse.STATUS_OUT != "" && groupClaimApproverDocumentsViewResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverDocumentsViewResponse.STATUS_OUT != null && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT != "" && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT != null && groupClaimApproverDocumentsViewResponse.RESPONSE_OUT.length > 0) {
        this.chassisApproverDocumentsViewObj = groupClaimApproverDocumentsViewResponse.RESPONSE_OUT;
        this.isChassisApproverDocumentsViewObj = true;

        for(let i = 0; i < this.chassisApproverDocumentsViewObj.length; i++){
          if(this.chassisApproverDocumentsViewObj[i].IS_VERIFIED == undefined || this.chassisApproverDocumentsViewObj[i].IS_VERIFIED == null || this.chassisApproverDocumentsViewObj[i].IS_VERIFIED == "" || this.chassisApproverDocumentsViewObj[i].IS_VERIFIED == "N"){
            this.chassisApproverDocumentsViewObj[i].IS_VERIFIED = "N";
          }
          else if(this.chassisApproverDocumentsViewObj[i].IS_VERIFIED == "Y"){
            this.chassisApproverDocumentsViewObj[i].IS_VERIFIED = "Y";
          }
        }

        setTimeout(() => {
          this.selectedChassisDocuments = this.chassisApproverDocumentsViewObj.filter((groupApproverDocumentItem) => groupApproverDocumentItem.IS_VERIFIED == "Y");
        }, 0);
      }
      else {
        this.chassisApproverDocumentsViewObj = [];
        this.isChassisApproverDocumentsViewObj = false;
      }

      this.chassisApproverDocumentsViewLoading = false;
    }, (error) => {
      this.chassisApproverDocumentsViewLoading = false;
      this.isChassisApproverDocumentsViewObj = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Chassis Wise Document', life: 7000 });
      }
    });
  }

  downloadIndividualDocument(individualDocumentItem) {
    this.chassisApproverDocumentsViewLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', individualDocumentItem.DOCUMENT_NAME);

    this.claimsService.downloadIndividualClaimsDocument(individualDocumentItem.DOC_ID, individualClaimDocumentInputParams).subscribe((groupClaimApproverDocumentsViewResponse) => {
      const blob = groupClaimApproverDocumentsViewResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = individualDocumentItem.DOCUMENT_NAME;
      link.click(); 

      this.chassisApproverDocumentsViewLoading = false;
    }, (error) => {
      this.chassisApproverDocumentsViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsViewMessage', severity:'error', summary: 'Error', detail:'Error Downloading Chassis Wise Document', life: 7000});
      }
    });
  }

  downloadGroupDocument(groupDocumentItem) {
    this.groupClaimApproverDocumentsViewLoading = true;

    let groupClaimDocumentInputParams: HttpParams = new HttpParams();
    groupClaimDocumentInputParams = groupClaimDocumentInputParams.set('pFILE_NAME', groupDocumentItem.document_NAME);

    this.claimsService.downloadGroupClaimsDocument(groupDocumentItem.doc_ID, groupClaimDocumentInputParams).subscribe((groupClaimApproverDocumentsViewResponse) => {
      const blob = groupClaimApproverDocumentsViewResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = groupDocumentItem.document_NAME;
      link.click(); 

      this.groupClaimApproverDocumentsViewLoading = false;
    }, (error) => {
      this.groupClaimApproverDocumentsViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverDocumentsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverDocumentsViewMessage', severity:'error', summary: 'Error', detail:'Error Downloading Group Claim Document', life: 7000});
      }
    });
  }

  getSelectedGroupDocumentId(){

  }

  getSelectedChassisDocumentId(){

  }

}
