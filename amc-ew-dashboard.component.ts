import { Component, OnInit, Type } from '@angular/core';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Status } from '../models/status.model';
import { AMCEWClaimsDetail } from '../models/amcewclaims-detail.model';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';
import { environment } from 'src/environments/environment';
import { ClaimDealerTabsViewComponent } from '../claim-dealer-tabs-view/claim-dealer-tabs-view.component';
import { GroupClaimViewTabComponent } from '../group-claim-view-tab/group-claim-view-tab.component';
import { LOB } from '../models/lob.model';
import { PPL } from '../models/ppl.model';
import { PL } from '../models/pl.model';
import { BusinessUnit } from '../models/business-unit.model';
import { VC } from '../models/vc.model';

@Component({
  selector: 'app-amc-ew-dashboard',
  templateUrl: './amc-ew-dashboard.component.html',
  styleUrls: ['./amc-ew-dashboard.component.scss']
})
export class AmcEwDashboardComponent implements OnInit {
  isToggleSearchFilters: boolean = true;
  isIndividualClaim: boolean = true;
  amcAndEwClaimLoading: boolean = false;
  isAmcAndEwClaimObj: boolean = false;
  amcAndEwClaimInputObj: any = {};
  tableSize: number = 10;
  tableCount: number;
  amcAndEwClaimObj: Array<AMCEWClaimsDetail> = [];
  statusList: Array<Status> = [];
  pager: any = {};
  type: string;
  isGroupClaimView: boolean = false;
  individualClaimViewTabsLazyComp: Promise<Type<ClaimDealerTabsViewComponent>>;
  groupClaimViewTabsLazyComp: Promise<Type<GroupClaimViewTabComponent>>;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  selectedAmcEwClaims: any;
  isIndividualClaimView: boolean = false;
  role: string = "";
  position: string = "";
  lobList: Array<LOB> = [];
  pplList: Array<PPL> = [];
  plList: Array<PL> = [];
  vcList:Array<VC> = [];
  businessUnitList: Array<BusinessUnit> = [];
  businessUnit: string = "";

