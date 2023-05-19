import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { Retail } from '../models/retail.model';
import { MessageService } from 'primeng/api';
import { SharedService } from '../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { ClaimsService } from '../services/claims.service';
import { HttpParams } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-retail-history',
  templateUrl: './retail-history.component.html',
  styleUrls: ['./retail-history.component.scss']
})
export class RetailHistoryComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isRetailHistoryObj: boolean = false;
  retailshistoryForm: FormGroup;
  retailHistoryObj: Array<Retail> = [];
  retailHistoryLoading: boolean = false;
  retailHistoryInputParams: HttpParams;
  retailInputObj: any = {};

  constructor(private messageService: MessageService,
              private sharedService: SharedService,
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.dragAndScrollTable();
    this.initializeComponent();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.getRetailHistory(response);
      }
    });
  }

  initializeComponent() {
    jQuery('#dd_retail_history_size').dropdown();
  }

  dragAndScrollTable() {
    const slider = document.querySelector<HTMLElement>('#retailHistoryTable');
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

  getRetailHistory(chassisNo) {
    this.retailHistoryLoading = true;

    this.retailHistoryInputParams = new HttpParams();
    this.retailHistoryInputParams = this.retailHistoryInputParams.set('chassisNo', chassisNo);
    this.retailHistoryInputParams = this.retailHistoryInputParams.set('pageNumber', '1');
    this.retailHistoryInputParams = this.retailHistoryInputParams.set('pageSize', this.tableSize.toString());

    this.claimsService.getRetailHistory(this.retailHistoryInputParams).subscribe((retailResponse) => {
      if(retailResponse && retailResponse != null && retailResponse != "" && retailResponse.STATUS_OUT != "" && retailResponse.STATUS_OUT == "SUCCESS" && retailResponse.STATUS_OUT != null && retailResponse.RESPONSE_OUT != "" && retailResponse.RESPONSE_OUT != null && retailResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = retailResponse.RESPONSE_OUT.count;
        this.retailHistoryObj = retailResponse.RESPONSE_OUT.list;
        this.isRetailHistoryObj = true;
      }
      else {
        this.retailHistoryObj = [];
        this.tableCount = 0;
        this.isRetailHistoryObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'retailHistoryMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Retail History', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.retailHistoryLoading = false;
    }, (error) => {
      this.retailHistoryLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'rejectHoldMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'rejectHoldMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'retailHistoryMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Retail History Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('retailHistoryTable').scrollLeft = 0;
    
    jQuery('#dd_retail_history_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('retailHistoryTable').scrollLeft = 0;

    if(this.retailHistoryInputParams != null){
      this.retailHistoryLoading = true;
      this.isRetailHistoryObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.retailHistoryLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.retailHistoryInputParams = this.retailHistoryInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.retailHistoryInputParams = this.retailHistoryInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getRetailHistory(this.retailHistoryInputParams).subscribe((retailResponse) => {
        if(retailResponse && retailResponse != null && retailResponse != "" && retailResponse.STATUS_OUT != "" && retailResponse.STATUS_OUT == "SUCCESS" && retailResponse.STATUS_OUT != null && retailResponse.RESPONSE_OUT != "" && retailResponse.RESPONSE_OUT != null && retailResponse.RESPONSE_OUT.list.length > 0){
          this.retailHistoryObj = retailResponse.RESPONSE_OUT.list;
          this.isRetailHistoryObj = true;
        }
        else{
          this.tableCount = 0;
          this.retailHistoryObj = null;
          this.isRetailHistoryObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'retailHistoryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Retail History', life: 7000});
        }

        this.retailHistoryLoading = false;
      }, (error) => {
        this.retailHistoryLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'retailHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'retailHistoryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'retailHistoryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'retailHistoryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'retailHistoryMessage', severity:'error', summary: 'Error', detail:'Error Getting Retail History Data', life: 7000});
        }
      });
    }
  }

}

