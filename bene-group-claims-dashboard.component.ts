
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import * as $ from "jquery";
declare var jQuery: any

import { MessageService } from 'primeng/api';
import { BeneGroupClaim, GroupClaimDetail } from '../models/bene-group-claim.model';
import { BusinessUnit } from '../models/business-unit.model';
import { GeoMapping } from '../models/geo-mapping.model';
import { Position } from '../models/position.model';
import { Role } from '../models/role.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';


@Component({
  selector: 'app-bene-group-claims-dashboard',
  templateUrl: './bene-group-claims-dashboard.component.html',
  styleUrls: ['./bene-group-claims-dashboard.component.scss']
})
export class BeneGroupClaimsDashboardComponent implements OnInit {

  isToggleSearchFilters: boolean=false;
  beneGroupClaimLoading: boolean=false;
  isBeneGroupClaimObj: boolean=false;
  groupClaimInputObj: any={};
  show: boolean;
  buttonName: string;
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  actionList: any;
  submitViewForm: any;
  beneClaimDetailsObj: any;
  selectedGroupClaims : any;
  SchemeType: string;
  benegroupClaimInputParams: HttpParams;
  position: string = "";
  groupClaimObj :Array<BeneGroupClaim> = [];
  roleType: string = "";
  isDSADMIN: boolean = false;
  roleList: Array<Role> = [];
  positionList: Array<Position> = [];
  geoMappingList: Array<GeoMapping> = [];
  role: string = "";
  G_CLAIM_ID: any ;
  claimId :any;
  businessUnit: string;
  businessUnitList: Array<BusinessUnit> = [];
  date: string;

  constructor(private messageService:MessageService,
              private sharedService:SharedService,
              private datePipe: DatePipe,
              private claimsService:ClaimsService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollBeneGroupTable();
    this.getRole();
  }

