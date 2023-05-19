import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { Action } from '../models/action.model';
import { IndividualDocument } from '../models/individual-document.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-dealer-documents-view',
  templateUrl: './dealer-documents-view.component.html',
  styleUrls: ['./dealer-documents-view.component.scss']
})
export class DealerDocumentsViewComponent implements OnInit {
  documentObj: Array<IndividualDocument> = [];
  documentLoading: boolean = false;

  constructor(private claimsService: ClaimsService, 
              private sharedService: SharedService, 
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getClaimId().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getDocument(response);
      }
    });

  }
  
  initializeComponent(){ }
  
  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#documentViewTable');
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

  getDocument(claimId){
    this.documentLoading = true;

    if(claimId != null && claimId != ""){
      this.claimsService.getIndividualClaimsDocument(claimId).subscribe((documentViewResponse) => {
        if(documentViewResponse && documentViewResponse != null && documentViewResponse.length > 0){
          this.documentObj = documentViewResponse;
        }
        else{
          this.documentObj = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'documentViewMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claim Documents', life: 7000});
        }
  
        this.documentLoading = false;
      }, (error) => {
        this.documentLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'documentViewMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Documents', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'documentViewMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  downloadDocument(documentItem){
    this.documentLoading = true;

    let individualClaimDocumentInputParams: HttpParams = new HttpParams();
    individualClaimDocumentInputParams = individualClaimDocumentInputParams.set('fileName', documentItem.document_NAME);

    this.claimsService.downloadIndividualClaimsDocument(documentItem.doc_ID, individualClaimDocumentInputParams).subscribe((documentViewResponse) => {
      const blob = documentViewResponse;
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
        this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'documentViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'documentViewMessage', severity:'error', summary: 'Error', detail:'Error Downloading Document', life: 7000});
      }
    });
  }
}
