import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { CreditNote } from '../models/credit-note.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-credit-note-breakup',
  templateUrl: './credit-note-breakup.component.html',
  styleUrls: ['./credit-note-breakup.component.scss']
})
export class CreditNoteBreakupComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  isCreditNoteBreakupObj: boolean = false;
  creditnotebreakupForm: FormGroup;
  creditNoteBreakupObj: Array<CreditNote> = [];
  creditNoteBreakupLoading: boolean = false;
  creditNoteBreakupInputParams: HttpParams;
  creditNoteBreakupInputObj: any = {};

  constructor(private formBuilder: FormBuilder, 
              private sharedService: SharedService, 
              private messageService: MessageService, 
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollTable();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != ""){
        this.getCreditNoteBreakup(response);
      }
    });
  }

  initializeComponent(): void { 
    jQuery('#dd_retail_note_breakup_size').dropdown();
  }

  dragAndScrollTable() {
    const slider = document.querySelector<HTMLElement>('#creditNoteBreakupTable');
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

  getCreditNoteBreakup(chassisNo) {
    this.creditNoteBreakupLoading = true;

    this.creditNoteBreakupInputParams = new HttpParams();
    this.creditNoteBreakupInputParams = this.creditNoteBreakupInputParams.set('chassisNo', chassisNo);
    this.creditNoteBreakupInputParams = this.creditNoteBreakupInputParams.set('pageNumber', '1');
    this.creditNoteBreakupInputParams = this.creditNoteBreakupInputParams.set('pageSize', this.tableSize.toString());

    this.claimsService.getCreditBreakup(this.creditNoteBreakupInputParams).subscribe((creditNoteBreakupResponse) => {
      if(creditNoteBreakupResponse && creditNoteBreakupResponse != null && creditNoteBreakupResponse != "" && creditNoteBreakupResponse.STATUS_OUT != "" && creditNoteBreakupResponse.STATUS_OUT == "SUCCESS" && creditNoteBreakupResponse.STATUS_OUT != null && creditNoteBreakupResponse.RESPONSE_OUT != "" && creditNoteBreakupResponse.RESPONSE_OUT != null && creditNoteBreakupResponse.RESPONSE_OUT.list.length > 0){
        this.tableCount = creditNoteBreakupResponse.RESPONSE_OUT.count;
        this.creditNoteBreakupObj = creditNoteBreakupResponse.RESPONSE_OUT.list;
        this.isCreditNoteBreakupObj = true;
      }
      else {
        this.creditNoteBreakupObj = [];
        this.tableCount = 0;
        this.isCreditNoteBreakupObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Credit Note Breakup', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.creditNoteBreakupLoading = false;
    }, (error) => {
      this.creditNoteBreakupLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Credit Note Breakup Data', life: 7000 });
      }
    })
  }

  sizeChanged(event){
    document.getElementById('creditNoteBreakupTable').scrollLeft = 0;
    
    jQuery('#dd_retail_note_breakup_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setPage(1);
  }

  setPage(page: number){
    document.getElementById('creditNoteBreakupTable').scrollLeft = 0;

    if(this.creditNoteBreakupInputParams != null){
      this.creditNoteBreakupLoading = true;
      this.isCreditNoteBreakupObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        this.creditNoteBreakupLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.creditNoteBreakupInputParams = this.creditNoteBreakupInputParams.set('pageNumber', this.pager.currentPage.toString());
      this.creditNoteBreakupInputParams = this.creditNoteBreakupInputParams.set('pageSize', this.pager.pageSize.toString());

      this.claimsService.getCreditBreakup(this.creditNoteBreakupInputParams).subscribe((creditNoteBreakupResponse) => {
        if(creditNoteBreakupResponse && creditNoteBreakupResponse != null && creditNoteBreakupResponse != "" && creditNoteBreakupResponse.STATUS_OUT != "" && creditNoteBreakupResponse.STATUS_OUT == "SUCCESS" && creditNoteBreakupResponse.STATUS_OUT != null && creditNoteBreakupResponse.RESPONSE_OUT != "" && creditNoteBreakupResponse.RESPONSE_OUT != null && creditNoteBreakupResponse.RESPONSE_OUT.length > 0){
          this.creditNoteBreakupObj = creditNoteBreakupResponse.RESPONSE_OUT.list;
          this.isCreditNoteBreakupObj = true;
        }
        else{
          this.tableCount = 0;
          this.creditNoteBreakupObj = null;
          this.isCreditNoteBreakupObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'creditNoteBreakupMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Credit Note Breakup', life: 7000});
        }

        this.creditNoteBreakupLoading = false;
      }, (error) => {
        this.creditNoteBreakupLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'creditNoteBreakupMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'creditNoteBreakupMessage', severity:'error', summary: 'Error', detail: 'Error Getting Credit Note Breakup Data', life: 7000});
        }
      });
    }
  }

}