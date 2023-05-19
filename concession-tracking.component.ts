import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConcTrack } from '../models/conc-track.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-concession-tracking',
  templateUrl: './concession-tracking.component.html',
  styleUrls: ['./concession-tracking.component.scss']
})
export class ConcessionTrackingComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isConcessionTrackingObj: boolean = false;
  concessiontrackingForm: FormGroup;
  concessionTrackingObj: Array<ConcTrack>=[];
  concessionTrackingLoading: boolean = false;
  conctrackingInputObj: any = {};
  concessionTrackingInputParams: HttpParams;
  individualClaimViewUrl: any;
  
  constructor(private formBuilder: FormBuilder, 
              private messageService: MessageService, 
              private sharedService: SharedService, 
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.getConcessionTracking(response); 
      }
    });
  }

  initializeComponent(): void {
    jQuery('#dd_concession_tracking_size').dropdown();
  }

  dragAndScrollTable() {
    const slider = document.querySelector<HTMLElement>('#concessionTrackingTable');
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
  getConcessionTracking(chassisNo) {
    this.concessionTrackingLoading = true;

    this.concessionTrackingInputParams = new HttpParams();
    this.concessionTrackingInputParams = this.concessionTrackingInputParams.set('chassis', chassisNo);
    this.concessionTrackingInputParams = this.concessionTrackingInputParams.set('pageNumber', '1');
    this.concessionTrackingInputParams = this.concessionTrackingInputParams.set('pageSize', this.tableSize.toString());

    this.claimsService.getConcessionTracking(this.concessionTrackingInputParams).subscribe((concessionTrackingResponse) => {
      if(concessionTrackingResponse && concessionTrackingResponse != null && concessionTrackingResponse != "" && concessionTrackingResponse.STATUS_OUT != "" && concessionTrackingResponse.STATUS_OUT == "SUCCESS" && concessionTrackingResponse.STATUS_OUT != null && concessionTrackingResponse.RESPONSE_OUT != "" && concessionTrackingResponse.RESPONSE_OUT != null && concessionTrackingResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = concessionTrackingResponse.RESPONSE_OUT.count;
        this.concessionTrackingObj = concessionTrackingResponse.RESPONSE_OUT.list;
        this.isConcessionTrackingObj = true;
      }
      else {
        this.concessionTrackingObj = [];
        this.tableCount = 0;
        this.isConcessionTrackingObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'concessionTrackingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Concession Tracking', life: 7000 });
      }
      
      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.concessionTrackingLoading = false;
    }, (error) => {
      this.concessionTrackingLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Concession Tracking Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('concessionTrackingTable').scrollLeft = 0;
    
    jQuery('#dd_concession_tracking_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('concessionTrackingTable').scrollLeft = 0;

    if(this.concessionTrackingInputParams != null){
      this.concessionTrackingLoading = true;
      this.isConcessionTrackingObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.concessionTrackingLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.concessionTrackingInputParams = this.concessionTrackingInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.concessionTrackingInputParams = this.concessionTrackingInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getConcessionTracking(this.concessionTrackingInputParams).subscribe((claimsHistoryResponse) => {
        if(claimsHistoryResponse && claimsHistoryResponse != null && claimsHistoryResponse != "" && claimsHistoryResponse.STATUS_OUT != "" && claimsHistoryResponse.STATUS_OUT == "SUCCESS" && claimsHistoryResponse.STATUS_OUT != null && claimsHistoryResponse.RESPONSE_OUT != "" && claimsHistoryResponse.RESPONSE_OUT != null && claimsHistoryResponse.RESPONSE_OUT.length > 0){
          this.concessionTrackingObj = claimsHistoryResponse.RESPONSE_OUT.list;
          this.isConcessionTrackingObj = true;
        }
        else{
          this.tableCount = 0;
          this.concessionTrackingObj = null;
          this.isConcessionTrackingObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'concessionTrackingMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Concession Tracking', life: 7000});
        }

        this.concessionTrackingLoading = false;
      }, (error) => {
        this.concessionTrackingLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'concessionTrackingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'concessionTrackingMessage', severity:'error', summary: 'Error', detail: 'Error Getting Concession Tracking Data', life: 7000});
        }
      });
    }
  }

  openIndividualClaimView(chassisNo, schemeId, claimId){
    jQuery('#model_dealer_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.individualClaimViewUrl = "";

    setTimeout(() => {
      this.individualClaimViewUrl = environment.CLAIMSANGULARURL + '/claimstabsview?chassisNo=' + chassisNo + '&schemeId=' + schemeId + '&claimId=' + claimId + '&messageKey=concessionTrackingMessage';
    }, 0);
  }

  closeIndividualClaimView(){
    jQuery('#model_dealer_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.individualClaimViewUrl = "";
  }

}
