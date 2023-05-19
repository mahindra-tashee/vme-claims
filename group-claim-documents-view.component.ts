import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ChassisWiseDocs, GroupClaimDocs } from '../models/group-claim-docs.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-documents-view',
  templateUrl: './group-claim-documents-view.component.html',
  styleUrls: ['./group-claim-documents-view.component.scss']
})
export class GroupClaimDocumentsViewComponent implements OnInit {
  submitViewForm: FormGroup;
  groupClaimDocumentViewObj: Array<GroupClaimDocs> = [];
  groupClaimDocumentViewLoading: boolean = false;
  chassisDocumentViewObj: Array<ChassisWiseDocs> = [];
  chassisDocumentViewLoading: boolean = false;
  grpclaimdocumentsViewInputObj: any = {};

  constructor(private claimsService: ClaimsService, 
              private sharedService: SharedService, 
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.initializeComponent();

    this.dragAndScrollGroupDocumentViewTable();
    this.dragAndScrollChassisDocumentViewTable();

    this.sharedService.getGroupClaimId().subscribe((response) => {
      if(response && response != null && response != "") {
        this.getGroupClaimDocument(response);
        this.getChassisWiseDocument(response);
      }
    });
  }

  initializeComponent(): void {     
  }

  dragAndScrollGroupDocumentViewTable(){
    const slider = document.querySelector<HTMLElement>('#groupClaimDocumentViewTable');
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
    const slider = document.querySelector<HTMLElement>('#chassisDocumentViewTable');
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
    this.groupClaimDocumentViewLoading = true;

    this.claimsService.getGroupClaimDocuments(gClaimId).subscribe((groupClaimDocumentViewResponse) => {
      if(groupClaimDocumentViewResponse && groupClaimDocumentViewResponse != null && groupClaimDocumentViewResponse != "" && groupClaimDocumentViewResponse.STATUS_OUT != "" && groupClaimDocumentViewResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentViewResponse.STATUS_OUT != null && groupClaimDocumentViewResponse.RESPONSE_OUT != "" && groupClaimDocumentViewResponse.RESPONSE_OUT != null && groupClaimDocumentViewResponse.RESPONSE_OUT.length > 0) {
        this.groupClaimDocumentViewObj = groupClaimDocumentViewResponse.RESPONSE_OUT;
      }
      else{
        this.groupClaimDocumentViewObj = [];
      }

      this.groupClaimDocumentViewLoading = false;
    }, (error) => {
      this.groupClaimDocumentViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claim Documents', life: 7000 });
      }
    });
  }

  getChassisWiseDocument(gClaimId) {
    this.chassisDocumentViewLoading = true;

    this.claimsService.getChassisWiseDocuments(gClaimId).subscribe((groupClaimDocumentViewResponse) => {
      if(groupClaimDocumentViewResponse && groupClaimDocumentViewResponse != null && groupClaimDocumentViewResponse != "" && groupClaimDocumentViewResponse.STATUS_OUT != "" && groupClaimDocumentViewResponse.STATUS_OUT == "SUCCESS" && groupClaimDocumentViewResponse.STATUS_OUT != null && groupClaimDocumentViewResponse.RESPONSE_OUT != "" && groupClaimDocumentViewResponse.RESPONSE_OUT != null && groupClaimDocumentViewResponse.RESPONSE_OUT.length > 0) {
        this.chassisDocumentViewObj = groupClaimDocumentViewResponse.RESPONSE_OUT;
      }
      else {
        this.chassisDocumentViewObj = [];
      }

      this.chassisDocumentViewLoading = false;
    }, (error) => {
      this.chassisDocumentViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Chassis Wise Document', life: 7000 });
      }
    });
  }

  downloadIndividualDocument(individualDocumentItem) {
    this.chassisDocumentViewLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', individualDocumentItem.DOCUMENT_NAME);

    this.claimsService.downloadIndividualClaimsDocument(individualDocumentItem.DOC_ID, individualClaimDocumentInputParams).subscribe((groupClaimDocumentViewResponse) => {
      const blob = groupClaimDocumentViewResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = individualDocumentItem.DOCUMENT_NAME;
      link.click(); 

      this.chassisDocumentViewLoading = false;
    }, (error) => {
      this.chassisDocumentViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDocumentViewMessage', severity:'error', summary: 'Error', detail:'Error Downloading Chassis Wise Document', life: 7000});
      }
    });
  }

  downloadGroupDocument(groupDocumentItem) {
    this.groupClaimDocumentViewLoading = true;

    let groupClaimDocumentInputParams: HttpParams = new HttpParams();
    groupClaimDocumentInputParams = groupClaimDocumentInputParams.set('pFILE_NAME', groupDocumentItem.document_NAME);

    this.claimsService.downloadGroupClaimsDocument(groupDocumentItem.doc_ID, groupClaimDocumentInputParams).subscribe((groupClaimDocumentViewResponse) => {
      const blob = groupClaimDocumentViewResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = groupDocumentItem.document_NAME;
      link.click(); 

      this.groupClaimDocumentViewLoading = false;
    }, (error) => {
      this.groupClaimDocumentViewLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimDocumentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimDocumentViewMessage', severity:'error', summary: 'Error', detail:'Error Downloading Group Claim Document', life: 7000});
      }
    });
  }

}
