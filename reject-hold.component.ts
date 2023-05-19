import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Type } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';
import { RejectHold } from '../models/reject-hold.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-reject-hold',
  templateUrl: './reject-hold.component.html',
  styleUrls: ['./reject-hold.component.scss']
})
export class RejectHoldComponent implements OnInit {
  rejectHoldClaims: boolean = true;
  isDocumentFileUpload: boolean = false;
  isDocumentFileloaded: boolean = false;
  isRejectHoldClaims: boolean = false;
  rejectHoldClaimLoading: boolean = false;
  rejectHoldScheduleClaimLoading: boolean = false;
  isRejectHoldFile: boolean = false;
  isRejectHoldScheduledObj: boolean = false;
  rejectHoldClaimObj: Array<RejectHold> = [];
  rejectHoldInputObj: any = [];
  rejectHoldClaimInputObj: any = {};
  isRejectHoldClaimObj: boolean = false;
  isRejectHoldClaimButtonObj: boolean = false;
  isToggleSearchFilters: boolean = false;
  rejectHoldFile: File = null;
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  schemeViewUrl: string;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  trueCount: number = 0;
  falseCount: number = 0;
  date: any;

  constructor(private datePipe: DatePipe,
    public sharedService: SharedService,
    private messageService: MessageService,
    private claimsService: ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollRejectHoldTable();

  }

  initializeComponent() {
    jQuery('#dd_registration_type_selection').dropdown();
    jQuery('#dd_reject_hold_claims_claim_type').dropdown();
    jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown();
    jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown();
    jQuery('#dd_offline_claims_size').dropdown();

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;

    jQuery("#cal_scheduled_reject_hold_claims_start_date").calendar({
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
        if (date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_scheduled_reject_hold_claims_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_scheduled_reject_hold_claims_end_date").val().toString() == null))) {
          jQuery("#cal_scheduled_reject_hold_claims_end_date").calendar("set date",);
        }
        else if (isEndDate) {
          isEndDate = false;
        }

        jQuery("#txt_scheduled_reject_hold_claims_start_date").calendar("set date",);
      },
      endCalendar: jQuery("#cal_scheduled_reject_hold_claims_end_date")
    }).calendar("set date",);