  constructor(private claimsService: ClaimsService,
              public sharedService: SharedService,
              private router: Router,
              private messageService: MessageService,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    $('.loader').hide();

    this.initializeComponent();
    this.dragAndScrollAmcAndEwTable();
    
    this.getStatus(jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value'));
    this.getBusinessUnit();

    this.route.queryParams.subscribe((params) => {
      if (params && params != null && params['position'] && params['position'] != null && params['position'] != "") {
        this.position = params['position'];
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params && params != null && params['role'] && params['role'] != null && params['role'] != "") {
        this.role = params['role'];
      }
    });
  }

  initializeComponent(): void {
    jQuery('#dd_amc_ew_dashboard_claim_type').dropdown();
    jQuery('#dd_amc_ew_dashboard_status').dropdown();
    jQuery('#dd_amc_ew_dashboard_claim_type_hardcoded').dropdown();
    jQuery('#dd_amc_ew_dashboard_claim_type').dropdown();
    jQuery('#dd_amc_ew_dashboard_status').dropdown();
    jQuery('#dd_amc_ew_dashboard_size').dropdown();
    jQuery('#dd_amc_ew_dashboard_lob').dropdown();
    jQuery('#dd_amc_ew_dashboard_ppl').dropdown();
    jQuery('#dd_amc_ew_dashboard_pl').dropdown();
    jQuery('#dd_amc_ew_dashboard_vc').dropdown();

    setTimeout(() => {
      jQuery('.coupled.modal').modal({ allowMultiple: true });
      jQuery('.accordion').accordion({ selector: { trigger: '.title' } });
      jQuery('.tabular.menu .item').tab({ history: false });
      jQuery('.menu .item').tab();
    }, 0);

    $('#dd_amc_ew_dashboard_claim_type').on('change', () => {
      this.amcAndEwClaimObj = [];
      this.isAmcAndEwClaimObj = false;
      this.type = jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value');
      this.getStatus(this.type);
    });

    $('#dd_amc_ew_dashboard_lob').on('change', () => {
      this.getPPL();
    });

    $('#dd_amc_ew_dashboard_ppl').on('change', () => {
      this.getPL();
    });

    $('#dd_amc_ew_dashboard_pl').on('change', () => {
      this.getVC();
    });
  }

  getBusinessUnit(){

    this.claimsService.getBusinessUnit().subscribe((amcEwclaimsDashboardResponse) => {
      if(amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != ""){
        for(let i = 0; i < amcEwclaimsDashboardResponse.length; i++){
          this.businessUnitList[i] = new BusinessUnit();
          this.businessUnitList[i].text = amcEwclaimsDashboardResponse[i].BU;
          this.businessUnitList[i].value = amcEwclaimsDashboardResponse[i].BU;
        }

        setTimeout(() => {
          jQuery('#dd_amc_ew_dashboard_business_unit').dropdown('set selected', this.businessUnitList[0].value);
          this.businessUnit = this.businessUnitList[0].value;
          this.getLOB();
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'amcEwErrorMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'amcEwErrorMessage', severity:'error', summary: 'Error', detail:'Error Getting Business Unit Data', life: 7000});
    });
  }

  getLOB() {
    let lobInputObj: any = {};
    lobInputObj.role = this.role;
    lobInputObj.position = this.position;
    lobInputObj.appId = 'RVME';
    lobInputObj.bu = jQuery('#dd_amc_ew_dashboard_business_unit').dropdown('get value').split(",");


    this.lobList = null;
    this.pplList = null;
    this.plList = null;

    jQuery('#dd_amc_ew_dashboard_lob').dropdown('clear');
    jQuery('#dd_amc_ew_dashboard_ppl').dropdown('clear');
    jQuery('#dd_amc_ew_dashboard_pl').dropdown('clear');

    if (lobInputObj != null && lobInputObj != "") {

      $('#dd_amc_ew_dashboard_lob').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_lob').parent().addClass('disabled');

      this.claimsService.getAmcLOB(lobInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != "") {
          this.lobList = amcEwclaimsDashboardResponse.RESPONSE_OUT.lobDetails;
          console.log(amcEwclaimsDashboardResponse)
          console.log(this.lobList)
        }
        else {
          this.lobList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for LOB', life: 7000 });
        }

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');
      }, (error) => {
        this.lobList = null;

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting LOB Data', life: 7000 });
        }
      });
    }
  }

  getPPL() {
    let pplInputObj: any = {};
    pplInputObj.role = this.role;
    pplInputObj.position = this.position;
    pplInputObj.appId = 'RVME';
    pplInputObj.lob = this.lobList.filter((lobItem) => jQuery('#dd_amc_ew_dashboard_lob').dropdown('get value').includes(lobItem.lobId)).map((item) => item.lob);

    this.pplList = null;
    this.plList = null;
    this.vcList = null;

    jQuery('#dd_amc_ew_dashboard_ppl').dropdown('clear');
    jQuery('#dd_amc_ew_dashboard_pl').dropdown('clear');
    jQuery('#dd_amc_ew_dashboard_vc').dropdown('clear');

    if (pplInputObj != null && pplInputObj != "") {

      $('#dd_amc_ew_dashboard_lob').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_lob').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_ppl').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_ppl').parent().addClass('disabled');

      this.claimsService.getAmcPPL(pplInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != "") {
          this.pplList = amcEwclaimsDashboardResponse.RESPONSE_OUT.pplDetails;
        }
        else {
          this.pplList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for PPL', life: 7000 });
        }

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');
      }, (error) => {
        this.pplList = null;

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting PPL Data', life: 7000 });
        }
      });
    }
  }

  getPL() {
    let plInputObj: any = {};
    plInputObj.role = this.role;
    plInputObj.position = this.position;
    plInputObj.appId = 'RVME';
    plInputObj.ppl = this.pplList.filter((pplItem) => jQuery('#dd_amc_ew_dashboard_ppl').dropdown('get value').includes(pplItem.pplId)).map((item) => item.ppl);

    this.plList = null;
    this.vcList = null
    jQuery('#dd_amc_ew_dashboard_pl').dropdown('clear');

    if (plInputObj != null && plInputObj != "") {

      $('#dd_amc_ew_dashboard_lob').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_lob').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_ppl').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_ppl').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_pl').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_pl').parent().addClass('disabled');

      this.claimsService.getAmcPL(plInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != "" ) {
          this.plList = amcEwclaimsDashboardResponse.RESPONSE_OUT.plDetails;
        }
        else {
          this.plList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for PL', life: 7000 });
        }

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_pl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_pl').parent().removeClass('disabled');
      }, (error) => {
        this.plList = null;

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_pl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_pl').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting PL Data', life: 7000 });
        }
      });
    }
  }

  getVC() {
    let vcInputObj: any = {};
    vcInputObj.role = this.role;
    vcInputObj.position = this.position;
    vcInputObj.appId = 'RVME';
    vcInputObj.pl = this.plList.filter((plItem) => jQuery('#dd_amc_ew_dashboard_pl').dropdown('get value').includes(plItem.plId)).map((item) => item.pl);

    this.vcList = null;

    jQuery('#dd_amc_ew_dashboard_vc').dropdown('clear');

    if(vcInputObj != null && vcInputObj != ""){
      $('#dd_amc_ew_dashboard_lob').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_lob').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_ppl').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_ppl').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_pl').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_pl').parent().addClass('disabled');

      $('#dd_amc_ew_dashboard_vc').parent().addClass('loading');
      $('#dd_amc_ew_dashboard_vc').parent().addClass('disabled');

      this.claimsService.getAmcVC(vcInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        if(amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != ""){

          this.vcList = amcEwclaimsDashboardResponse.RESPONSE_OUT.vcDetails;
        }
        else{
          this.vcList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'amcEwErrorMessage', severity:'info', summary: 'Note', detail:'No Data Available for VC', life: 7000});
        }

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_pl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_pl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_vc').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_vc').parent().removeClass('disabled');
      }, (error) => {
        this.plList = null;

        $('#dd_amc_ew_dashboard_lob').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_lob').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_ppl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_pl').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_pl').parent().removeClass('disabled');

        $('#dd_amc_ew_dashboard_vc').parent().removeClass('loading');
        $('#dd_amc_ew_dashboard_vc').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'amcEwErrorMessage', severity:'error', summary: 'Error', detail: 'Error Getting VC Data', life: 7000});
        }
      });
    }
  }

  amcAndEwClaimSizeChanged(event) {
    jQuery('#dd_amc_ew_dashboard_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setAmcAndEwClaimPage(1);
  }

  setAmcAndEwClaimPage(page: number) {
    if (this.amcAndEwClaimInputObj != null) {
      $('.loader').show();
      this.isAmcAndEwClaimObj = false;
      this.selectedAmcEwClaims = [];

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.amcAndEwClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.amcAndEwClaimInputObj.pageSize= this.pager.pageSize.toString();

      this.claimsService.getAmcEwClaimsDashboard(this.amcAndEwClaimInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse.STATUS_OUT === "SUCCESS" && amcEwclaimsDashboardResponse.RESPONSE_OUT.count > 0) {
          this.tableCount = amcEwclaimsDashboardResponse.RESPONSE_OUT.count;
          this.amcAndEwClaimObj = amcEwclaimsDashboardResponse.RESPONSE_OUT.list;
          this.isAmcAndEwClaimObj = true;
        }
        else {
          this.amcAndEwClaimObj = [];
          this.tableCount = 0;
          this.isAmcAndEwClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for AMC & EW Claims', life: 7000 });
        }

        this.pager.currentPage = 1;
        this.pager.pageSize = this.tableSize;

        const page = 1;

        this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting AMC & EW Claims Data', life: 7000 });
        }
      });
    }
  }

  searchFilter(flag) {
    this.selectedAmcEwClaims = [];
    $('.loader').show();
    this.isAmcAndEwClaimObj = false;

    this.amcAndEwClaimInputObj = new Object();

    if ($('#txt_amc_ew_dashboard_claim_id').val().toString().trim() != null && $('#txt_amc_ew_dashboard_claim_id').val().toString().trim() != "") {
      this.amcAndEwClaimInputObj.pCLAIM_ID = $('#txt_amc_ew_dashboard_claim_id').val().toString().trim().split(',');
    }
    else {
      this.amcAndEwClaimInputObj.pCLAIM_ID = [];
    }

    if (jQuery('#dd_amc_ew_dashboard_lob').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_lob').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pLOB = this.lobList.filter((lobItem) => jQuery('#dd_amc_ew_dashboard_lob').dropdown('get value').includes(lobItem.lobId)).map((item) => item.lob);
    }
    else {
      this.amcAndEwClaimInputObj.pLOB = [];
    }

    if (jQuery('#dd_amc_ew_dashboard_ppl').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_ppl').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pPPL = this.pplList.filter((pplItem) => jQuery('#dd_amc_ew_dashboard_ppl').dropdown('get value').includes(pplItem.pplId)).map((item) => item.ppl);
    }
    else {
      this.amcAndEwClaimInputObj.pPPL = [];
    }

    if (jQuery('#dd_amc_ew_dashboard_pl').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_pl').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pPL = this.plList.filter((plItem) => jQuery('#dd_amc_ew_dashboard_pl').dropdown('get value').includes(plItem.plId)).map((item) => item.pl);

    }
    else {
      this.amcAndEwClaimInputObj.pPL = [];
    }

    if (jQuery('#dd_amc_ew_dashboard_vc').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_vc').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pVC =  jQuery('#dd_amc_ew_dashboard_vc').dropdown('get value');
    }
    else {
      this.amcAndEwClaimInputObj.pVC = [];
    }

    if ($('#txt_amc_ew_dashboard_chassis_no').val().toString().trim() != null && $('#txt_amc_ew_dashboard_chassis_no').val().toString().trim() != "") {
      this.amcAndEwClaimInputObj.pCHASSIS_NO = $('#txt_amc_ew_dashboard_chassis_no').val().toString().trim().split(',');
    }
    else {
      this.amcAndEwClaimInputObj.pCHASSIS_NO = [];
    }

    if (jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pCLAIM_TYPE = jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value');
    }
    else {
      this.amcAndEwClaimInputObj.pCLAIM_TYPE = '';
    }

    if (jQuery('#dd_amc_ew_dashboard_status').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_status').dropdown('get value') != "") {
      this.amcAndEwClaimInputObj.pSTATUS_ID = jQuery('#dd_amc_ew_dashboard_status').dropdown('get value');
    }
    else {
      this.amcAndEwClaimInputObj.pSTATUS_ID = '';
    }

    if (!flag && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != "" && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') == "AMC_TRANS") {
      this.getAmcEwReportClaims();
    }
    else if (!flag && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != null && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') != "" && jQuery('#dd_amc_ew_dashboard_claim_type').dropdown('get value') == "EW_TRANS") {
      this.getAmcEwReportClaims();
    }
    else {
      this.getAmcEwReportClaims();
    }
  }

  getAmcEwReportClaims() {
    $('.loader').show();
    this.amcAndEwClaimInputObj.pageNumber = '1';
    this.amcAndEwClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getAmcEwClaimsDashboard(this.amcAndEwClaimInputObj).subscribe((amcEwclaimsDashboardResponse) => {
      if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse.STATUS_OUT === "SUCCESS" && amcEwclaimsDashboardResponse.RESPONSE_OUT.count > 0) {
        this.tableCount = amcEwclaimsDashboardResponse.RESPONSE_OUT.count;
        this.amcAndEwClaimObj = amcEwclaimsDashboardResponse.RESPONSE_OUT.list;
        this.isAmcAndEwClaimObj = true;
      }
      else {
        this.amcAndEwClaimObj = [];
        this.tableCount = 0;
        this.isAmcAndEwClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for AMC & EW Claims', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting AMC & EW Claims Data', life: 7000 });
      }
    });
  }

  getStatus(type) {
    jQuery('#dd_amc_ew_dashboard_status').parent().addClass('loading');

    this.claimsService.getAMCAmdEWStatus(type).subscribe((amcEwclaimsDashboardResponse) => {
      if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != "" && amcEwclaimsDashboardResponse.STATUS_OUT === "SUCCESS") {
        this.statusList = amcEwclaimsDashboardResponse.RESPONSE_OUT;
        this.searchFilter(true);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Status', life: 7000 });
      }

      jQuery('#dd_amc_ew_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_amc_ew_dashboard_status').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_amc_ew_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_amc_ew_dashboard_status').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Status Data', life: 7000 });
      }
    });
  }

  clearFilter(flag) {
    $('#txt_amc_ew_dashboard_claim_id').val('');
    $('#txt_amc_ew_dashboard_chassis_no').val('');
    jQuery('#dd_amc_ew_dashboard_lob').dropdown('restore defaults');
    jQuery('#dd_amc_ew_dashboard_lob').dropdown('restore defaults');
    jQuery('#dd_amc_ew_dashboard_pl').dropdown('restore defaults');
    jQuery('#dd_amc_ew_dashboard_vc').dropdown('restore defaults');
  }

  getSelectedClaimId() {
    let claim_Id: Array<string> = [];

    claim_Id = this.selectedAmcEwClaims.map((item) => item.claimId);

    return claim_Id;
  }

  exportAmcEwClaims() {
    if (this.amcAndEwClaimInputObj != null) {
      $('.loader').show();
      let amcAndEwClaimInputObj = this.amcAndEwClaimInputObj;
      amcAndEwClaimInputObj.pCLAIM_ID = this.getSelectedClaimId();
      amcAndEwClaimInputObj.pageSize = '0';
      amcAndEwClaimInputObj.pageNumber = '0';

      this.claimsService.exportAmcEwClaims(amcAndEwClaimInputObj).subscribe((amcEwclaimsDashboardResponse) => {
        const blob = amcEwclaimsDashboardResponse;
        const url = window.URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = "AMC-EW-Claim-Details.xlsx";
        link.click();
        $('.loader').hide();
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        $('.loader').hide();
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Exporting AMC EW Claims Data', life: 7000 });
        }
      });
    }
  }

  openIndividualClaimView(chassisNo, schemeId, status, claimId,businessUnit) {
    this.isIndividualClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeClaimId(claimId);
    this.sharedService.changeSchemeId(schemeId);
    this.sharedService.changeBusinessUnit(businessUnit);
    
    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, this.position, claimId);
    }, 0);
  }

  getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId) {
    $('.loader').show();
    
    this.claimsService.getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId).subscribe((amcEwclaimsDashboardResponse) => {
      if (amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse.STATUS_OUT === "SUCCESS" && amcEwclaimsDashboardResponse.RESPONSE_OUT != null && amcEwclaimsDashboardResponse.RESPONSE_OUT != "") {
        this.sharedService.individualClaimsPreSelectedData = amcEwclaimsDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, true);
      }
      else {
        $('.loader').hide();
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claim Details By Chassis', life: 7000 });
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Claim Details By Chassis', life: 7000 });
      }
    });
  }

  getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, isIndividualClaim){
    this.claimsService.getClaimLimit(chassisNo, schemeId).subscribe((amcEwclaimsDashboardResponse) => {
      if(amcEwclaimsDashboardResponse && amcEwclaimsDashboardResponse != null && amcEwclaimsDashboardResponse != ""){
        if(isIndividualClaim){
          this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = amcEwclaimsDashboardResponse.CLAIM_LIMIT;
        }
        setTimeout(() => {
          $('.loader').hide();
          if(isIndividualClaim){
            if(this.isIndividualClaimView){
              jQuery('#model_amcew_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  
              this.individualClaimViewTabsLazyComp = import('../claim-dealer-tabs-view/claim-dealer-tabs-view.component').then(({ClaimDealerTabsViewComponent}) => ClaimDealerTabsViewComponent);
            }
          }
        }, 0);
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'amcEwErrorMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Limit', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcEwErrorMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'amcEwErrorMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Limit', life: 7000});
      }
    });
  }

  closeIndividualClaimView() {
    jQuery('#model_amcew_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
    this.sharedService.changeClaimId("");
    this.sharedService.claimObjById = {};
    this.individualClaimViewTabsLazyComp = null;
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
    jQuery('#model_amcew_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.schemeViewUrl = "";

    setTimeout(() => {
      this.sharedService.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView() {
    this.sharedService.schemeViewUrl = "";
  }

  toggleSearchFilters() {
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }

  dragAndScrollAmcAndEwTable() {
    const slider = document.querySelector<HTMLElement>('#amcAndEwClaimTable');
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

}

