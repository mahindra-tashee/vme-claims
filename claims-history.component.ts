import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { ClaimsHistory } from '../models/claims-history.model';
import { environment } from 'src/environments/environment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-claims-history',
  templateUrl: './claims-history.component.html',
  styleUrls: ['./claims-history.component.scss']
})
export class ClaimsHistoryComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isClaimsHistoryObj: boolean = false;
  claimsHistoryLoading: boolean = false;
  claimshistoryForm: FormGroup;
  claimsHistoryObj: Array<ClaimsHistory> = [];
  chassisDetailsObj: any;
  chassisNo: string = "";
  claimsHistoryInputParams: HttpParams;

  constructor(private messageService: MessageService, 
              private sharedService: SharedService,
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getChassisNo().subscribe((response) => {
      if(response && response != null && response != ""){
        this.getClaimsHistory(response);
      }
    });
  }

  initializeComponent(): void{
    jQuery('#dd_claims_history_size').dropdown();
    jQuery('.coupled.modal').modal({allowMultiple: true});
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#claimsHistoryTable');
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

  getClaimsHistory(chassisNo) {
    this.claimsHistoryLoading = true;

    this.claimsHistoryInputParams = new HttpParams();
    this.claimsHistoryInputParams = this.claimsHistoryInputParams.set('chassisNo', chassisNo);
    this.claimsHistoryInputParams = this.claimsHistoryInputParams.set('pageNumber', '1');
    this.claimsHistoryInputParams = this.claimsHistoryInputParams.set('pageSize', this.tableSize.toString());
   
    this.claimsService.getClaimsHistory(this.claimsHistoryInputParams).subscribe((claimsHistoryResponse) => {
      if(claimsHistoryResponse && claimsHistoryResponse != null && claimsHistoryResponse != "" && claimsHistoryResponse.STATUS_OUT != "" && claimsHistoryResponse.STATUS_OUT == "SUCCESS" && claimsHistoryResponse.STATUS_OUT != null && claimsHistoryResponse.RESPONSE_OUT != "" && claimsHistoryResponse.RESPONSE_OUT != null && claimsHistoryResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = claimsHistoryResponse.RESPONSE_OUT.count;
        this.claimsHistoryObj = claimsHistoryResponse.RESPONSE_OUT.list;
        this.isClaimsHistoryObj = true;
      }
      else {
        this.claimsHistoryObj = [];
        this.tableCount = 0;
        this.isClaimsHistoryObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsHistoryMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claims History', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.claimsHistoryLoading = false;
    }, (error) => {
      this.claimsHistoryLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Claims History Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('claimsHistoryTable').scrollLeft = 0;
    
    jQuery('#dd_claims_history_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('claimsHistoryTable').scrollLeft = 0;

    if(this.claimsHistoryInputParams != null){
      this.claimsHistoryLoading = true;
      this.isClaimsHistoryObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.claimsHistoryLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.claimsHistoryInputParams = this.claimsHistoryInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.claimsHistoryInputParams = this.claimsHistoryInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getClaimsHistory(this.claimsHistoryInputParams).subscribe((claimsHistoryResponse) => {
        if(claimsHistoryResponse && claimsHistoryResponse != null && claimsHistoryResponse != "" && claimsHistoryResponse.STATUS_OUT != "" && claimsHistoryResponse.STATUS_OUT == "SUCCESS" && claimsHistoryResponse.STATUS_OUT != null && claimsHistoryResponse.RESPONSE_OUT != "" && claimsHistoryResponse.RESPONSE_OUT != null && claimsHistoryResponse.RESPONSE_OUT.list.length > 0){
          this.claimsHistoryObj = claimsHistoryResponse.RESPONSE_OUT.list;
          this.isClaimsHistoryObj = true;
        }
        else{
          this.tableCount = 0;
          this.claimsHistoryObj = null;
          this.isClaimsHistoryObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsHistoryMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Claims History', life: 7000});
        }

        this.claimsHistoryLoading = false;
      }, (error) => {
        this.claimsHistoryLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsHistoryMessage', severity:'error', summary: 'Error', detail: 'Error Getting Claims History Data', life: 7000});
        }
      });
    }
  }

  openIndividualClaimView(chassisNo, schemeId, claimId){
    jQuery('#model_dealer_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.individualClaimViewUrl = "";

    setTimeout(() => {
      this.sharedService.individualClaimViewUrl = environment.CLAIMSANGULARURL + '/claimstabsview?chassisNo=' + chassisNo + '&schemeId=' + schemeId + '&claimId=' + claimId + '&messageKey=claimsHistoryMessage';
    }, 0);
  }

  closeIndividualClaimView(){
    jQuery('#model_dealer_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.individualClaimViewUrl = "";
  }

  openSchemeView(schemeId){
    jQuery('#model_dealer_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.schemeViewUrl = "";

    setTimeout(() => {
      this.sharedService.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView(){
    jQuery('#model_dealer_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.schemeViewUrl = "";
  }
}