    jQuery("#cal_scheduled_reject_hold_claims_end_date").calendar({
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
        if (date != "" && date != null && date != undefined && ($("#txt_scheduled_reject_hold_claims_start_date").val().toString() == "" || $("#txt_scheduled_reject_hold_claims_end_date").val().toString() == null)) {
          isEndDate = true;
          jQuery("#cal_scheduled_reject_hold_claims_start_date").calendar("set date",);
        }

        jQuery("#txt_scheduled_reject_hold_claims_end_date").calendar("set date",);
      },
      startCalendar: jQuery("#cal_scheduled_reject_hold_claims_start_date")
    }).calendar("set date",);

    setTimeout(() => {
      jQuery('.coupled.modal').modal({ allowMultiple: true });
      jQuery('.accordion').accordion({ selector: { trigger: '.title' } });
      jQuery('.tabular.menu .item').tab({ history: false });
      jQuery('.menu .item').tab();
    }, 0);

    $('#dd_registration_type_selection').on('change', () => {
      if (jQuery('#dd_registration_type_selection').dropdown('get value') == "reject_hold_option") {

        this.isRejectHoldClaims = false;
        this.rejectHoldClaims = true;
        this.isDocumentFileUpload = false;
        this.rejectHoldClaimObj = [];
        this.isRejectHoldClaimObj = false;
        this.isRejectHoldClaimButtonObj = false;
        this.isDocumentFileloaded = false;
        this.rejectHoldInputObj = [];
        $('#fileupload').val('');
        this.clearFilter();
      }
      else {

        $('#fileupload').val('');
        this.rejectHoldClaims = false;
        this.isRejectHoldClaims = true;
        this.rejectHoldClaimObj = [];
        this.isRejectHoldClaimObj = false;
        this.isDocumentFileUpload = false;
        this.isDocumentFileloaded = false;
        this.clearFilter();
        this.searchFilter(true);
      }
    });
  }

  dragAndScrollRejectHoldTable() {
    const slider = document.querySelector<HTMLElement>('#rejectHoldTable');
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

  chooseClaimFile($event) {
    this.rejectHoldFile = $event.target.files.item(0);

    if (this.rejectHoldFile != null && this.rejectHoldFile.name.toLocaleLowerCase().endsWith('.csv')) {
      this.isDocumentFileUpload = true;
    }
    else {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#fileupload').val('');
      this.rejectHoldFile = null;
      this.isDocumentFileUpload = false;
      this.messageService.add({ key: 'rejectHoldMessage', severity: 'info', summary: 'Note', detail: 'Please Upload .CSV File Only', life: 7000 });
    }
  }

  onFileSelect($event) {
    this.rejectHoldFile = $event.target.files.item(0);

    if (this.rejectHoldFile != null && this.rejectHoldFile.name.toLocaleLowerCase().endsWith('.csv')) {
      this.isDocumentFileloaded = true;
    }
    else {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#schedulefileupload').val('');
      this.rejectHoldFile = null;
      this.isDocumentFileloaded = false;
      this.messageService.add({ key: 'rejectHoldMessage', severity: 'info', summary: 'Note', detail: 'Please Upload .CSV File Only', life: 7000 });
    }
  }

  downloadTemplate() {
    var claimType = jQuery('#dd_reject_hold_claims_claim_type').dropdown('get value');

    if (claimType == 'HOLD') {
      var fileName = 'VME_HOLD_UPLOAD.csv';
      var link = document.createElement('a');
      link.href = 'assets/Download-Templates/VME_HOLD_UPLOAD.csv';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
    else if (claimType == 'REJT') {
      var fileName = 'VME_REJECT_UPLOAD.csv';
      var link = document.createElement('a');
      link.href = 'assets/Download-Templates/VME_REJECT_UPLOAD.csv';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
    else if (claimType == 'UHLD') {
      var fileName = 'VME_UNHOLD_UPLOAD.csv';
      var link = document.createElement('a');
      link.href = 'assets/Download-Templates/VME_UNHOLD_UPLOAD.csv';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
  }

  loadFile() {
    $('.loader').show();
    this.isDocumentFileUpload = false;
    let claimType = jQuery('#dd_reject_hold_claims_claim_type').dropdown('get value').toString();
    if (this.rejectHoldFile != null && this.rejectHoldFile.size > 0 && claimType != "") {
      this.claimsService.rejectHoldloadData(this.rejectHoldFile, claimType).subscribe((rejectHoldResponse) => {  //,claimType
        if (rejectHoldResponse != null && rejectHoldResponse != "" && rejectHoldResponse.STATUS_OUT == "SUCCESS" && rejectHoldResponse.RESPONSE_OUT != null && rejectHoldResponse.RESPONSE_OUT != "") {

          this.rejectHoldClaimObj = rejectHoldResponse.RESPONSE_OUT;
          this.isDocumentFileloaded = true;
          this.isRejectHoldFile = false;
          this.isRejectHoldClaimButtonObj = true;
          $('.loader').hide();

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'rejectHoldMessage', severity: 'success', summary: 'Success', detail: "Hold/Reject Data loaded and Validate Successfully", life: 7000 });
        }
        else {
          this.rejectHoldClaimObj = [];
          this.isRejectHoldClaimButtonObj = false;
          $('.loader').hide();

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'rejectHoldMessage', severity: 'info', summary: 'Note', detail: rejectHoldResponse.RESPONSE_OUT, life: 7000 });   
        }
        $('#fileupload').val('');
      }, (error) => {
        $('.loader').hide();
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
        this.messageService.add({ key:'rejectHoldMessage', severity: 'error', summary: 'Error', detail: 'Error in Upload Claims Details', life: 7000 });
        }
      });
      $('#fileupload').val('');
    }
  }

  validateUploadClaimFile() {
    this.trueCount = 0;
    this.falseCount = 0;

    
    for (let i = 0; i < this.rejectHoldClaimObj.length; i++) {
      if (this.rejectHoldClaimObj[i].status == 'Valid') {
        this.rejectHoldInputObj[i] = new RejectHold;
        this.rejectHoldInputObj[i].claimId = this.rejectHoldClaimObj[i].claim_ID.toString();
        this.rejectHoldInputObj[i].remarks = this.rejectHoldClaimObj[i].comments.toString();
        this.rejectHoldInputObj[i].action = jQuery('#dd_reject_hold_claims_claim_type').dropdown('get value').toString();
        this.rejectHoldInputObj[i].toUser = "";
        this.rejectHoldInputObj[i].fromRole = 'MGDC';
      }
    }

    const data = this.rejectHoldInputObj.filter(element => {
      if (Object.keys(element).length !== 0) {
        return true;
      }
      return false;
    });

    this.claimsService.updateIndClaimCustody(data).subscribe((rejectHoldResponse) => {
      if (rejectHoldResponse && rejectHoldResponse != null && rejectHoldResponse != "" && rejectHoldResponse[0] && rejectHoldResponse[0] != null && rejectHoldResponse[0] != "" && rejectHoldResponse[0].successOut && (rejectHoldResponse[0].successOut == 'TRUE' || rejectHoldResponse[0].successOut == 'FALSE') && rejectHoldResponse[0].successOut != null && rejectHoldResponse[0].successOut != "" && rejectHoldResponse[0].successMsgOut && rejectHoldResponse[0].successMsgOut != "" && rejectHoldResponse[0].successMsgOut != null) {
        let claimType = jQuery('#dd_reject_hold_claims_claim_type').dropdown('get value').toString();
        let rejectHoldResponseCount = 0;
        console.log(rejectHoldResponse.length);

        for (let i = 0; i < this.rejectHoldClaimObj.length || rejectHoldResponseCount < rejectHoldResponse.length; i++) {         
          if (this.rejectHoldClaimObj[i].status == 'Valid' && rejectHoldResponse[rejectHoldResponseCount].successOut == 'TRUE') {
            if (claimType == 'REJT') {
              this.rejectHoldClaimObj[i].remarks = 'Claim Reject Successfully';
            }
            else if (claimType == 'HOLD') {
              this.rejectHoldClaimObj[i].remarks = 'Claim Hold Successfully';
            }
            else {
              this.rejectHoldClaimObj[i].remarks = 'Claim Unhold Successfully';
            }

            this.rejectHoldClaimObj[i].status = "Success";
            this.trueCount++;
            rejectHoldResponseCount++;
          }
          else if (this.rejectHoldClaimObj[i].status == 'Valid' && rejectHoldResponse[rejectHoldResponseCount].successOut == 'FALSE') {  
            this.rejectHoldClaimObj[i].remarks = "Failed to update custody";
            this.rejectHoldClaimObj[i].status = "Failed";
            this.falseCount++;
            rejectHoldResponseCount++
          }
          else if (this.rejectHoldClaimObj[i].status == "FAIL") {
            console.log(this.rejectHoldClaimObj[i].claim_ID)
            this.rejectHoldClaimObj[i].remarks = "Criteria dose not match to update custody"; 
            this.rejectHoldClaimObj[i].status = "Failed";
            this.falseCount++;
          }
        }

        $('.loader').hide();
        this.isDocumentFileUpload = false;
        this.isDocumentFileloaded = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if (this.trueCount >= 1) {
          this.messageService.add({ key: 'rejectHoldMessage', severity: 'success', summary: 'Success', detail: this.trueCount + ' Claims Custody Updated Successfully', life: 7000 });
        }
        if (this.falseCount > 0) {
          this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: ' Error Updating In ' + this.falseCount + ' Claims Custody', life: 7000 });
        }
      }
      else {
        $('.loader').hide();
        this.isDocumentFileUpload = false;
        this.isDocumentFileloaded = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
      }
    }, (error) => {
      $('.loader').hide();
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
      this.messageService.add({ key:'rejectHoldMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
      }
    });
  }

  sizeChanged(event) {
    jQuery('#dd_offline_claims_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.scheduleSetPage(1);
  }

  scheduleSetPage(page: number) {
    if (this.rejectHoldInputObj != null) {
      $('.loader').show();
      this.isRejectHoldScheduledObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.rejectHoldInputObj.pageNumber = this.pager.currentPage.toString();
      this.rejectHoldInputObj.pageSize = this.pager.pageSize.toString();

      this.claimsService.getRejectHoldBatchUploadedClaimsSearch(this.rejectHoldInputObj).subscribe((rejectHoldResponse) => {
        if (rejectHoldResponse && rejectHoldResponse.STATUS_OUT === "SUCCESS" && rejectHoldResponse.RESPONSE_OUT.count > 0) {
          this.tableCount = rejectHoldResponse.RESPONSE_OUT.count;
          this.rejectHoldClaimObj = rejectHoldResponse.RESPONSE_OUT.list;
          this.isRejectHoldClaimObj = true;
          this.isRejectHoldClaimButtonObj = true;
          this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);
        }
        else {
          this.tableCount = 0;
          this.rejectHoldClaimObj = null;
          this.isRejectHoldClaimObj = false;
          this.isRejectHoldClaimButtonObj = false;
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'rejectHoldMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Reject/Hold Scheduled Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
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
        this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Reject/Hold Scheduled Claims Data', life: 7000 });
        }
      });
    }
  }

  getHoldUnholdClaims(){
    $('.loader').show();
    this.isRejectHoldClaimObj = false;

    this.rejectHoldInputObj.pageNumber = '1';
    this.rejectHoldInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getRejectHoldBatchUploadedClaimsSearch(this.rejectHoldInputObj).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0){
        this.tableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.rejectHoldClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isRejectHoldClaimObj = true;
        this.isRejectHoldClaimButtonObj = true;
      }
      else{
        this.rejectHoldClaimObj = [];
        this.tableCount = 0;
        this.isRejectHoldClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'rejectHoldMessage', severity:'info', summary: 'Note', detail:'No Data Available for Reject/Hold Scheduled Claims', life: 7000});
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
      this.messageService.add({key:'rejectHoldMessage', severity:'error', summary: 'Error', detail:'Error Getting Reject/Hold Scheduled Claims Data', life: 7000});
      }
    });
  }

  validateScheduledFileUpload() {
    this.isDocumentFileUpload = false;
    $('.loader').show();

    if (this.rejectHoldFile != null && this.rejectHoldFile.size > 0) {

      let claimType = jQuery("#dd_reject_hold_claims_claim_type").dropdown("get value");

      this.claimsService.rejectHoldScheduledUpload(this.rejectHoldFile, claimType).subscribe((rejectHoldResponse) => {

        if (rejectHoldResponse != null && rejectHoldResponse != "" && rejectHoldResponse.STATUS_OUT == 'SUCCESS') {
          $('.loader').hide();
          this.messageService.add({ severity: 'success', life: 7000, key: 'rejectHoldMessage', summary: 'Success', detail: 'Data Uploaded Successfully' });
        }
        else {
          $('.loader').hide();
          this.messageService.add({ severity: 'info', life: 7000, key: 'rejectHoldMessage', summary: 'Note', detail: rejectHoldResponse.RESPONSE_OUT });
        }
        $('#schedulefileupload').val('');
        this.isDocumentFileloaded = false;
      }, (error) => {
        $('.loader').hide();
        this.isDocumentFileloaded = false;
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
        this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', life: 7000, summary: 'Error', detail: 'Error while uploading file' });
        }
      });
      $('#schedulefileupload').val('');
    }
  }

  exportClaimData() {
    let registrationType = jQuery('#dd_registration_type_selection').dropdown('get value');

    if (this.rejectHoldClaimObj != null && this.rejectHoldClaimObj.length > 0 && registrationType == 'reject_hold_option') {

      var JSONData = this.rejectHoldClaimObj;
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

          if (index == 'claim_ID' || index == 'comments' || index == 'chassis_NO' || index == 'dealerCode' || index == 'scheme_ID' || index == 'claim_AMT' || index == 'status' || index == 'remarks') {
            reqData.push(num);
            headings.push(index)

            if (index == 'claim_ID') {
              index = 'Claim ID';
            }

            if (index == 'comments') {
              index = 'TMLBSL Comment';
            }

            if (index == 'chassis_NO') {
              index = 'Chassis NO';
            }

            if (index == 'dealercode') {
              index = 'Dealer Code';
            }

            if (index == 'scheme_ID') {
              index = 'Scheme ID';
            }

            if (index == 'claim_AMT') {
              index = 'Claim Amount';
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

      var fileName = "Hold Reject Claim Details";
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    else {
      this.exportBatchClaimData();
    }
  }

  exportBatchClaimData() {

    let exportToExcelInputParams: HttpParams = new HttpParams();
    exportToExcelInputParams = exportToExcelInputParams.set('pageSize','0');
    exportToExcelInputParams = exportToExcelInputParams.set('pageNumber','0');
    if(jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value') != null && jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value') != ""){
      exportToExcelInputParams = exportToExcelInputParams.set('pTEMPLATE_TYPE',jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value'));
    }
    else{
      exportToExcelInputParams = exportToExcelInputParams.set('pTEMPLATE_TYPE','');
    }

    if(jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value') != null && jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value') != ""){
      exportToExcelInputParams = exportToExcelInputParams.set('pSTATUS_ID',jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value'));
    }
    else{
      exportToExcelInputParams = exportToExcelInputParams.set('pSTATUS_ID','');
    }

    if ($('#cal_scheduled_reject_hold_claims_start_date input').val() != null && $('#cal_scheduled_reject_hold_claims_start_date input').val() != "") {
      exportToExcelInputParams = exportToExcelInputParams.set('pFROM_DATE',this.datePipe.transform(($('cal_scheduled_reject_hold_claims_start_date input').val().toString()), 'dd-MMM-yyyy'));
    }
    else {
      exportToExcelInputParams = exportToExcelInputParams.set('pFROM_DATE','');
    }

    if ($('#cal_scheduled_reject_hold_claims_end_date input').val() != null && $('#cal_scheduled_reject_hold_claims_end_date input').val() != "") {
      exportToExcelInputParams = exportToExcelInputParams.set('pTO_DATE',this.datePipe.transform(($('cal_scheduled_reject_hold_claims_end_date input').val().toString()), 'dd-MMM-yyyy'));
    }
    else {
      exportToExcelInputParams = exportToExcelInputParams.set('pTO_DATE','');
    }
    
    this.claimsService.exportHoldUnholdRejectClaims(exportToExcelInputParams).subscribe((rejectHoldResponse) => {
      const blob = rejectHoldResponse;
      const url = window.URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = "Hold-Reject-Batch-Claim-Details.xls";
      link.click();

    }, (error) => {
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
      this.messageService.add({ key: 'rejectHoldMessage', severity: 'error', summary: 'Error', detail: 'Error Exporting Hold-Reject Claims Data', life: 7000 });
      }
    });  
  }

  clearData() {
    this.rejectHoldClaimObj = null;
    this.isRejectHoldClaimObj = false;
    this.isRejectHoldClaimButtonObj = false;
    this.isDocumentFileloaded = false;
    $('#schedulefileupload').val('');
    $('#fileupload').val('');
  }

  searchFilter(flag) {
    $('.loader').show();
    this.rejectHoldInputObj = new Object();

    if (jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value') != null && jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value') != "") {
      this.rejectHoldInputObj.pTEMPLATE_TYPE = jQuery('#dd_scheduled_reject_hold_claims_search_template_type').dropdown('get value');
    }
    else {
      this.rejectHoldInputObj.pTEMPLATE_TYPE = '';
    }

    if (jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value') != null && jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value') != "") {
      this.rejectHoldInputObj.pSTATUS_ID = jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('get value');
    }
    else {
      this.rejectHoldInputObj.pSTATUS_ID = ''
    }

    if ($('#cal_scheduled_reject_hold_claims_start_date input').val() != null && $('#cal_scheduled_reject_hold_claims_start_date input').val() != "") {
      this.date = this.datePipe.transform(new Date(jQuery('#cal_scheduled_reject_hold_claims_start_date input').val()), 'dd-MMM-yyyy');
      this.rejectHoldInputObj.pFROM_DATE = this.date;
    }
    else {
      this.rejectHoldInputObj.pFROM_DATE = '';
    }

    if ($('#cal_scheduled_reject_hold_claims_end_date input').val() != null && $('#cal_scheduled_reject_hold_claims_end_date input').val() != "") {
      this.date = this.datePipe.transform(new Date(jQuery('#cal_scheduled_reject_hold_claims_end_date input').val()), 'dd-MMM-yyyy');
      this.rejectHoldInputObj.pTO_DATE = this.date;
    }
    else {
      this.rejectHoldInputObj.pTO_DATE = '';
    }
    this.getHoldUnholdClaims();
  }

  clearFilter() {
    jQuery("#dd_scheduled_reject_hold_claims_search_template_type").dropdown('restore defaults');
    jQuery('#dd_scheduled_reject_hold_claims_search_status').dropdown('clear');
    jQuery("#cal_scheduled_reject_hold_claims_start_date").calendar("set date",);
    jQuery("#cal_scheduled_reject_hold_claims_end_date").calendar("set date",);
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
    jQuery('#model_hold_reject_claims_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.schemeViewUrl = "";

    setTimeout(() => {
      this.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView() {
    this.schemeViewUrl = "";
  }

  openIndividualClaimView(chassisNo, schemeId, claimId) {
    jQuery('#model_hold_reject_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
    this.sharedService.individualClaimViewUrl = "";

    setTimeout(() => {
      this.sharedService.individualClaimViewUrl = environment.CLAIMSANGULARURL + '/claimstabsview?chassisNo=' + chassisNo + '&schemeId=' + schemeId + '&claimId=' + claimId + '&messageKey=claimValidityExpiryMessage';
    }, 0);
  }

  closeIndividualClaimView() {
    this.sharedService.individualClaimViewUrl = "";
  }
}
