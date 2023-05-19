import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ClaimsService } from '../services/claims.service';
import { OfflineClaims } from '../models/offline-claims';
import { ScheduledOfflineClaims } from '../models/scheduled-offline-claims.model';
import { DatePipe } from '@angular/common';
import { SharedService } from '../services/shared.service';
import { environment } from 'src/environments/environment';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-offline-claims',
  templateUrl: './offline-claims.component.html',
  styleUrls: ['./offline-claims.component.scss']
})
export class OfflineClaimsComponent implements OnInit {
  offlineClaims: boolean = true;
  pager: any = {};
  File: File = null;
  positions: any = [];
  buid: any = [];
  scheduledClaimInputObj: any = {};
  isScheduledClaimsObj: boolean = false;
  scheduledOfflineClaimLoading: boolean = false;
  tableCount: number;
  tableSize: number = 10;
  roles: any = [];
  bulkSubmitResponse: any;
  file: any;
  date: any;
  selectedClaims: any;
  isToggleSearchFilters: boolean = false;
  isOfflineClaims: boolean = false;
  selectedScheduledClaims: any;
  offlineClaimObj: Array<OfflineClaims> = [];
  scheduledOfflineObj: Array<ScheduledOfflineClaims>;
  offlineClaimLoading: boolean = false;
  isOfflineClaimObj: boolean = false;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  isDocumentFileUpload: boolean = false;
  schemeViewUrl: string;

  constructor(private datePipe: DatePipe,
              public sharedService: SharedService,
              private messageService: MessageService,
              private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollOfflineTable();
  }

  initializeComponent() {
    jQuery('#dd_offline_claims_claim_type').dropdown();
    jQuery('#dd_offline_claims_upload_type').dropdown();
    jQuery('#dd_registration_type_selection').dropdown();
    jQuery("#dd_scheduled_offline_claims_role").dropdown();
    jQuery("#dd_scheduled_offline_claims_position").dropdown();
    jQuery("#dd_scheduled_offline_claims_business_unit").dropdown();
    jQuery("#dd_scheduled_offline_claims_claim_status").dropdown();
    jQuery('#dd_scheduled_offline_claims_claim_type').dropdown();
    jQuery('#dd_offline_claims_size').dropdown();
    jQuery('#dd_scheduled_offline_claims_date_type').dropdown();
    jQuery('#dd_scheduled_offline_claims_business_unit').dropdown();
    
    setTimeout(() => {
      jQuery('.coupled.modal').modal({ allowMultiple: true });
      jQuery('.accordion').accordion({ selector: { trigger: '.title' } });
      jQuery('.tabular.menu .item').tab({ history: false });
      jQuery('.menu .item').tab();
    }, 0);

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;

    jQuery("#cal_scheduled_offline_claims_start_date").calendar({
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
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      },
      onChange: (date, text, mode) => {
        if (date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_scheduled_offline_claims_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_scheduled_offline_claims_end_date").val().toString() == null))) {
          jQuery("#cal_scheduled_offline_claims_end_date").calendar("set date", date);
        }
        else if (isEndDate) {
          isEndDate = false;
        }

        jQuery("#txt_scheduled_offline_claims_start_date").calendar("set date", text);
      },
      endCalendar: jQuery("#cal_scheduled_offline_claims_end_date")
    }).calendar("set date");

