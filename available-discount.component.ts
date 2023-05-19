import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { AvailableDiscount } from '../models/available-discount.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-available-discount',
  templateUrl: './available-discount.component.html',
  styleUrls: ['./available-discount.component.scss']
})
export class AvailableDiscountComponent implements OnInit {
  availableDiscountLoading: boolean = false;
  availableDiscountForm: FormGroup;
  availableDiscountObj: Array<AvailableDiscount> = [];
  availableDiscountInputObj: any = {};
  availableDiscount: any;
  availableDiscountDataObj: Array<AvailableDiscount> = [];
  chassisNo: string;
  tmInvoiceNo: string;
 

  constructor(private claimsService: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.dragAndScrollTable();

    this.createOrViewForm();

    this.sharedService.getChassisNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != "") {
        this.chassisNo = response;

        if(this.chassisNo != null && this.chassisNo != "" && this.tmInvoiceNo != null && this.tmInvoiceNo != ""){
          this.getAvailableDiscount();
        }
      }
    });
    
    this.sharedService.getTMInvNo().pipe(first()).subscribe((response) => {
      if(response && response != null && response != "") {
        this.tmInvoiceNo = response;

        if(this.chassisNo != null && this.chassisNo != "" && this.tmInvoiceNo != null && this.tmInvoiceNo != ""){
          this.getAvailableDiscount();
        }
      }
    });
  }

  dragAndScrollTable(){
    const slider = document.querySelector<HTMLElement>('#availableDiscountTable');
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

  createOrViewForm() {
    this.availableDiscountForm = this.formBuilder.group({
      CHASSIS_NO: [''],
      TM_INVOICE_NO: [''],
      FLAT_DISCOUNT_SAP: [''],
      REMAINING_DISCOUNT: [''],
    });
  }

  getAvailableDiscount(){
    this.availableDiscountLoading = true;
    let availDiscInputParams: HttpParams = new HttpParams();
    availDiscInputParams = availDiscInputParams.set('pTMInvNo', this.tmInvoiceNo);
    availDiscInputParams = availDiscInputParams.set('chassisNo', this.chassisNo);
    
    this.claimsService.getAvailableDiscount(availDiscInputParams).subscribe((availableDiscountResponse) => {
      if (availableDiscountResponse && availableDiscountResponse != null && availableDiscountResponse.STATUS_OUT != null && availableDiscountResponse.STATUS_OUT != "" && availableDiscountResponse.STATUS_OUT == "SUCCESS" && availableDiscountResponse.RESPONSE_OUT != null && availableDiscountResponse.RESPONSE_OUT != "" && availableDiscountResponse.RESPONSE_OUT.length > 0) {
        this.availableDiscountObj = availableDiscountResponse.RESPONSE_OUT[0].UpfrontDiscountDetails;
        this.availableDiscountDataObj = availableDiscountResponse.RESPONSE_OUT[1].UpfrontDetails;

        this.availableDiscountForm.controls.CHASSIS_NO.setValue(this.availableDiscountDataObj[0]?.chassis_no);
        this.availableDiscountForm.controls.TM_INVOICE_NO.setValue(this.availableDiscountDataObj[0]?.tmInvNo);
        this.availableDiscountForm.controls.FLAT_DISCOUNT_SAP.setValue(this.availableDiscountDataObj[0]?.flat_Discount);
        this.availableDiscountForm.controls.REMAINING_DISCOUNT.setValue(this.availableDiscountDataObj[0]?.remaining_Discount);
      }
      else {
        this.availableDiscountObj = [];
        this.availableDiscountLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'availableDiscountMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Available Discount', life: 7000});
      }

      this.availableDiscountLoading = false;
    }, (error) => {
      this.availableDiscountLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'availableDiscountMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'availableDiscountMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'availableDiscountMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'availableDiscountMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'availableDiscountMessage', severity:'error', summary: 'Error', detail: 'Error Getting Available Discount Data', life: 7000});
      }
    });
  }
}
