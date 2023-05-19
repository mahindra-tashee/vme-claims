import { Component, OnInit } from '@angular/core';

import * as $ from "jquery";
declare var jQuery: any;

import { FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FinancierNameDetails } from '../models/financier-name-details.model';
import { ClaimsService } from '../services/claims.service';
import { HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-financier-chassis-details-upload',
  templateUrl: './financier-chassis-details-upload.component.html',
  styleUrls: ['./financier-chassis-details-upload.component.scss']
})

export class FinancierChassisDetailsUploadComponent implements OnInit {
  financierChassisDetailsObj: Array<FinancierNameDetails> = [];
  financierChassisDetailsLoading: boolean = false;
  isFinancierChassisFile: boolean = false;
  financierChassisFile: File = null;
  isFinancierChassisDetailsObj: boolean = false;
  selectedItems: any;
  financierDetailsForm: FormGroup;
  financierCount: number = 0;
  financierChassisItem: any;
  financierDetailsInputParams: HttpParams;
  financierDetailsInputObj: any = [];

  constructor(private messageService: MessageService,
              private claimsService: ClaimsService,
              private confirmationService: ConfirmationService,
              private datePipe:DatePipe) { }

  ngOnInit(): void {
  }

  initializeComponent() {
    for (let i = 0; i < this.financierChassisDetailsObj.length; i++) {
      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_financier_delivery_order_date_" + [i]).calendar({
        type: "date",
        formatter: {
          date: function (date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          position: 'bottom left',
          lastResort: 'bottom left',
          prefer: 'opposite',
          hideOnScroll: false
        },
        onChange: (date, text, mode) => {
          $("#txt_financier_delivery_order_date_" + [i]).val(text);
        },
      }).calendar("set date", this.datePipe.transform(this.financierChassisDetailsObj[i].delivery_ORDER_DATE, 'dd-MMM-yyyy'));
    }
  }

  choosefinancierChassisFile($event) {
    this.financierChassisFile = $event.target.files.item(0);

    if(this.financierChassisFile != null && (this.financierChassisFile.name.endsWith('.csv') || this.financierChassisFile.name.endsWith('.CSV'))) {
      this.isFinancierChassisFile = true;
    }
    else {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#file_bulk_claim').val('');
      this.financierChassisFile = null;
      this.isFinancierChassisFile = false;
      this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'info', summary: 'Note', detail: 'Please Upload CSV File Only', life: 7000 });
    }
  }

  uploadFinancierChassisFile() {
    $('.loader').show();

    document.getElementById('financierChassisDetailsTable').scrollLeft = 0;
    
    if(this.financierChassisFile != null && this.financierChassisFile.size > 0){
      $('.loader').show();

      this.claimsService.financierChassisUpload(this.financierChassisFile).subscribe((financierDetailsResponse) => {
        if (financierDetailsResponse != null && financierDetailsResponse != "" && financierDetailsResponse.STATUS_OUT == "SUCCESS" && financierDetailsResponse.RESPONSE_OUT != null && financierDetailsResponse.RESPONSE_OUT != "") {
          $('#file_bulk_claim').val('');
          this.financierChassisDetailsObj = financierDetailsResponse.RESPONSE_OUT;
          
          setTimeout(() => {
            this.initializeComponent();
          }, 0);

          this.isFinancierChassisFile = false;
          this.financierChassisFile = null;
          this.isFinancierChassisDetailsObj = true;
          $('.loader').hide();
          
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'success', summary: 'Success', detail: "Fianancier Chassis Data loaded Successfully", life: 7000 });
        }
        else {
          this.financierChassisDetailsObj = [];
          this.isFinancierChassisDetailsObj = false;
          $('.loader').hide();
          
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: 'Error in Financier Chassis Upload: ' + financierDetailsResponse.RESPONSE_OUT, life: 7000 });
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: 'Error in Financier Chassis Upload', life: 7000 });
        }
      });
    }
  }

  postValidateAndUpload() {
    this.financierCount = 0;

    if($('#txt_financier_loan_sanction_amt').val() != null && $('#txt_financier_loan_sanction_amt').val() != "" && $('#txt_financier_ltv').val() != null && $('#txt_financier_loan_tenure').val() != "" && $('#txt_financier_ltv').val() != null && $('#txt_financier_iir').val() != "" && $('#txt_financier_iir').val() != null && $('#txt_financier_emi').val() != "" && $('#txt_financier_emi').val() != null && $('#txt_financier_financier_name').val() != "" && $('#txt_financier_financier_name').val() != null && $('#cal_kitty_dashboard_to_date').val() != "" && $('#txt_financier_delivery_order_no').val() != null && $('#txt_financier_order_no').val() != "" && $('#txt_financier_order_no').val() != null && $('#txt_financier_chassis_no').val() != "" && $('#txt_financier_chassis_no').val() != null &&$('#txt_financier_delivery_order_no').val() != "" && $('#txt_financier_delivery_order_no').val() != null) {
      let confirmMessage: string = "Do You Want To Submit Details?";

      this.confirmationService.confirm({
        message: confirmMessage,
        header: 'Submit Details',
        accept: () => {
          $('.loader').show();

          for(let i = 0; i < this.financierChassisDetailsObj.length; i++){
            $('.loader').show();
            this.financierDetailsInputObj[i] = new FinancierNameDetails;
            this.financierDetailsInputObj[i].loan_SANCTION_AMT = this.financierChassisDetailsObj[i].loan_SANCTION_AMT.toString();
            this.financierDetailsInputObj[i].ltv = this.financierChassisDetailsObj[i].ltv.toString();
            this.financierDetailsInputObj[i].loan_TENURE = this.financierChassisDetailsObj[i].loan_TENURE.toString();
            this.financierDetailsInputObj[i].iir = this.financierChassisDetailsObj[i].iir.toString();
            this.financierDetailsInputObj[i].emi = this.financierChassisDetailsObj[i].emi.toString();
            this.financierDetailsInputObj[i].delivery_ORDER_DATE = this.financierChassisDetailsObj[i].delivery_ORDER_DATE;
            this.financierDetailsInputObj[i].delivery_ORDER_NO = this.financierChassisDetailsObj[i].delivery_ORDER_NO.toString();
            this.financierDetailsInputObj[i].order_NO = this.financierChassisDetailsObj[i].order_NO.toString();;
            this.financierDetailsInputObj[i].chassis_NO = this.financierChassisDetailsObj[i].chassis_NO.toString();;
            this.financierDetailsInputObj[i].financier_NAME = this.financierChassisDetailsObj[i].financier_NAME;
          }

          this.claimsService.validateAndSubmitFinancierChassisData(this.financierDetailsInputObj).subscribe((financierDetailsResponse) => {
            if (financierDetailsResponse != null && financierDetailsResponse != "" && financierDetailsResponse.STATUS_OUT != "" && financierDetailsResponse.STATUS_OUT == "SUCCESS" && financierDetailsResponse.STATUS_OUT != null && financierDetailsResponse.RESPONSE_OUT != "" && financierDetailsResponse.RESPONSE_OUT != null) {
              this.isFinancierChassisDetailsObj = false;
              this.financierChassisDetailsObj = [];
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'success', summary: 'Success', detail: 'All Financier Details submitted Successfully', life: 7000 });
            }
            else {
              this.isFinancierChassisDetailsObj = true;
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: financierDetailsResponse.RESPONSE_OUT, life: 7000 });
            }
            this.financierCount++;
            $('.loader').hide();
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{
            this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'error', summary: 'Error', detail: 'Error in Financier Chassis Upload', life: 7000 });
            }
          });
        },
        key: 'financierChassisUploadDialog'
      });
    }
    else {
      this.financierChassisDetailsLoading = false;
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'financierChassisUploadMessage', severity: 'info', summary: 'Note', detail: 'Please Fill All Mandatory Fields', life: 7000 });
    }
  }

  downloadFinancierChassisUploadTemplate() {
    var link = document.createElement('a');
    link.href = 'assets/Download-Templates/FINANCIER_DETAILS.csv';
    link.download = 'FINANCIER_DETAILS.csv';
    document.body.appendChild(link);
    link.click();
  }

  deleteRow(){
    for(let i = 0; i < this.selectedItems.length; i++) {
      let index = this.financierChassisDetailsObj.indexOf(this.selectedItems[i])
      this.financierChassisDetailsObj.splice(index, 1);
    }
  }

  isValidNumber(event, i, position) {
    if (position == 1) {
      let tempNum = $('#txt_financier_loan_sanction_amt' + i).val();
      $('#txt_financier_loan_sanction_amt' + i).val(Number(tempNum).toString());
    }
  }
}

