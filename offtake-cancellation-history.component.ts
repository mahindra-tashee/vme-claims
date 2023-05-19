import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { OfftakeHistory } from '../models/offtake-history.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-offtake-cancellation-history',
  templateUrl: './offtake-cancellation-history.component.html',
  styleUrls: ['./offtake-cancellation-history.component.scss']
})
export class OfftakeCancellationHistoryComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isOfftakeCancellationHistoryObj: boolean = false;
  offtakeCancellationHistoryObj: Array<OfftakeHistory> = [];
  offtakeCancellationHistoryLoading: boolean = false;
  offtakeInputObj: any = {};
  offtakeCancellationHistoryInputParams: any;
  chassisNo: any;

  constructor(private messageService: MessageService, 
              private sharedService: SharedService,
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != "") {
        this.getOfftakeCancellationHistory(response);
      }
    });
  }

  initializeComponent(): void {
    jQuery('#dd_offtake_cancellation_history_size').dropdown();
  }

  dragAndScrollTable() {
    const slider = document.querySelector<HTMLElement>('#offtakeCancellationHistoryTable');
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

  getOfftakeCancellationHistory(chassisNo) {
    this.offtakeCancellationHistoryLoading = true;

    this.offtakeCancellationHistoryInputParams = new HttpParams();
    this.offtakeCancellationHistoryInputParams = this.offtakeCancellationHistoryInputParams.set('chassisNo', chassisNo);
    this.offtakeCancellationHistoryInputParams = this.offtakeCancellationHistoryInputParams.set('pageNumber', '1');
    this.offtakeCancellationHistoryInputParams = this.offtakeCancellationHistoryInputParams.set('pageSize', this.tableSize.toString());
    
    this.claimsService.getOfftakeCancellationHistory(this.offtakeCancellationHistoryInputParams).subscribe((offtakeCancellationResponse) => {
      if(offtakeCancellationResponse && offtakeCancellationResponse != null && offtakeCancellationResponse != "" && offtakeCancellationResponse.STATUS_OUT != "" && offtakeCancellationResponse.STATUS_OUT == "SUCCESS" && offtakeCancellationResponse.STATUS_OUT != null && offtakeCancellationResponse.RESPONSE_OUT != "" && offtakeCancellationResponse.RESPONSE_OUT != null && offtakeCancellationResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = offtakeCancellationResponse.RESPONSE_OUT.count;
        this.offtakeCancellationHistoryObj = offtakeCancellationResponse.RESPONSE_OUT.list;
        this.isOfftakeCancellationHistoryObj = true;
      }
      else{
        this.offtakeCancellationHistoryObj = [];
        this.tableCount = 0;
        this.isOfftakeCancellationHistoryObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Offtake Cancellation History', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.offtakeCancellationHistoryLoading = false;
    }, (error) => {
      this.offtakeCancellationHistoryLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Offtake Cancellation History Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('offtakeCancellationHistoryTable').scrollLeft = 0;
    
    jQuery('#dd_offtake_cancellation_history_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('offtakeCancellationHistoryTable').scrollLeft = 0;

    if(this.offtakeCancellationHistoryInputParams != null){
      this.offtakeCancellationHistoryLoading = true;
      this.isOfftakeCancellationHistoryObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.offtakeCancellationHistoryLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.offtakeCancellationHistoryInputParams = this.offtakeCancellationHistoryInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.offtakeCancellationHistoryInputParams = this.offtakeCancellationHistoryInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getOfftakeCancellationHistory(this.offtakeCancellationHistoryInputParams).subscribe((offtakeCancellationResponse) => {
        if(offtakeCancellationResponse && offtakeCancellationResponse != null && offtakeCancellationResponse != "" && offtakeCancellationResponse.STATUS_OUT != "" && offtakeCancellationResponse.STATUS_OUT == "SUCCESS" && offtakeCancellationResponse.STATUS_OUT != null && offtakeCancellationResponse.RESPONSE_OUT != "" && offtakeCancellationResponse.RESPONSE_OUT != null && offtakeCancellationResponse.RESPONSE_OUT.length > 0){
          this.offtakeCancellationHistoryObj = offtakeCancellationResponse.RESPONSE_OUT.list;
          this.isOfftakeCancellationHistoryObj = true;
        }
        else{
          this.tableCount = 0;
          this.offtakeCancellationHistoryObj = null;
          this.isOfftakeCancellationHistoryObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'offtakeCancellationHistoryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Offtake Cancellation History', life: 7000});
        }

        this.offtakeCancellationHistoryLoading = false;
      }, (error) => {
        this.offtakeCancellationHistoryLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'offtakeCancellationHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'offtakeCancellationHistoryMessage', severity:'error', summary: 'Error', detail:'Error Getting Offtake Cancellation History Data', life: 7000});
        }
      });
    }
  }
}