    jQuery("#cal_scheduled_offline_claims_end_date").calendar({
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
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      },
      onChange: (date, text, mode) => {
        if (date != "" && date != null && date != undefined && ($("#txt_scheduled_offline_claims_start_date").val().toString() == "" || $("#txt_scheduled_offline_claims_end_date").val().toString() == null)) {
          isEndDate = true;
          jQuery("#cal_scheduled_offline_claims_start_date").calendar("set date", date);
        }

        jQuery("#txt_scheduled_offline_claims_end_date").calendar("set date", text);
      },
      startCalendar: jQuery("#cal_scheduled_offline_claims_start_date")
    }).calendar("set date");

    $('#dd_registration_type_selection').on('change', () => {

      if (jQuery('#dd_registration_type_selection').dropdown('get value') == "offlineclaim") {

        this.isOfflineClaims = false;
        this.offlineClaims = true;
        this.scheduledOfflineObj = [];
        this.resetFields();
      }
      else {
        this.dragAndScrollScheduleOfflineTable();
        this.offlineClaims = false;
        this.isOfflineClaims = true;
        this.offlineClaimObj = [];
        this.scheduledOfflineObj = [];
        this.isScheduledClaimsObj = false;
        this.getRoles();
        this.resetFields();
      }
    });

    $('#dd_offline_claims_claim_type').on('change', () => {
      if (jQuery('#dd_offline_claims_claim_type').dropdown('get value') == "POST_SETTLE") {
        this.offlineClaimObj = [];
        this.isOfflineClaims = false;
        jQuery('#fileupload').val('');
        this.isDocumentFileUpload = false;
      }
      else {
        this.offlineClaimObj = [];
        this.isOfflineClaims = false;
        jQuery('#fileupload').val('');
        this.isDocumentFileUpload = false;
      }
    });
  }

  chooseClaimFile($event) {
    this.File = $event.target.files.item(0);
    
    if (this.File != null && this.File.name.toLocaleLowerCase().endsWith('.csv')) {
      this.isDocumentFileUpload = true;
    }
    else {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#fileupload').val('');
      this.File = null;
      this.isDocumentFileUpload = false;
      this.messageService.add({ key: 'offlineClaimsMessage', severity: 'info', summary: 'Note', detail: 'Please Upload .CSV File Only', life: 7000 });
    }
  }

  uploadClaimFile() {
    this.isDocumentFileUpload = false;
    var claimType = jQuery('#dd_offline_claims_claim_type').dropdown('get value');
    if (claimType == '' || claimType == null) {
      this.messageService.add({ severity: 'info', key: 'offlineClaimsMessage', summary: 'Note', detail: 'Please Select Claim Type', life: 7000 });
    }
    else if (claimType == 'PRE_SETTLE' || claimType == 'POST_SETTLE') {
      $('.loader').show();
      this.claimsService.offlineClaimUploader(this.File, jQuery('#dd_offline_claims_claim_type').dropdown('get value')).subscribe((offlineClaimsResponse) => {                       //, jQuery('#dd_uploadtype').dropdown('get value')
        this.offlineClaimObj = [];
        $('.loader').hide();

        if (offlineClaimsResponse != null && offlineClaimsResponse != "" && offlineClaimsResponse.STATUS_OUT == 'SUCCESS') {
          this.offlineClaimObj = offlineClaimsResponse.RESPONSE_OUT;
          this.isOfflineClaimObj = true;

          for (var i = 0; i < offlineClaimsResponse.length; i++) {
            this.offlineClaimObj[i] = new OfflineClaims();
            this.offlineClaimObj[i].chassis_NO = offlineClaimsResponse[i].chassis_NO;
            this.offlineClaimObj[i].dealer_CODE = offlineClaimsResponse[i].dealer_CODE;
            this.offlineClaimObj[i].scheme_ID = offlineClaimsResponse[i].scheme_ID;
            this.offlineClaimObj[i].claim_AMOUNT = offlineClaimsResponse[i].claim_AMOUNT;
            this.offlineClaimObj[i].settlement_REF_NO = offlineClaimsResponse[i].settlement_REF_NO;
            this.offlineClaimObj[i].sap_DOC_NO = offlineClaimsResponse[i].sap_DOC_NO;
            this.offlineClaimObj[i].sap_DOC_DATE = offlineClaimsResponse[i].sap_DOC_DATE;
            this.offlineClaimObj[i].CLAIM_ID = offlineClaimsResponse[i].claim_ID;
            this.offlineClaimObj[i].status = offlineClaimsResponse[i].status;
            this.offlineClaimObj[i].remark = offlineClaimsResponse[i].remark;

          }
          this.isOfflineClaims = true;
          this.messageService.add({ severity: 'success', key: 'offlineClaimsMessage', summary: 'Success', detail: 'Offline Claims Uploaded Successfully!' });
        }
        else {
          $('.loader').hide();
          this.isOfflineClaims = false;
          this.messageService.add({ severity: 'error', key: 'offlineClaimsMessage', summary: 'Error', detail: 'Error in Getting data: ' + offlineClaimsResponse.RESPONSE_OUT });
        }
      }, (error) => {
        $('.loader').hide();
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: 'Error While Uploading File' });
        }
      });
    }
    jQuery('#fileupload').val('');
  }

  exportOfflineClaimData() {
    if (this.offlineClaimObj != null && this.offlineClaimObj.length > 0 ) {

      var JSONData = JSON.parse(JSON.stringify(this.offlineClaimObj, ["claim_ID", "scheme_ID", "chassis_NO", "claim_AMOUNT", "gst_inv_NO","gst_inv_DT","dealer_CODE","settlement_REF_NO","comments","sap_DOC_DATE","sap_DOC_NO","claim_TYPE", "status", "remark"]));

      var ShowLabel = true;
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
      var CSV = '';
      var reqData: number[] = [];
      var headings: string[] = [];

      if (ShowLabel) {
        var row = "";
        var num = -1;

        for (var index in arrData[0]) {
          num++;

          if (index == 'claim_ID' || index == 'scheme_ID' || index == 'chassis_NO'  || index == 'claim_AMOUNT' || index == 'gst_inv_NO' || index == 'gst_inv_DT' || index == 'dealer_CODE' ||index=='settlement_REF_NO' || index == 'comments'||index=='sap_DOC_DATE' || index=='sap_DOC_NO'||index=='claim_TYPE' || index == 'status' || index == 'remark') {
            reqData.push(num);
            headings.push(index)

            if (index == 'claim_ID') {
              index = 'Claim Id';
            }

            if (index == 'chassis_NO') {
              index = 'Chassis Number';
            }

            if (index == 'scheme_ID') {
              index = 'Scheme Id';
            }

            if (index == 'claim_AMOUNT') {
              index = 'Claim Amount';
            }

            if (index == 'gst_inv_NO') {
              index = 'GST INVOICE NO';
            }

            if (index == 'gst_inv_DT') {
              index = 'GST INV Date(DD-MMM-YY)';
            }

            if (index == 'dealer_CODE') {
              index = 'Dealer Code';
            }
            
            if (index == 'settlement_REF_NO') {
              index = ' Settlement Reference No';
            }

            if (index == 'comments') {
              index = 'GDC Comments';
            }

            if (index == 'sap_DOC_NO') {
              index = 'SAP Doc No';
            }

            if (index == 'sap_DOC_DATE') {
              index = 'SAP Doc Date';
            }
           
            if (index == 'status') {
              index = 'Status';
            }

            if (index == 'remark') {
              index = 'Remark';
            }

            row += index + ',';
          }
        }

        row = row.slice(0, -1);

        CSV += row + '\r\n';
      }

      for (var i = 0; i < arrData.length; i++) {
        var row = "";

        for (var j = 0; j < headings.length; j++) {
          row += '"' + arrData[i][headings[j]] + '",';
        }

        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
      }

      if (CSV == '') {
        return;
      }

      var fileName = "Offline Claim Details";
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }       
  }

  downloadTemplate() {
    var claimType = jQuery('#dd_offline_claims_claim_type').dropdown('get value');

    if (claimType == '' || claimType == null) {
      this.messageService.add({ severity: 'info', key: 'offlineClaimsMessage', summary: 'Note', detail: 'Select Claim Type to Download Template' });
    }
    else if (claimType == 'PRE_SETTLE') {
      var fileName = 'VME_OFFLINE_PRE_UPLOAD.csv';
      var link = document.createElement('a');
      link.href = 'assets/Download-Templates/VME_OFFLINE_PRE_UPLOAD.csv';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
    else if (claimType == 'POST_SETTLE') {
      var fileName = 'VME_OFFLINE_POST_UPLOAD.csv';
      var link = document.createElement('a');
      link.href = 'assets/Download-Templates/VME_OFFLINE_POST_UPLOAD.csv';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
  }

  resetFields() {
    this.isDocumentFileUpload = false;
    jQuery('#fileupload').val('');
    this.offlineClaimObj = [];
    this.scheduledOfflineObj = [];
    this.isOfflineClaims = false;
  }

  getRoles() {

    this.claimsService.getRole().subscribe((offlineClaimsResponse) => {    
      jQuery('#dd_scheduled_offline_claims_role').parent().addClass("loading");
      if(offlineClaimsResponse && offlineClaimsResponse != null && offlineClaimsResponse.length > 0){
      this.roles = offlineClaimsResponse;
        this.getPositions();
        jQuery("#dd_scheduled_offline_claims_role").parent().removeClass("loading");
      }
      else{
        jQuery("#dd_scheduled_offline_claims_role").parent().removeClass("loading");
        this.messageService.add({ severity: 'info', life: 7000, key: 'offlineClaimsMessage', summary: 'Note', detail: 'No data for User Roles.' });
      }
      }),((error) => {
        jQuery("#dd_scheduled_offline_claims_role").parent().removeClass("loading");
        this.messageService.add({ severity: 'error', life: 7000, key: 'offlineClaimsMessage', summary: 'Error', detail: 'Error in getting User Roles.' });
      });
  }

  getPositions() {

    setTimeout(() => {
      jQuery('#dd_scheduled_offline_claims_position').dropdown("clear");
      jQuery('#dd_scheduled_offline_claims_position').parent().addClass("loading");

      this.claimsService.getUserPositions(jQuery("#dd_scheduled_offline_claims_role").dropdown("get value")).subscribe((offlineClaimsResponse) => {
        jQuery("#dd_scheduled_offline_claims_position").parent().removeClass("loading");
        if(offlineClaimsResponse && offlineClaimsResponse != null && offlineClaimsResponse.length > 0){
        this.positions = offlineClaimsResponse;
            this.getbuid();
        }
        else{
          jQuery("#dd_scheduled_offline_claims_position").parent().removeClass("loading");
          this.messageService.add({ severity: 'info', life: 7000, key: 'offlineClaimsMessage', summary: 'Note', detail: 'No data for User Positions.' });
        }
      }), ((error) => {
        jQuery('#dd_scheduled_offline_claims_position').parent().removeClass("loading");
        this.messageService.add({ severity: 'error', life: 7000, key: 'offlineClaimsMessage', summary: 'Error', detail: 'Error in getting User Positions.' });
      });
    }, 500);
    jQuery('#dd_scheduled_offline_claims_position').parent().removeClass("loading");
  }

  getbuid() {

    setTimeout(() => {
      jQuery('#dd_scheduled_offline_claims_business_unit').dropdown("clear");
      jQuery('#dd_scheduled_offline_claims_business_unit').parent().addClass("loading");

      this.buid = [];
      
      this.claimsService.getGeoMapping(jQuery("#dd_scheduled_offline_claims_position").dropdown("get value")).subscribe((offlineClaimsResponse) => {

          this.buid = offlineClaimsResponse;
          jQuery('#dd_scheduled_offline_claims_business_unit').parent().removeClass("loading");
          if(offlineClaimsResponse!=null && offlineClaimsResponse !=''){
          this.searchFilter(true);
          }

      }),((error) => {
        jQuery('#dd_scheduled_offline_claims_business_unit').parent().removeClass("loading");
        this.messageService.add({ severity: 'error', life: 7000, key: 'offlineClaimsMessage', summary: 'Error', detail: 'Error in getting Business Unit.' });
      });
    },0);
  }

  searchFilter(flag) {
    this.selectedScheduledClaims = [];

    this.scheduledClaimInputObj = new Object();

    if (jQuery('#dd_scheduled_offline_claims_business_unit').dropdown('get value') != null && jQuery('#dd_scheduled_offline_claims_business_unit').dropdown('get value') != "") {
      this.scheduledClaimInputObj.pBU = jQuery('#dd_scheduled_offline_claims_business_unit').dropdown('get value');
    }
    else {
      this.scheduledClaimInputObj.pBU =  '';
    }

    if (jQuery('#dd_scheduled_offline_claims_claim_type').dropdown('get value') != null && jQuery('#dd_scheduled_offline_claims_claim_type').dropdown('get value') != "") {
      this.scheduledClaimInputObj.pCLAIM_TYPE = jQuery('#dd_scheduled_offline_claims_claim_type').dropdown('get value');
    }
    else {
      this.scheduledClaimInputObj.pCLAIM_TYPE = '';
    }

    if (jQuery('#dd_scheduled_offline_claims_claim_status').dropdown('get value') != null && jQuery('#dd_scheduled_offline_claims_claim_status').dropdown('get value') != "") {
      this.scheduledClaimInputObj.pSTATUS_ID = jQuery('#dd_scheduled_offline_claims_claim_status').dropdown('get value');
    }
    else {
      this.scheduledClaimInputObj.pSTATUS_ID = '';
    }

    if ($('#cal_scheduled_offline_claims_start_date input').val() != null && $('#cal_scheduled_offline_claims_start_date input').val() != "") {
      this.date = this.datePipe.transform(new Date(jQuery('#cal_scheduled_offline_claims_start_date input').val()), 'dd-MMM-yyyy');
      this.scheduledClaimInputObj.pFROM_DATE = this.date;
    }
    else {
      this.scheduledClaimInputObj.pFROM_DATE = '';
    }

    if ($('#cal_scheduled_offline_claims_end_date input').val() != null && $('#cal_scheduled_offline_claims_end_date input').val() != "") {
      this.date = this.datePipe.transform(new Date(jQuery('#cal_scheduled_offline_claims_end_date input').val()), 'dd-MMM-yyyy');
      this.scheduledClaimInputObj.pTO_DATE = this.date;
    }
    else {
      this.scheduledClaimInputObj.pTO_DATE = '';
    }

    if ($('#txt_scheduled_claims_scheme_id').val() != null && $('#txt_scheduled_claims_scheme_id').val() != "") {
      this.scheduledClaimInputObj.pSCHEME_ID = $('#txt_scheduled_claims_scheme_id').val().toString().trim().split(',');
    }
    else {
      this.scheduledClaimInputObj.pSCHEME_ID = [];
    }

    if ($('#txt_scheduled_claims_chassis_no').val() != null && $('#txt_scheduled_claims_chassis_no').val() != "") {
      this.scheduledClaimInputObj.pCHASSIS_NO = $('#txt_scheduled_claims_chassis_no').val().toString().trim().split(',');
    }
    else {
      this.scheduledClaimInputObj.pCHASSIS_NO = [];
    }
    
    if ($('#txt_scheduled_claims_dealer_code').val() != null && $('#txt_scheduled_claims_dealer_code').val() != "") {
      this.scheduledClaimInputObj.DEALER_CODE = $('#txt_scheduled_claims_dealer_code').val().toString().trim().split(',');
    }
    else {
      this.scheduledClaimInputObj.DEALER_CODE = [];
    }

    this.getScheduleData();
  }

  getScheduleData(){
    $('.loader').show();
    this.isScheduledClaimsObj = false;

    this.scheduledClaimInputObj.pageNumber = '1';
    this.scheduledClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getAllBatchUploadedClaims(this.scheduledClaimInputObj).subscribe((offlineClaimsResponse) => {
      if(offlineClaimsResponse && offlineClaimsResponse.STATUS_OUT === "SUCCESS" && offlineClaimsResponse.RESPONSE_OUT.count > 0){
        this.tableCount = offlineClaimsResponse.RESPONSE_OUT.count;
        this.scheduledOfflineObj = offlineClaimsResponse.RESPONSE_OUT.list;
        this.isScheduledClaimsObj = true;
      }
      else{
        this.scheduledOfflineObj = [];
        this.tableCount = 0;
        this.isScheduledClaimsObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'offlineClaimsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Schedule Claims', life: 7000});
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'offlineClaimsMessage', severity:'error', summary: 'Error', detail:'Error Getting Schedule Claims Data', life: 7000});
      }
    });
  }

  sizeChanged(event) {
    jQuery('#dd_offline_claims_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.scheduleSetPage(1);
  }

  scheduleSetPage(page: number) {

    if(this.scheduledClaimInputObj != null){
      $('.loader').show();
      this.isScheduledClaimsObj = false;
      this.selectedScheduledClaims = [];

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.scheduledClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.scheduledClaimInputObj.pageSize = this.pager.pageSize.toString();
      
      this.claimsService.getAllBatchUploadedClaims(this.scheduledClaimInputObj).subscribe((offlineClaimsResponse) => {
        if(offlineClaimsResponse && offlineClaimsResponse.STATUS_OUT === "SUCCESS" && offlineClaimsResponse.RESPONSE_OUT.count > 0){
          this.tableCount = offlineClaimsResponse.RESPONSE_OUT.count;
          this.scheduledOfflineObj = offlineClaimsResponse.RESPONSE_OUT.list;
          this.isScheduledClaimsObj = true;
          this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);
        }
        else{
          this.tableCount = 0;
          this.scheduledOfflineObj = null;
          this.isScheduledClaimsObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'offlineClaimsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheduled Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'offlineClaimsMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheduled Claims Data', life: 7000});
        }
      });
    }
  }


  exportScheduleClaimData(){
    if (this.scheduledClaimInputObj != null) {

      let scheduledClaimInputObj = this.scheduledClaimInputObj;

      scheduledClaimInputObj.pageSize = '0';
      scheduledClaimInputObj.pageNumber = '0';

      this.claimsService.exportScheduleClaims(scheduledClaimInputObj).subscribe((rejectHoldResponse) => {
        const blob = rejectHoldResponse;
        const url = window.URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = "Schedule-Batch-Claim-Details.xls";
        link.click();

      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({ key: 'offlineClaimsMessage', severity: 'error', summary: 'Error', detail: 'Error Exporting Schedule Claims Data', life: 7000 });
        }
      });
    }
  }

  onFileSelect(e) {
    this.file = e.target.files[0];
    var name: string[] = []

    name = this.file.name.split('.');

    if (name[name.length - 1].includes('csv') == true || name[name.length - 1].includes('CSV') == true) {
      this.isDocumentFileUpload = true;
    }
    else {
      this.messageService.add({ severity: 'info', life: 7000, key: 'offlineClaimsMessage', summary: 'Note', detail: 'Upload .CSV File Only' });
      jQuery('#schedulefileupload').val('');
      this.isDocumentFileUpload = false;
      this.file = undefined;
    }
  }

  templatedownload() {
    var claimType = jQuery('#dd_scheduled_offline_claims_claim_type').dropdown('get value');

    if (claimType == '' || claimType == null) {
      this.messageService.add({ severity: 'info', key: 'offlineClaimsMessage', summary: 'Note', detail: 'Select Claim Type to Download Template' });
    }

    else {
      let link = document.createElement('a');

      if (jQuery("#dd_scheduled_offline_claims_claim_type").dropdown("get value") == "OFFLINE") {
        link.download = "VME_OFFSCHD_CLMS_POST_UPLOAD.csv";
        link.href = "assets/Download-Templates/VME_OFFSCHD_CLMS_POST_UPLOAD.csv";
        link.click();
      }
      else if (jQuery("#dd_scheduled_offline_claims_claim_type").dropdown("get value") == "ONBEHLF") {
        link.download = "VME_OFFSCHD_CLMS_PRE_UPLOAD.csv";
        link.href = "assets/Download-Templates/VME_OFFSCHD_CLMS_PRE_UPLOAD.csv";
        link.click();
      }
      else {
        link.download = "VME_OFFSCHD_CLMS_PRE_HOLD_REJECT_UPLOAD.csv";
        link.href = "assets/VME_OFFLINE_PRE_HOLD_REJECT_UPLOAD.csv";
        link.click();
      }
    }
  }

  scheduledFileUpload() {
    this.isDocumentFileUpload = false;
    var claimType = jQuery('#dd_scheduled_offline_claims_claim_type').dropdown('get value');
    if (claimType == '' || claimType == null) {
      this.messageService.add({ severity: 'info', life: 7000, key: 'offlineClaimsMessage', summary: 'Note:', detail: 'Please Select Claim Type' });
    }

    var frmdata = new FormData();
    frmdata.append('settlement', jQuery("#dd_scheduled_offline_claims_claim_type").dropdown("get value"));
    frmdata.append('file', this.file);

    if (jQuery("#dd_scheduled_offline_claims_claim_type").dropdown("get value") == "ONBEHLF" || jQuery("#dd_scheduled_offline_claims_claim_type").dropdown("get value") == "OFFLINE") {
      this.claimsService.scheduledOfflineUpload(frmdata).subscribe((offlineClaimsResponse) => {

        if (offlineClaimsResponse != null && offlineClaimsResponse != "" && offlineClaimsResponse.STATUS_OUT == 'SUCCESS') {
          this.messageService.add({ severity: 'success', life: 7000, key: 'offlineClaimsMessage', summary: 'Success', detail: 'Data Uploaded Successfully' });
        }
        else {
          this.messageService.add({ severity: 'info', life: 7000, key: 'offlineClaimsMessage', summary: 'Note', detail: offlineClaimsResponse.RESPONSE_OUT });
        }
      },(error) => {
        this.messageService.add({ severity: 'error', life: 7000, key: 'offlineClaimsMessage', summary: 'Error', detail: 'Error while uploading file' });
      });
    }
    jQuery('#schedulefileupload').val('');
  }

  clearFilter() {

    jQuery("#dd_scheduled_offline_claims_claim_status").dropdown('clear');
    jQuery('#dd_scheduled_offline_claims_date_type').dropdown('clear');
    jQuery('#dd_scheduled_offline_claims_business_unit').dropdown('clear');
    jQuery('#dd_scheduled_offline_claim_type').dropdown('clear');
    jQuery("#cal_scheduled_offline_claims_start_date").calendar("set date");
    jQuery("#cal_scheduled_offline_claims_end_date").calendar("set date");
    $('#txt_scheduled_claims_chassis_no').val('');
    $('#txt_scheduled_claims_scheme_id').val('');
    $('#txt_scheduled_claims_dealer_code').val('');

    this.searchFilter(true);
  }

  toggleSearchFilters() {
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }

  openChassisView(chassisNo) {
    this.sharedService.changeChassisNo(chassisNo);

    setTimeout(() => {
      jQuery('#modal_chassis_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.chassisViewTabsLazyComp = import('../chassis-details-tabs-view/chassis-details-tabs-view.component').then(({ ChassisDetailsTabsViewComponent }) => ChassisDetailsTabsViewComponent);
    }, 0);
  }

  closeChassisView() {
    jQuery('#modal_chassis_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeChassisNo("");
    this.chassisViewTabsLazyComp = null;
  }

  openSchemeView(schemeId) {
    jQuery('#model_offline_batch_claims_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.schemeViewUrl = "";

    setTimeout(() => {
      this.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView() {
    this.schemeViewUrl = "";
  }

  dragAndScrollOfflineTable() {
    const slider = document.querySelector<HTMLElement>('#offlineTable');
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

  dragAndScrollScheduleOfflineTable() {
    const slider = document.querySelector<HTMLElement>('#scheduledofflineClaimTable');
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
      const walk = (x - startX) * 3; 
      slider.scrollLeft = scrollLeft - walk;
    });
  }
}