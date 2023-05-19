import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ConcBreak } from '../models/conc-break.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-concession-breakup',
  templateUrl: './concession-breakup.component.html',
  styleUrls: ['./concession-breakup.component.scss']
})
export class ConcessionBreakupComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isConcessionBreakupObj: boolean = false;
  concessionBreakupForm: FormGroup;
  concessionBreakupObj: Array<ConcBreak> = [];
  concessionBreakupLoading: boolean = false;
  concessionBreakupInputObj: any = {};
  concessionBreakupInputParams: HttpParams;

  constructor(private formBuilder: FormBuilder, 
              private messageService: MessageService, 
              private sharedService: SharedService, 
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if (response && response != null && response != "") {
        this.getConcessionBreakup(response);
      }
    });
  }

  initializeComponent(): void { 
    jQuery('#dd_concession_breakup_size').dropdown();
  }

  dragAndScrollTable() {
    const slider = document.querySelector<HTMLElement>('#concessionBreakupTable');
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

  getConcessionBreakup(chassisNo) {
    this.concessionBreakupLoading = true;

    this.concessionBreakupInputParams = new HttpParams();
    this.concessionBreakupInputParams = this.concessionBreakupInputParams.set('chassisNo', chassisNo);
    this.concessionBreakupInputParams = this.concessionBreakupInputParams.set('pageNumber', '1');
    this.concessionBreakupInputParams = this.concessionBreakupInputParams.set('pageSize', this.tableSize.toString());

    this.claimsService.getConcessionBreakup(this.concessionBreakupInputParams).subscribe((concessionBreakupResponse) => {
      if(concessionBreakupResponse && concessionBreakupResponse != null && concessionBreakupResponse != "" && concessionBreakupResponse.STATUS_OUT != "" && concessionBreakupResponse.STATUS_OUT == "SUCCESS" && concessionBreakupResponse.STATUS_OUT != null && concessionBreakupResponse.RESPONSE_OUT != "" && concessionBreakupResponse.RESPONSE_OUT != null && concessionBreakupResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = concessionBreakupResponse.RESPONSE_OUT.count;
        this.concessionBreakupObj = concessionBreakupResponse.RESPONSE_OUT.list;
        this.isConcessionBreakupObj = true;
      }
      else {
        this.concessionBreakupObj = [];
        this.tableCount = 0;
        this.isConcessionBreakupObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'concessionBreakupMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Concession Breakup', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.concessionBreakupLoading = false;
    }, (error) => {
      this.concessionBreakupLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Concession Breakup Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('concessionBreakupTable').scrollLeft = 0;
    
    jQuery('#dd_concession_breakup_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('concessionBreakupTable').scrollLeft = 0;

    if(this.concessionBreakupInputParams != null){
      this.concessionBreakupLoading = true;
      this.isConcessionBreakupObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.concessionBreakupLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.concessionBreakupInputParams = this.concessionBreakupInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.concessionBreakupInputParams = this.concessionBreakupInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getConcessionBreakup(this.concessionBreakupInputParams).subscribe((concessionBreakupResponse) => {
        if(concessionBreakupResponse && concessionBreakupResponse != null && concessionBreakupResponse != "" && concessionBreakupResponse.STATUS_OUT != "" && concessionBreakupResponse.STATUS_OUT == "SUCCESS" && concessionBreakupResponse.STATUS_OUT != null && concessionBreakupResponse.RESPONSE_OUT != "" && concessionBreakupResponse.RESPONSE_OUT != null && concessionBreakupResponse.RESPONSE_OUT.length > 0){
          this.concessionBreakupObj = concessionBreakupResponse.RESPONSE_OUT.list;
          this.isConcessionBreakupObj = true;
        }
        else{
          this.tableCount = 0;
          this.concessionBreakupObj = null;
          this.isConcessionBreakupObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'concessionBreakupMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Concession Breakup', life: 7000});
        }

        this.concessionBreakupLoading = false;
      }, (error) => {
        this.concessionBreakupLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'concessionBreakupMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'concessionBreakupMessage', severity:'error', summary: 'Error', detail: 'Error Getting Concession Breakup Data', life: 7000});
        }
      });
    }
  }
}