  initializeComponent(): void {

    jQuery('#dd_dashboard_role').dropdown();
    jQuery('#dd_dashboard_position').dropdown();
    jQuery('#dd_dashboard_business_unit').dropdown();
    jQuery('#dd_dashboard_claim_amount_type').dropdown();
    jQuery('#dd_dashboard_bene_individual_size').dropdown();
    jQuery('#dd_group_dashboard_date_type').dropdown();

    jQuery('#range_claim_amount').range({
      min: 0,
      max: 500000,
      start: 0,
      step: 1,
      onChange: function (value) {
        $('#span_claim_amount').html(value);
      }
    });

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;

    jQuery("#cal_dashboard_start_date").calendar({
      type: "date",
      formatter: {
        date: function(date, settings) {
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
        if(date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_dashboard_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_dashboard_end_date").val().toString() == null))){
          jQuery("#cal_dashboard_end_date").calendar("set date", date);
        }
        else if(isEndDate){
          isEndDate = false;
        }

        jQuery("#txt_dashboard_start_date").calendar("set date", text);
      },
      endCalendar: jQuery("#cal_dashboard_end_date")
    }).calendar("set date", new Date());

    jQuery("#cal_dashboard_end_date").calendar({
      type: "date",
      formatter: {
        date: function(date, settings) {
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
        if(date != "" && date != null && date != undefined && ($("#txt_dashboard_start_date").val().toString() == "" || $("#txt_dashboard_end_date").val().toString() == null)){
          isEndDate = true;
          jQuery("#cal_dashboard_start_date").calendar("set date", date);
        }

        jQuery("#txt_dashboard_end_date").calendar("set date", text);
      },
      startCalendar: jQuery("#cal_dashboard_start_date")
    }).calendar("set date", new Date());

    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);
  }

  getRole() {
    $('#dd_dashboard_role').parent().addClass('loading');
    $('#dd_dashboard_role').parent().addClass('disabled');

    this.claimsService.getRole().subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
        this.roleList = claimsDashboardResponse;

        setTimeout(() => {
          jQuery('#dd_dashboard_role').dropdown('set selected', this.roleList[0].ROLE_ID);

          this.role = this.roleList[0].ROLE_ID;

          this.getPosition(this.role);
        }, 0);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Role', life: 7000 });
      }
      $('#dd_dashboard_role').parent().removeClass('loading');
      $('#dd_dashboard_role').parent().removeClass('disabled');

    }, (error) => {
      $('#dd_dashboard_role').parent().removeClass('loading');
      $('#dd_dashboard_role').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Role Data', life: 7000 });
    });
  }

  getPosition(role) {
      $('#dd_dashboard_role').parent().addClass('loading');
      $('#dd_dashboard_role').parent().addClass('disabled');

      this.claimsService.getPosition(role).subscribe((claimsDashboardResponse) => {
        if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
          this.positionList = claimsDashboardResponse;
  
          setTimeout(() => {
            jQuery('#dd_dashboard_position').dropdown('set selected', this.positionList[0].position);
  
            this.position = this.positionList[0].position;

            this.getBusinessUnit(this.position);
          }, 0);
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Position', life: 7000 });
        }
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Position Data', life: 7000 });
      });

  }

  getBusinessUnit(position) {
      $('#dd_dashboard_business_unit').parent().addClass('loading');
      $('#dd_dashboard_business_unit').parent().addClass('disabled');

      this.claimsService.getGeoMapping(position).subscribe((claimsDashboardResponse) => {
        if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
          this.geoMappingList = claimsDashboardResponse;
  
          for (let i = 0; i < this.geoMappingList.length; i++) {
            this.businessUnitList[i] = new BusinessUnit();
            this.businessUnitList[i].text = this.geoMappingList[i].BU;
            this.businessUnitList[i].value = this.geoMappingList[i].BU;
          }
  
          setTimeout(() => {
            jQuery('#dd_dashboard_business_unit').dropdown('set selected', this.businessUnitList[0].value);
  
            this.sharedService.changeBusinessUnit(this.businessUnitList[0].value);
  
            this.businessUnit = this.businessUnitList[0].value;
  
            this.searchFilter(true);
          }, 0);
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Business Unit', life: 7000 });
        }
        $('#dd_dashboard_business_unit').parent().removeClass('loading');
        $('#dd_dashboard_business_unit').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dashboard_business_unit').parent().removeClass('loading');
        $('#dd_dashboard_business_unit').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Business Unit Data', life: 7000 });
      });
    }

  searchFilter(flag){
    this.selectedGroupClaims = [];

    this.groupClaimInputObj = new Object();

    if($('#txt_dashboard_dealer_code').val().toString().trim() != null && $('#txt_dashboard_dealer_code').val().toString().trim() != ""){
      this.groupClaimInputObj.pDEALER_CODE = $('#txt_dashboard_dealer_code').val().toString().trim();
    }
    else{
      this.groupClaimInputObj.pDEALER_CODE = '';
    }

    if(jQuery('#dd_dashboard_business_unit').dropdown('get value') != null && jQuery('#dd_dashboard_business_unit').dropdown('get value') != "") {
      this.groupClaimInputObj.pBU_ID = jQuery('#dd_dashboard_business_unit').dropdown('get value');
    }
    else{
      this.groupClaimInputObj.pBU_ID = '';
    }

    if(jQuery('#dd_dashboard_role').dropdown('get value') != null && jQuery('#dd_dashboard_role').dropdown('get value') != "") {
      this.groupClaimInputObj.pROLE = jQuery('#dd_dashboard_role').dropdown('get value');
    }
    else{
      this.groupClaimInputObj.pROLE = '';
    }

    if(jQuery('#dd_dashboard_position').dropdown('get value') != null && jQuery('#dd_dashboard_position').dropdown('get value') != "") {
      this.groupClaimInputObj.pPOSITION = jQuery('#dd_dashboard_position').dropdown('get value');
    }
    else{
      this.groupClaimInputObj.pPOSITION = '';
    }
    if(jQuery('#dd_group_dashboard_date_type').dropdown('get value') != null && jQuery('#dd_group_dashboard_date_type').dropdown('get value') != "" && jQuery('#dd_group_dashboard_date_type').dropdown('get value') != "NA"){
      this.groupClaimInputObj.pDATE_TYPE = jQuery('#dd_group_dashboard_date_type').dropdown('get value');

      this.groupClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_start_date').val()),'dd-MMM-yyyy');
      this.groupClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_end_date').val()),'dd-MMM-yyyy');
    }
    else{
      this.groupClaimInputObj.pDATE_TYPE = '';

      this.groupClaimInputObj.pFROM_DATE = '';
      this.groupClaimInputObj.pTO_DATE = '';
    }

    this.groupClaimInputObj.pCLAIM_ID =[];
    this.groupClaimInputObj.pCHASSIS_NO =[];
    this.groupClaimInputObj.pBLOCK_FLAG = '';
    this.groupClaimInputObj.pSTOCK_TRANSFER = '';
    this.groupClaimInputObj.pMONTH_YEAR = '';
    this.groupClaimInputObj.pSCHEME_NAME = '';
    this.groupClaimInputObj.pST_DESC = '';
    this.groupClaimInputObj.pROLE_DESCRIPTION = '';
    this.groupClaimInputObj.pSTM_ID = [];
    this.groupClaimInputObj.pSCHEME_ID = [];
    this.groupClaimInputObj.pAMT_OPT = '';
    this.groupClaimInputObj.pAMT = '';
    this.groupClaimInputObj.pNFA_NO = [];
    this.groupClaimInputObj.pCLAIM_TYPE = '';
    this.groupClaimInputObj.pCUST_ROLE = '';
    this.groupClaimInputObj.pSTATUS_ID = 'PPRC';

    if(!flag){
      this.getIndividualClaims();
    }
    else{
      this.getIndividualClaims();
    }
  } 

  getIndividualClaims(){
    $('.loader').show();
    this.isBeneGroupClaimObj = false;

    document.getElementById('beneGroupClaimTable').scrollLeft = 0;

    this.groupClaimInputObj.pageNumber = '1';
    this.groupClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getIndividualClaims(this.groupClaimInputObj).subscribe((beneGroupClaimDashboardResponse) => {
      if(beneGroupClaimDashboardResponse && beneGroupClaimDashboardResponse.STATUS_OUT === "SUCCESS" && beneGroupClaimDashboardResponse.RESPONSE_OUT.count > 0){
        this.tableCount = beneGroupClaimDashboardResponse.RESPONSE_OUT.count;
        this.groupClaimObj = beneGroupClaimDashboardResponse.RESPONSE_OUT.list;
        this.isBeneGroupClaimObj = true;
 
        setTimeout(() => {
          jQuery('#dd_individual_claim_confirmation').dropdown();
          $('#dd_individual_claim_confirmation').parent().css({width: '150px', minWidth: '150px'});
        }, 0);
      }
      else{
        this.groupClaimObj = [];
        this.tableCount = 0;
        this.isBeneGroupClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
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
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
      }
    });
  }

  beneGroupClaimSizeChanged(event){
    jQuery('#dd_dealer_dashboard_individual_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setBeneGroupClaimPage(1);
  }

  setBeneGroupClaimPage(page: number){
    if(this.groupClaimInputObj != null){
      $('.loader').show();
      this.isBeneGroupClaimObj = false;
      this.selectedGroupClaims = [];

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.groupClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.groupClaimInputObj.pageSize = this.pager.pageSize.toString();

      this.claimsService.getIndividualClaims(this.groupClaimInputObj).subscribe((beneGroupClaimDashboardResponse) => {
        if(beneGroupClaimDashboardResponse && beneGroupClaimDashboardResponse.STATUS_OUT === "SUCCESS"){
          this.groupClaimObj = beneGroupClaimDashboardResponse.RESPONSE_OUT.list;
          this.isBeneGroupClaimObj = true;
        }
        else{
          this.tableCount = 0;
          this.groupClaimObj = null;
          this.isBeneGroupClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
        }
      });
    }
  }

  postGroupClaim(){
    $('.loader').show();

    let groupClaimsInputObj :BeneGroupClaim = new BeneGroupClaim(); 
    if(this.isBeneGroupClaimObj){

    for(let i=0;i<this.groupClaimObj.length;i++){
      groupClaimsInputObj.IndividualClaim[i] = new GroupClaimDetail();
      groupClaimsInputObj.IndividualClaim[i].bene_Name =  this.groupClaimObj[i].cust_NAME;
      groupClaimsInputObj.IndividualClaim[i].dealer_CODE =  this.groupClaimObj[i].dealercode;
    }

    this.claimsService.postBeneGroupClaims(groupClaimsInputObj).subscribe((beneGroupClaimDashboardResponse) => {
    if(beneGroupClaimDashboardResponse.RESPONSE_OUT != null && beneGroupClaimDashboardResponse.RESPONSE_OUT != "" &&beneGroupClaimDashboardResponse.STATUS_OUT == "SUCCESS"){
      this.G_CLAIM_ID=beneGroupClaimDashboardResponse.RESPONSE_OUT[0]?.RESPONSE_OUT_GROUP?.G_CLAIM_ID;
      this.claimId = beneGroupClaimDashboardResponse.RESPONSE_OUT[1]?.RESPONSE_OUT_INDIVIDUAL[0]?.RESPONSE_OUT;
      this.getIndividualClaims();
      this.isBeneGroupClaimObj = true;

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'success', summary: 'Success' , sticky:true ,detail:"Group Claim Created Successfully", life: 7000});
      }
      else if(beneGroupClaimDashboardResponse.STATUS_OUT == "ERROR"){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'error', summary: 'Error', detail:beneGroupClaimDashboardResponse.RESPONSE_OUT, life: 7000});
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'error', summary: 'Error', detail: 'Error in Creating Group Claim', life: 7000});
      }
      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Creating Group Claim', life: 7000});
      }
    });
  
    }
    else{
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'beneGroupClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Grouping', life: 7000});
    }
  }

  clearFilter(flag){
    $('#txt_dashboard_dealer_code').val('');
    jQuery("#cal_dashboard_start_date").calendar("set date", new Date());
    jQuery("#cal_dashboard_end_date").calendar("set date", new Date());
    jQuery("#dd_group_dashboard_date_type").dropdown('restore defaults')
    this.searchFilter(true);
  }

  toggleSearchFilters(){
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }

  dragAndScrollBeneGroupTable(){
    const slider = document.querySelector<HTMLElement>('#beneGroupClaimTable');
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
  getAction(role: string, schemeTypeValue: string, status: string) {
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((GroupclaimviewTabsResponse) => {
      if (GroupclaimviewTabsResponse && GroupclaimviewTabsResponse.STATUS_OUT == "SUCCESS" && GroupclaimviewTabsResponse.RESPONSE_OUT != null && GroupclaimviewTabsResponse.RESPONSE_OUT.length > 0) {
        this.actionList = GroupclaimviewTabsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else {
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'beneClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Action', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'beneGroupClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Action Data', life: 7000 });
      }
    });
  }

}
