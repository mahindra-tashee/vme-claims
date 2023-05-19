import { DatePipe } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { KeycloakService } from '../core/auth/keycloak.service';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { Scheme, SchemeType } from '../models/scheme.model';
import { Role } from '../models/role.model';
import { Position } from '../models/position.model';
import { GeoMapping } from '../models/geo-mapping.model';
import { BusinessUnit } from '../models/business-unit.model';
import { ClaimType } from '../models/claim-type.model';
import { CustodyRole } from '../models/custody-role.model';
import { Status } from '../models/status.model';
import { IndividualClaim } from '../models/individual-claim.model';
import { GroupClaim } from '../models/group-claim.model';
import { HttpParams } from '@angular/common/http';
import { ActiveScheme } from '../models/active-scheme.model';
import { PPL } from '../models/ppl.model';
import { ClaimTabsViewComponent } from '../claim-tabs-view/claim-tabs-view.component';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';
import { environment } from 'src/environments/environment';
import { BulkClaim } from '../models/bulk-claim.model';
import { GroupClaimTabComponent } from '../group-claim-tab/group-claim-tab.component';
import { GroupClaimViewTabComponent } from '../group-claim-view-tab/group-claim-view-tab.component';
import { ClaimDealerTabsComponent } from '../claim-dealer-tabs/claim-dealer-tabs.component';
import { ClaimDealerTabsViewComponent } from '../claim-dealer-tabs-view/claim-dealer-tabs-view.component';

@Component({
  selector: 'app-claims-dealer-dashboard',
  templateUrl: './claims-dealer-dashboard.component.html',
  styleUrls: ['./claims-dealer-dashboard.component.scss']
})
export class ClaimsDealerDashboardComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  gpager: any = {};
  gtableCount: number;
  gtableSize: number = 10;
  isDSADMIN: boolean = false;
  isToggleSearchFilters: boolean = true;
  roleList: Array<Role> = [];
  positionList: Array<Position> = [];
  geoMappingList: Array<GeoMapping> = [];
  businessUnitList: Array<BusinessUnit> = [];
  claimTypeHardCodeList: Array<any> = [];
  schemeTypeList: Array<SchemeType> = [];
  schemeList: Array<Scheme> = [];
  activeSchemeList: Array<ActiveScheme> = [];
  activeSchemeGroupList: Array<ActiveScheme> = [];
  pplList: Array<any> = [];
  statusGroupList: Array<Status> = [];
  claimTypeList: Array<ClaimType> = [];
  custodyRoleList: Array<CustodyRole> = [];
  assignmentTypeList: Array<any> = [];
  statusList: Array<Status> = [];
  roleType: string = "";
  role: string = "";
  position: string = "";
  businessUnit: string = "";
  isIndividualClaim: boolean = true;
  individualClaimInputObj: any = {};
  isIndividualClaimObj: boolean = false;
  individualClaimLoading: boolean = false;
  individualClaimObj: Array<IndividualClaim> = [];
  groupClaimInputObj: any = {};
  isGroupClaimObj: boolean = false;
  groupClaimLoading: boolean = false;
  groupClaimObj: Array<GroupClaim> = [];
  isBulkClaimObj: boolean = false;
  bulkClaimLoading: boolean = false;
  bulkClaimObj: Array<BulkClaim> = [];
  dealerDetails: any;
  isBulkClaimFile: boolean = false;
  bulkClaimFile: File = null;
  selectedIndividualClaims: any;
  selectedGroupClaims: any;
  individualClaimsModalForm: FormGroup;
  groupClaimsModalForm: FormGroup;
  individualClaimTabsLazyComp: Promise<Type<ClaimDealerTabsComponent>>;
  individualClaimViewTabsLazyComp: Promise<Type<ClaimDealerTabsViewComponent>>;
  groupClaimTabsLazyComp: Promise<Type<GroupClaimTabComponent>>;
  groupClaimViewTabsLazyComp: Promise<Type<GroupClaimViewTabComponent>>;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  individualClaimHeader: string = "";
  groupClaimHeader: string = "";
  workflowCode: string = "";
  isIndividualClaimView: boolean = false;
  isGroupClaimView: boolean = false;
  initialValidationObj: Array<string> = [];
  initialValidationLoading: boolean = false;

  constructor(private claimsService: ClaimsService, 
              public sharedService: SharedService,
              private router: Router, 
              private messageService: MessageService, 
              private formBuilder: FormBuilder, 
              private datePipe: DatePipe,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    $('.loader').hide();

    var kcArray = KeycloakService.auth.authz.tokenParsed.realm_access;
    var rolesArray: string[] = kcArray.roles;

    if(rolesArray.includes('DSADMIN')){
      this.roleType = "DSADMIN";
      this.isDSADMIN = true;
      this.sharedService.userRole = "DLR";
    }
    else {
      this.roleType = "";
      this.isDSADMIN = false;
      this.sharedService.userRole = "";
    }

    this.activatedRoute.queryParams.subscribe(params => {
      this.position = params['position'];
      this.sharedService.position = this.position;
      this.role = params['role'];
    });

    this.initializeComponent();
    this.dragAndScrollIndividualTable();
    this.dragAndScrollGroupTable();
    this.dragAndScrollBulkTable();

    if(this.isDSADMIN){
      this.getDealerDetails();
    }
    else{
      this.getAssignmentType();
    }

    this.getBusinessUnit();
    this.getClaimTypeHardCoded();
    this.getClaimType();
    this.getStatus();

    this.sharedService.getModifiedAction().subscribe((response) => {
      if(response && response != null && response != "" && (response != "DRFT" && response != "SVDT")){
        this.closeIndividualClaim();
        this.closeIndividualClaimView();
        this.closeGroupClaim();
        this.closeGroupClaimView();
      }
    });
  }

  initializeComponent(): void {
    jQuery('#dd_dealer_dashboard_business_unit').dropdown();
    jQuery('#dd_dealer_dashboard_scheme_type').dropdown();
    jQuery('#dd_dealer_dashboard_scheme').dropdown();
    jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown();
    jQuery('#dd_dealer_dashboard_claim_type').dropdown();
    jQuery('#dd_dealer_dashboard_custody_role').dropdown();
    jQuery('#dd_dealer_dashboard_assignment_type').dropdown();
    jQuery('#dd_dealer_dashboard_status').dropdown();
    jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown();
    jQuery('#dd_dealer_dashboard_date_type').dropdown();
    jQuery('#dd_dealer_dashboard_stock_transfer').dropdown();
    jQuery('#dd_dealer_dashboard_individual_size').dropdown();
    jQuery('#dd_dealer_dashboard_group_size').dropdown();
    jQuery('#dd_dealer_individual_claim_modal_scheme').dropdown();
    jQuery('#dd_dealer_group_claim_modal_scheme').dropdown();
    jQuery('#dd_dealer_group_claim_modal_ppl').dropdown();
    jQuery('#dd_dealer_group_claim_modal_status').dropdown();
    
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);

    $('#dd_dealer_dashboard_scheme_type').on('change', () => {
      this.getScheme();
      this.getWorkflowCode();
    });

    $('#dd_dealer_dashboard_claim_type_hardcoded').on('change', () => {
      if(jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') == "IND"){
        this.isIndividualClaim = true;
      }
      else{
        this.isIndividualClaim = false;
      }
    });

    $('#dd_dealer_group_claim_modal_scheme').on('change', () => {
      this.getPPL();
    });

    jQuery("#cal_dealer_individual_claims_month_year").calendar({
      type: "month",
      popupOptions: {
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      },
      onChange: (date, text, mode) => {
        this.individualClaimsModalForm.controls.MONTH_YEAR.setValue(text);

        setTimeout(() => {
          this.getSchemeByDate();
        });
      }
    });

    jQuery("#cal_group_claims_month_year").calendar({
      type: "month",
      popupOptions: {
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      },
      onChange: (date, text, mode) => {
        this.groupClaimsModalForm.controls.MONTH_YEAR.setValue(text);

        setTimeout(() => {
          this.getSchemeByDateGroup();
        });
      }
    });

    jQuery('#range_dealer_dashboard_claim_amount').range({
      min: 0,
      max: 500000,
      start: 0,
      step: 1,
      onChange: function (value) {
        $('#span_dealer_dashboard_claim_amount').html(value);
      }
    });

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;

    jQuery("#cal_dealer_dashboard_start_date").calendar({
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
        if(date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_dealer_dashboard_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_dealer_dashboard_end_date").val().toString() == null))){
          jQuery("#cal_dealer_dashboard_end_date").calendar("set date", date);
        }
        else if(isEndDate){
          isEndDate = false;
        }

        jQuery("#txt_dealer_dashboard_start_date").calendar("set date", text);
      },
      endCalendar: jQuery("#cal_dealer_dashboard_end_date")
    }).calendar("set date", new Date());

    jQuery("#cal_dealer_dashboard_end_date").calendar({
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
        if(date != "" && date != null && date != undefined && ($("#txt_dealer_dashboard_start_date").val().toString() == "" || $("#txt_dealer_dashboard_end_date").val().toString() == null)){
          isEndDate = true;
          jQuery("#cal_dealer_dashboard_start_date").calendar("set date", date);
        }

        jQuery("#txt_dealer_dashboard_end_date").calendar("set date", text);
      },
      startCalendar: jQuery("#cal_dealer_dashboard_start_date")
    }).calendar("set date", new Date());

    this.individualClaimsModalForm = this.formBuilder.group({
      MONTH_YEAR: ['', Validators.required],
      SCHEME: ['', Validators.required],
      CHASSIS_NO: ['', Validators.required]
    });

    this.groupClaimsModalForm = this.formBuilder.group({
      MONTH_YEAR: ['', Validators.required],
      SCHEME: ['', Validators.required],
      PPL: ['', Validators.required],
      STATUS: ['', Validators.required]
    });
  }
  
  dragAndScrollIndividualTable(){
    const slider = document.querySelector<HTMLElement>('#dealerDashboardIndividualClaimTable');
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

  dragAndScrollGroupTable(){
    const slider = document.querySelector<HTMLElement>('#dealerDashboardGroupClaimTable');
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

  dragAndScrollBulkTable(){
    const slider = document.querySelector<HTMLElement>('#dealerBulkClaimTable');
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

  dragAndScrollInitialValidationTable(){
    const slider = document.querySelector<HTMLElement>('#initialValidationTable');
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

  getDealerDetails(){
    this.claimsService.getUserDetailsById('DLR', this.position).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse.length > 0){
        this.dealerDetails = claimsDealerDashboardResponse;

        $('#txt_dealer_dashboard_dealer_code').val(this.dealerDetails[0].DLRCODE);

        this.sharedService.changeDealerCode(this.dealerDetails[0].DLRCODE);
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for User', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting User Details', life: 7000});
      }
    });
  }

  getBusinessUnit(){
    jQuery('#dd_dealer_dashboard_business_unit').parent().addClass('disabled');

    this.claimsService.getBusinessUnit().subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != ""){
        this.geoMappingList = claimsDealerDashboardResponse;

        for(let i = 0; i < this.geoMappingList.length; i++){
          this.businessUnitList[i] = new BusinessUnit();
          this.businessUnitList[i].text = this.geoMappingList[i].BU;
          this.businessUnitList[i].value = this.geoMappingList[i].BU;
        }

        setTimeout(() => {
          jQuery('#dd_dealer_dashboard_business_unit').dropdown('set selected', this.businessUnitList[0].value);

          this.sharedService.changeBusinessUnit(this.businessUnitList[0].value);

          this.businessUnit = this.businessUnitList[0].value;

          this.getSchemeType();
          this.searchFilter(true);
          this.getWorkflowCode();
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Business Unit Data', life: 7000});
    });
  }

  getSchemeType(){
    let schemeCategoryType = "RET_INS";
    let businessUnit = jQuery('#dd_dealer_dashboard_business_unit').dropdown('get value');

    if(schemeCategoryType != null && schemeCategoryType != "" && businessUnit != null && businessUnit != ""){
      $('#dd_dealer_dashboard_scheme_type').parent().addClass('loading');
      $('#dd_dealer_dashboard_scheme_type').parent().addClass('disabled');

      jQuery('#dd_dealer_dashboard_scheme_type').dropdown('clear');
      jQuery('#dd_dealer_dashboard_scheme_type').dropdown('restore defaults');

      this.claimsService.getSchemeTypeList(businessUnit, schemeCategoryType).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.length > 0){
          this.schemeTypeList = claimsDealerDashboardResponse;
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme Type', life: 7000});
        }

        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Type Data', life: 7000});
        }
      });
    }
  }

  getScheme(){
    let schemeType = jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value').join();

    if(schemeType != null && schemeType != ""){
      $('#dd_dealer_dashboard_scheme_type').parent().addClass('loading');
      $('#dd_dealer_dashboard_scheme_type').parent().addClass('disabled');
      
      $('#dd_dealer_dashboard_scheme').parent().addClass('loading');
      $('#dd_dealer_dashboard_scheme').parent().addClass('disabled');

      jQuery('#dd_dealer_dashboard_scheme').dropdown('clear');
      jQuery('#dd_dealer_dashboard_scheme').dropdown('restore defaults');

      this.claimsService.getAllActiveSchemes(schemeType).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT && claimsDealerDashboardResponse.STATUS_OUT != null && claimsDealerDashboardResponse.STATUS_OUT != "" && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT != "" && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
          this.schemeList = claimsDealerDashboardResponse.RESPONSE_OUT;
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme', life: 7000});
        }

        $('#dd_dealer_dashboard_scheme').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme').parent().removeClass('disabled');

        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dealer_dashboard_scheme').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme').parent().removeClass('disabled');

        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dealer_dashboard_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Data', life: 7000});
        }
      });
    }
  }

  getSchemeByDate(){
    let monthYear = this.datePipe.transform(new Date(this.individualClaimsModalForm.controls.MONTH_YEAR.value), 'yyyy-MM');

    if(monthYear != null && monthYear != ""){
      $('#dd_dealer_individual_claim_modal_scheme').parent().addClass('loading');
      $('#dd_dealer_individual_claim_modal_scheme').parent().addClass('disabled');

      jQuery('#dd_dealer_individual_claim_modal_scheme').dropdown('clear');
      jQuery('#dd_dealer_individual_claim_modal_scheme').dropdown('restore defaults');

      this.claimsService.getActiveSchemes(monthYear).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
          this.activeSchemeList = claimsDealerDashboardResponse.RESPONSE_OUT;
        }
        else if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "ERROR" && claimsDealerDashboardResponse.RESPONSE_OUT == "NO DATA FOUND"){
          this.activeSchemeList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme', life: 7000});
        }
        else if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "ERROR"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Data', life: 7000});
        }
        else{
          this.activeSchemeList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme', life: 7000});
        }

        $('#dd_dealer_individual_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_individual_claim_modal_scheme').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dealer_individual_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_individual_claim_modal_scheme').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Data', life: 7000});
        }
      });
    }
  }

  getSchemeByDateGroup(){
    let monthYear = this.datePipe.transform(new Date(this.groupClaimsModalForm.controls.MONTH_YEAR.value), 'yyyy-MM');

    if(monthYear != null && monthYear != ""){
      $('#dd_dealer_group_claim_modal_scheme').parent().addClass('loading');
      $('#dd_dealer_group_claim_modal_scheme').parent().addClass('disabled');

      jQuery('#dd_dealer_group_claim_modal_scheme').dropdown('clear');
      jQuery('#dd_dealer_group_claim_modal_scheme').dropdown('restore defaults');

      this.claimsService.getGroupActiveSchemes(monthYear).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
          this.activeSchemeGroupList = claimsDealerDashboardResponse.RESPONSE_OUT;
        }
        else{
          this.activeSchemeGroupList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme', life: 7000});
        }

        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Data', life: 7000});
      }
    });
    }
  }

  getClaimTypeHardCoded(){
    $('#dd_dealer_dashboard_claim_type_hardcoded').parent().addClass('disabled');
    $('#dd_dealer_dashboard_claim_type_hardcoded').parent().addClass('loading');

    this.claimTypeHardCodeList[0] = new Object();
    this.claimTypeHardCodeList[0].description = "Individual Claim";
    this.claimTypeHardCodeList[0].value = "IND";

    this.claimTypeHardCodeList[1] = new Object();
    this.claimTypeHardCodeList[1].description = "Group Claim";
    this.claimTypeHardCodeList[1].value = "GRP";

    setTimeout(() => {
      $('#dd_dealer_dashboard_claim_type_hardcoded').parent().removeClass('disabled');
      $('#dd_dealer_dashboard_claim_type_hardcoded').parent().removeClass('loading');

      jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('set selected', this.claimTypeHardCodeList[0].value);
    }, 0);
  }

  getClaimType(){
    jQuery('#dd_dealer_dashboard_claim_type').parent().addClass('disabled');
    jQuery('#dd_dealer_dashboard_claim_type').parent().addClass('loading');

    this.claimsService.getClaimType().subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != ""){
        this.claimTypeList = claimsDealerDashboardResponse;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Type', life: 7000});
      }

      jQuery('#dd_dealer_dashboard_claim_type').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_claim_type').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_dealer_dashboard_claim_type').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_claim_type').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Type Data', life: 7000});
      }
    });
  }

  getWorkflowCode(){
    let schemeType = jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value');

    if(schemeType != null && schemeType != ""){
      this.claimsService.getWorkflowCode(schemeType).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.length > 0){
          this.workflowCode = claimsDealerDashboardResponse[0].wf_CODE;
  
          this.getCustodyRole(this.workflowCode);
        }
        else{
          this.workflowCode = "";
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Workflow Code', life: 7000 });
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Workflow Code', life: 7000 });
        }
      });
    }
  }

  getCustodyRole(workflowCode){
    jQuery('#dd_dealer_dashboard_custody_role').parent().addClass('disabled');
    jQuery('#dd_dealer_dashboard_custody_role').parent().addClass('loading');

    this.claimsService.getCustodyRole(workflowCode).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT != "" && claimsDealerDashboardResponse.STATUS_OUT != null && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
        this.custodyRoleList = claimsDealerDashboardResponse.RESPONSE_OUT;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Custody Role', life: 7000});
      }

      jQuery('#dd_dealer_dashboard_custody_role').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_custody_role').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_dealer_dashboard_custody_role').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_custody_role').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Custody Role Data', life: 7000});
      }
    });
  }

  getAssignmentType(){
    jQuery('#dd_dealer_dashboard_assignment_type').parent().addClass('disabled');
    jQuery('#dd_dealer_dashboard_assignment_type').parent().addClass('loading');

    this.assignmentTypeList[0] = new Object();
    this.assignmentTypeList[0].description = "Assigned to Me";
    this.assignmentTypeList[0].value = "AM";

    this.assignmentTypeList[1] = new CustodyRole();
    this.assignmentTypeList[1].description = "Not Assigned to Me";
    this.assignmentTypeList[1].value = "NAM";

    setTimeout(() => {
      jQuery('#dd_dealer_dashboard_assignment_type').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_assignment_type').parent().removeClass('loading');
    }, 0);
  }

  getStatus(){
    jQuery('#dd_dealer_dashboard_status').parent().addClass('disabled');
    jQuery('#dd_dealer_dashboard_status').parent().addClass('loading');

    this.claimsService.getStatus().subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT && claimsDealerDashboardResponse.STATUS_OUT != "" && claimsDealerDashboardResponse.STATUS_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT && claimsDealerDashboardResponse.RESPONSE_OUT != "" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
        this.statusList = claimsDealerDashboardResponse.RESPONSE_OUT;
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Status', life: 7000});
      }

      jQuery('#dd_dealer_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_status').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_dealer_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_dealer_dashboard_status').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Status Data', life: 7000});
      }
    });
  }

  getPPL(){
    let schemeId = this.groupClaimsModalForm.controls.SCHEME.value;

    if(schemeId != null && schemeId != ""){
      $('#dd_dealer_group_claim_modal_scheme').parent().addClass('loading');
      $('#dd_dealer_group_claim_modal_scheme').parent().addClass('disabled');

      $('#dd_dealer_group_claim_modal_ppl').parent().addClass('loading');
      $('#dd_dealer_group_claim_modal_ppl').parent().addClass('disabled');

      jQuery('#dd_dealer_group_claim_modal_ppl').dropdown('clear');
      jQuery('#dd_dealer_group_claim_modal_ppl').dropdown('restore defaults');

      this.claimsService.getPPLList(schemeId, this.businessUnit).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.length > 0){
          this.pplList = claimsDealerDashboardResponse;
        }
        else{
          this.pplList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for PPL', life: 7000});
        }

        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('disabled');

        $('#dd_dealer_group_claim_modal_ppl').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_ppl').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_scheme').parent().removeClass('disabled');

        $('#dd_dealer_group_claim_modal_ppl').parent().removeClass('loading');
        $('#dd_dealer_group_claim_modal_ppl').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting PPL Data', life: 7000});
        }
      });
    }
  }

  getGroupStatus(){
    jQuery('#dd_dealer_group_claim_modal_status').parent().addClass('disabled');
    jQuery('#dd_dealer_group_claim_modal_status').parent().addClass('loading');

    this.claimsService.getApproverStatus('DLR').subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT && claimsDealerDashboardResponse.STATUS_OUT != "" && claimsDealerDashboardResponse.STATUS_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT && claimsDealerDashboardResponse.RESPONSE_OUT != "" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT.length > 0){
        this.statusGroupList = claimsDealerDashboardResponse.RESPONSE_OUT;
      }
      else{
        this.statusGroupList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Status', life: 7000});
      }

      jQuery('#dd_dealer_group_claim_modal_status').parent().removeClass('disabled');
      jQuery('#dd_dealer_group_claim_modal_status').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_dealer_group_claim_modal_status').parent().removeClass('disabled');
      jQuery('#dd_dealer_group_claim_modal_status').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Status Data', life: 7000});
      }
    });
  }

  searchFilter(flag){
    this.selectedIndividualClaims = [];
    this.selectedGroupClaims = [];

    this.individualClaimInputObj = new Object();
    this.groupClaimInputObj = new Object();

    if(jQuery('#dd_dealer_dashboard_business_unit').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_business_unit').dropdown('get value') != ""){
      this.individualClaimInputObj.pBU_ID = jQuery('#dd_dealer_dashboard_business_unit').dropdown('get value');
      this.groupClaimInputObj.pBU_ID = jQuery('#dd_dealer_dashboard_business_unit').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pBU_ID = '';
      this.groupClaimInputObj.pBU_ID = '';
    }

    if(jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value') != ""){
      this.individualClaimInputObj.pSTM_ID = jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value');
      this.groupClaimInputObj.pSTM_ID = jQuery('#dd_dealer_dashboard_scheme_type').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSTM_ID = [];
      this.groupClaimInputObj.pSTM_ID = [];
    }

    if(jQuery('#dd_dealer_dashboard_scheme').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_scheme').dropdown('get value') != ""){
      this.individualClaimInputObj.pSCHEME_ID = jQuery('#dd_dealer_dashboard_scheme').dropdown('get value');
      this.groupClaimInputObj.pSCHEME_ID = jQuery('#dd_dealer_dashboard_scheme').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSCHEME_ID = [];
      this.groupClaimInputObj.pSCHEME_ID = [];
    }

    if(jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') == "IND"){
      this.individualClaimInputObj.pCLAIM_ID = $('#txt_dealer_dashboard_claim_id').val().toString().trim() != null && $('#txt_dealer_dashboard_claim_id').val().toString().trim() != "" ? $('#txt_dealer_dashboard_claim_id').val().toString().trim().split(',') : [];
      this.groupClaimInputObj.pGCLAIM_ID = [];
    }
    else{
      this.individualClaimInputObj.pCLAIM_ID = [];
      this.groupClaimInputObj.pGCLAIM_ID = $('#txt_dealer_dashboard_group_claim_id').val().toString().trim() != null && $('#txt_dealer_dashboard_group_claim_id').val().toString().trim() != "" ? $('#txt_dealer_dashboard_group_claim_id').val().toString().trim().split(',') : [];
    }

    if($('#txt_dealer_dashboard_chassis_no').val().toString().trim() != null && $('#txt_dealer_dashboard_chassis_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pCHASSIS_NO = $('#txt_dealer_dashboard_chassis_no').val().toString().trim().split(',');
      this.groupClaimInputObj.pCHASSIS_NO = $('#txt_dealer_dashboard_chassis_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pCHASSIS_NO = [];
      this.groupClaimInputObj.pCHASSIS_NO = [];
    }

    this.individualClaimInputObj.pDEALER_CODE = $('#txt_dealer_dashboard_dealer_code').val().toString().trim();
    this.groupClaimInputObj.pDEALER_CODE = $('#txt_dealer_dashboard_dealer_code').val().toString().trim();

    if($('#txt_dealer_dashboard_nfa_no').val().toString().trim() != null && $('#txt_dealer_dashboard_nfa_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pNFA_NO = $('#txt_dealer_dashboard_nfa_no').val().toString().trim().split(',');
      this.groupClaimInputObj.pNFA_NO = $('#txt_dealer_dashboard_nfa_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pNFA_NO = [];
      this.groupClaimInputObj.pNFA_NO = [];
    }

    if(jQuery('#dd_dealer_dashboard_claim_type').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_claim_type').dropdown('get value') != ""){
      this.individualClaimInputObj.pCLAIM_TYPE = jQuery('#dd_dealer_dashboard_claim_type').dropdown('get value');
      this.groupClaimInputObj.pCLAIM_TYPE = jQuery('#dd_dealer_dashboard_claim_type').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pCLAIM_TYPE = '';
      this.groupClaimInputObj.pCLAIM_TYPE = '';
    }

    if(jQuery('#dd_dealer_dashboard_custody_role').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_custody_role').dropdown('get value') != ""){
      this.individualClaimInputObj.pCUST_ROLE = jQuery('#dd_dealer_dashboard_custody_role').dropdown('get value');
      this.groupClaimInputObj.pCUST_ROLE = jQuery('#dd_dealer_dashboard_custody_role').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pCUST_ROLE = '';
      this.groupClaimInputObj.pCUST_ROLE = '';
    }

    if(jQuery('#dd_dealer_dashboard_status').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_status').dropdown('get value') != ""){
      this.individualClaimInputObj.pSTATUS_ID = jQuery('#dd_dealer_dashboard_status').dropdown('get value');
      this.groupClaimInputObj.pSTATUS_ID = jQuery('#dd_dealer_dashboard_status').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSTATUS_ID = '';
      this.groupClaimInputObj.pSTATUS_ID = '';
    }

    if(jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('get value') != "" && jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('get value') != "NA"){
      this.individualClaimInputObj.pAMT_OPT = jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('get value');
      this.groupClaimInputObj.pAMT_OPT = jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('get value');

      this.individualClaimInputObj.pAMT = $('#span_dealer_dashboard_claim_amount').text().toString().trim();
      this.groupClaimInputObj.pAMT = $('#span_dealer_dashboard_claim_amount').text().toString().trim();
    }
    else{
      this.individualClaimInputObj.pAMT_OPT = '';
      this.groupClaimInputObj.pAMT_OPT = '';

      this.individualClaimInputObj.pAMT = '';
      this.groupClaimInputObj.pAMT = '';
    }

    if(jQuery('#dd_dealer_dashboard_date_type').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_date_type').dropdown('get value') != "" && jQuery('#dd_dealer_dashboard_date_type').dropdown('get value') != "NA"){
      this.individualClaimInputObj.pDATE_TYPE = jQuery('#dd_dealer_dashboard_date_type').dropdown('get value');
      this.groupClaimInputObj.pDATE_TYPE = jQuery('#dd_dealer_dashboard_date_type').dropdown('get value');

      this.individualClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_dealer_dashboard_start_date').val()),'dd-MMM-yyyy');
      this.individualClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_dealer_dashboard_end_date').val()),'dd-MMM-yyyy');

      this.groupClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_dealer_dashboard_start_date').val()),'dd-MMM-yyyy');
      this.groupClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_dealer_dashboard_end_date').val()),'dd-MMM-yyyy');
    }
    else{
      this.individualClaimInputObj.pDATE_TYPE = '';
      this.groupClaimInputObj.pDATE_TYPE = '';

      this.individualClaimInputObj.pFROM_DATE = '';
      this.individualClaimInputObj.pTO_DATE = '';

      this.groupClaimInputObj.pFROM_DATE = '';
      this.groupClaimInputObj.pTO_DATE = '';
    }

    if(jQuery('#dd_dealer_dashboard_stock_transfer').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_stock_transfer').dropdown('get value') != ""){
      this.individualClaimInputObj.pSTOCK_TRANSFER = jQuery('#dd_dealer_dashboard_stock_transfer').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSTOCK_TRANSFER = '';
    }

    this.individualClaimInputObj.pBLOCK_FLAG = '';
    this.individualClaimInputObj.pMONTH_YEAR = '';
    this.groupClaimInputObj.pMONTH_YEAR = '';
    this.individualClaimInputObj.pSCHEME_NAME = '';
    this.groupClaimInputObj.pSCHEME_NAME = '';
    this.individualClaimInputObj.pST_DESC = '';
    this.groupClaimInputObj.pST_DESC = '';
    this.individualClaimInputObj.pROLE_DESCRIPTION = '';
    this.groupClaimInputObj.pROLE_DESCRIPTION = '';
    this.individualClaimInputObj.pPOSITION = this.position;
    this.groupClaimInputObj.pPOSITION = this.position;
    this.individualClaimInputObj.pROLE = this.role;
    this.groupClaimInputObj.pROLE = this.role;

    jQuery('#modal_dealer_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    if(!flag && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') == "IND"){
      this.getIndividualClaims();
    }
    else if(!flag && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dealer_dashboard_claim_type_hardcoded').dropdown('get value') == "GRP"){
      this.getGroupClaims();
    }
    else{
      this.getIndividualClaims();
      this.getGroupClaims();
    }
  }

  clearFilter(flag){
    jQuery('#dd_dealer_dashboard_scheme_type').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_scheme').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_status').dropdown('restore defaults');

    this.schemeList = [];

    $('#txt_dealer_dashboard_claim_id').val('');
    $('#txt_dealer_dashboard_group_claim_id').val('');
    $('#txt_dealer_dashboard_chassis_no').val('');
    
    this.searchFilter(true);
  }

  clearAdvanceFilter(flag){
    jQuery('#dd_dealer_dashboard_claim_type').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_custody_role').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_assignment_type').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_claim_amount_type').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_date_type').dropdown('restore defaults');
    jQuery('#dd_dealer_dashboard_stock_transfer').dropdown('restore defaults');
    
    if(!this.isDSADMIN){
      $('#txt_dealer_dashboard_dealer_code').val('');
    }

    $('#txt_dealer_dashboard_nfa_no').val('');

    jQuery("#cal_dealer_dashboard_start_date").calendar("set date", new Date());
    jQuery("#cal_dealer_dashboard_end_date").calendar("set date", new Date());

    this.searchFilter(true);
  }

  getIndividualClaims(){
    $('.loader').show();
    this.isIndividualClaimObj = false;

    document.getElementById('dealerDashboardIndividualClaimTable').scrollLeft = 0;

    this.individualClaimInputObj.pageNumber = '1';
    this.individualClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getIndividualClaims(this.individualClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0){
        this.tableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.individualClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isIndividualClaimObj = true;
      }
      else{
        this.individualClaimObj = [];
        this.tableCount = 0;
        this.isIndividualClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
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
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
      }
    });
  }
  
  individualClaimSizeChanged(event){
    jQuery('#dd_dealer_dashboard_individual_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setIndividualClaimPage(1);
  }

  setIndividualClaimPage(page: number){
    if(this.individualClaimInputObj != null){
      $('.loader').show();
      this.isIndividualClaimObj = false;
      this.selectedIndividualClaims = [];

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.individualClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.individualClaimInputObj.pageSize = this.pager.pageSize.toString();

      this.claimsService.getIndividualClaims(this.individualClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS"){
          this.individualClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
          this.isIndividualClaimObj = true;
        }
        else{
          this.tableCount = 0;
          this.individualClaimObj = null;
          this.isIndividualClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
        }
      });
    }
  }

  getGroupClaims(){
    $('.loader').show();
    this.isGroupClaimObj = false;
    
    document.getElementById('dealerDashboardGroupClaimTable').scrollLeft = 0;

    this.groupClaimInputObj.pageNumber = '1';
    this.groupClaimInputObj.pageSize = this.gtableSize.toString();

    this.claimsService.getGroupClaims(this.groupClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0){
        this.gtableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.groupClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isGroupClaimObj = true;
      }
      else{
        this.groupClaimObj = [];
        this.gtableCount = 0;
        this.isGroupClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Group Claims', life: 7000});
      }

      this.gpager.currentPage = 1;
      this.gpager.pageSize = this.gtableSize;

      const page = 1;

      this.gpager = this.sharedService.getPager(this.gtableCount, page, this.gtableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claims Data', life: 7000});
      }
    });
  }

  getSelectedClaimId(){
    let claimId: Array<string> = [];

    claimId = this.selectedIndividualClaims.map((item) => item.claim_ID);

    return claimId;
  }

  exportIndividualClaims(){
    if(this.individualClaimInputObj != null){
      $('.loader').show();

      let individualClaimInputObj = JSON.parse(JSON.stringify(this.individualClaimInputObj));
      individualClaimInputObj.pCLAIM_ID = this.getSelectedClaimId();
      individualClaimInputObj.pageSize = '0';
      individualClaimInputObj.pageNumber = '0';

      this.claimsService.exportIndividualClaims(individualClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        const blob = claimsDealerDashboardResponse;
        const url = window.URL.createObjectURL(blob);
  
        var link = document.createElement('a');
        link.href = url;
        link.download = "Individual-Claim-Details.xls";
        link.click(); 
        $('.loader').hide();
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        $('.loader').hide();
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Exporting Individual Claims Data', life: 7000});
        }
      });
    }
  }

  groupClaimSizeChanged(event){
    jQuery('#dd_dealer_dashboard_group_size').dropdown('set selected', event.target.value);
    this.gtableSize = event.target.value;
    this.setGroupClaimPage(1);
  }

  setGroupClaimPage(page: number){
    if(this.groupClaimInputObj != null){
      $('.loader').show();
      this.isGroupClaimObj = false;
      this.selectedGroupClaims = [];

      if (page < 1 || page > this.gpager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.gpager = this.sharedService.getPager(this.gtableCount, page, this.gtableSize);

      this.groupClaimInputObj.pageNumber = this.gpager.currentPage.toString();
      this.groupClaimInputObj.pageSize = this.gpager.pageSize.toString();

      this.claimsService.getGroupClaims(this.groupClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS"){
          this.groupClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
          this.isGroupClaimObj = true;
        }
        else{
          this.gtableCount = 0;
          this.groupClaimObj = null;
          this.isGroupClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Group Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claims Data', life: 7000});
        }
      });
    }
  }

  getSelectedGroupClaimId(){
    let gClaimId: Array<string> = [];

    gClaimId = this.selectedGroupClaims.map((item) => item.g_CLAIM_ID);

    return gClaimId;
  }

  exportGroupClaims(){
    if(this.groupClaimInputObj != null){
      $('.loader').show();

      let groupClaimInputObj = JSON.parse(JSON.stringify(this.groupClaimInputObj));
      groupClaimInputObj.pGCLAIM_ID = this.getSelectedGroupClaimId();
      groupClaimInputObj.pageSize = '0';
      groupClaimInputObj.pageNumber = '0';

      this.claimsService.exportGroupClaims(groupClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        const blob = claimsDealerDashboardResponse;
        const url = window.URL.createObjectURL(blob);
  
        var link = document.createElement('a');
        link.href = url;
        link.download = "Group-Claim-Details.xls";
        link.click(); 
        $('.loader').hide();
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        $('.loader').hide();
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Exporting Group Claims Data', life: 7000});
        }
      });
    }
  }

  getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId){
    $('.loader').show();
    
    this.claimsService.getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.individualClaimsPreSelectedData = claimsDealerDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, true);
      }
      else{
        $('.loader').hide();
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details By Chassis', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details By Chassis', life: 7000});
      }
    });
  }

  getGroupBasicClaimsDetails(schemeId, ppl, position){
    $('.loader').show();
    
    this.claimsService.getGroupBasicClaimsDetails(schemeId, ppl, position).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.groupClaimsPreSelectedData = claimsDealerDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId('', schemeId, false);
      }
      else{
        this.sharedService.groupClaimsPreSelectedData = {};
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details', life: 7000});
      }
    });
  }

  getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, isIndividualClaim){
    this.claimsService.getClaimLimit(chassisNo, schemeId).subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != ""){
        if(isIndividualClaim){
          this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDealerDashboardResponse.CLAIM_LIMIT;
        }
        else{
          this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDealerDashboardResponse.CLAIM_LIMIT;
        }
        
        setTimeout(() => {
          $('.loader').hide();

          if(isIndividualClaim){
            if(this.isIndividualClaimView){
              jQuery('#modal_dealer_individual_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  
              this.individualClaimViewTabsLazyComp = import('../claim-dealer-tabs-view/claim-dealer-tabs-view.component').then(({ClaimDealerTabsViewComponent}) => ClaimDealerTabsViewComponent);
            }
            else{
              this.newIndividualClaim(); 
            }
          }
          else{
            if(this.isGroupClaimView){
              jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  
              this.groupClaimViewTabsLazyComp = import('../group-claim-view-tab/group-claim-view-tab.component').then(({GroupClaimViewTabComponent}) => GroupClaimViewTabComponent);
            }
            else{
              this.newGroupClaim(); 
            }
          }
        }, 0);
      }
      else{
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Limit', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Limit', life: 7000});
      }
    });
  }

  individualClaimInitialValidation(){
    $('.loader').show();

    if(this.individualClaimsModalForm.controls.SCHEME.value != null && this.individualClaimsModalForm.controls.SCHEME.value != "" && this.individualClaimsModalForm.controls.CHASSIS_NO.value != null && this.individualClaimsModalForm.controls.CHASSIS_NO.value != ""){
      this.claimsService.individualClaimInitialValidation(this.individualClaimsModalForm.controls.SCHEME.value, this.individualClaimsModalForm.controls.CHASSIS_NO.value).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS"){
          $('.loader').hide();
          this.getIndividualBasicClaimsDetails(this.individualClaimsModalForm.controls.CHASSIS_NO.value, this.individualClaimsModalForm.controls.SCHEME.value, this.position, "");
        }
        else if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "ERROR"){
          this.initialValidationObj = claimsDealerDashboardResponse.RESPONSE_OUT;

          setTimeout(() => {
            $('.loader').hide();
            jQuery('#modal_dealer_initial_validation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show'); 

            this.dragAndScrollInitialValidationTable();
          }, 0);
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Validating Chassis and Scheme', life: 7000}); 
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Validating Chassis and Scheme', life: 7000});
        }
      });
    }
  }

  closeInitialValidation(){
    jQuery('#modal_dealer_initial_validation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide'); 
    this.initialValidationObj = [];
  }

  initializeIndividualClaimsRegistration(){
    this.activeSchemeList = [];

    this.individualClaimsModalForm.reset();

    jQuery('#dd_dealer_individual_claim_modal_scheme').dropdown('clear');

    jQuery('#modal_dealer_individual_claims_pre_registration').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeIndividualClaimsRegistration(){
    jQuery('#modal_dealer_individual_claims_pre_registration').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  validateIndividualBasicDetails(){
    this.individualClaimsModalForm.markAllAsTouched();

    this.individualClaimHeader = "Create Individual Claim";

    if(this.individualClaimsModalForm.invalid){
      return;
    }

    this.isIndividualClaimView = false;

    this.individualClaimInitialValidation();
  }

  newIndividualClaim(){
    this.closeIndividualClaimsRegistration();
    
    jQuery('#modal_dealer_individual_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.individualClaimTabsLazyComp = import('../claim-dealer-tabs/claim-dealer-tabs.component').then(({ClaimDealerTabsComponent}) => ClaimDealerTabsComponent);
  }

  editIndividualClaim(chassisNo, claimId, schemeId, status){
    this.isIndividualClaimView = false;
    this.sharedService.isClaimEdit = true;
    this.sharedService.status = status;
    this.sharedService.changeClaimId(claimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, this.position, claimId);

      this.individualClaimHeader = "Edit Individual Claim";
    }, 0);
  }

  closeIndividualClaim(){
    jQuery('#modal_dealer_individual_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeClaimId('');
    this.sharedService.changeSchemeId('');
    this.sharedService.changeNFANo('');
    this.sharedService.changeChassisNo('');
    this.sharedService.claimObjById = {};
    this.sharedService.isClaimEdit = false;
    this.individualClaimTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.searchFilter(true);
  }

  openIndividualClaimView(chassisNo, claimId, schemeId, status){
    this.isIndividualClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeClaimId(claimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, this.position, claimId);
    }, 0);
  }

  closeIndividualClaimView(){
    jQuery('#modal_dealer_individual_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
    jQuery('#model_dealer_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeClaimId('');
    this.sharedService.changeSchemeId('');
    this.sharedService.changeNFANo('');
    this.sharedService.changeChassisNo('');
    this.sharedService.claimObjById = {};
    this.individualClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getIndividualClaims();
  }

  initializeGroupClaimsRegistration(){
    this.activeSchemeGroupList = [];

    this.getGroupStatus();
    
    this.groupClaimsModalForm.reset();

    jQuery('#dd_dealer_group_claim_modal_scheme').dropdown('clear');
    jQuery('#dd_dealer_group_claim_modal_ppl').dropdown('clear');
    jQuery('#dd_dealer_group_claim_modal_status').dropdown('clear');

    jQuery('#modal_dealer_group_claims_pre_registration').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeGroupClaimsRegistration(){
    jQuery('#modal_dealer_group_claims_pre_registration').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  validateGroupBasicDetails(){
    this.groupClaimsModalForm.markAllAsTouched();

    this.groupClaimHeader = "Create Group Claim";

    if(this.groupClaimsModalForm.invalid){
      return;
    }

    this.isGroupClaimView = false;

    this.sharedService.changeSchemeId(this.groupClaimsModalForm.controls.SCHEME.value);
    this.sharedService.changePPL(this.groupClaimsModalForm.controls.PPL.value);
    this.sharedService.changeGroupClaimStatus(this.groupClaimsModalForm.controls.STATUS.value);

    this.getGroupBasicClaimsDetails(this.groupClaimsModalForm.controls.SCHEME.value, this.groupClaimsModalForm.controls.PPL.value, this.position);
  }

  newGroupClaim(){
    this.closeGroupClaimsRegistration();

    jQuery('#modal_dealer_group_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.groupClaimTabsLazyComp = import('../group-claim-tab/group-claim-tab.component').then(({GroupClaimTabComponent}) => GroupClaimTabComponent);
  }

  editGroupClaim(groupClaimId, schemeId, status, ppl){
    this.isGroupClaimView = false;
    this.sharedService.isGroupClaimEdit = true;
    this.sharedService.status = status;
    this.sharedService.changeGroupClaimId(groupClaimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getGroupBasicClaimsDetails(schemeId, ppl, this.position);

      this.groupClaimHeader = "Edit Group Claim";
    }, 0);
  }

  closeGroupClaim(){
    jQuery('#modal_dealer_group_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeGroupClaimId('');
    this.sharedService.changeSchemeId('');
    this.sharedService.groupClaimObjById = {};
    this.sharedService.isGroupClaimEdit = false;
    this.groupClaimTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.searchFilter(true);
  }

  openGroupClaimView(groupClaimId, status){
    this.isGroupClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeGroupClaimId(groupClaimId);

    setTimeout(() => {
      jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.groupClaimViewTabsLazyComp = import('../group-claim-view-tab/group-claim-view-tab.component').then(({GroupClaimViewTabComponent}) => GroupClaimViewTabComponent);
    }, 0);
  }

  closeGroupClaimView(){
    jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeGroupClaimId("");
    this.sharedService.groupClaimObjById = {};
    this.groupClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getGroupClaims();
  }

  openChassisView(chassisNo){
    this.sharedService.changeChassisNo(chassisNo);

    setTimeout(() => {
      jQuery('#modal_chassis_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.chassisViewTabsLazyComp = import('../chassis-details-tabs-view/chassis-details-tabs-view.component').then(({ChassisDetailsTabsViewComponent}) => ChassisDetailsTabsViewComponent);
    }, 0);
  }

  closeChassisView(){
    jQuery('#modal_chassis_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeChassisNo("");
    this.chassisViewTabsLazyComp = null;
  }

  openSchemeView(schemeId){
    jQuery('#model_dealer_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.schemeViewUrl = "";

    setTimeout(() => {
      this.sharedService.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView(){
    this.sharedService.schemeViewUrl = "";
  }

  openAvailConcession(){
    setTimeout(() => {
      jQuery('#model_dealer_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availConcessionLazyComp = import('../avail-concession/avail-concession.component').then(({AvailConcessionComponent}) => AvailConcessionComponent);
    }, 0);
  }

  closeAvailConcession(){
    jQuery('#model_dealer_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availConcessionLazyComp = null;
  }

  openAvailableDiscount(){
    setTimeout(() => {
      jQuery('#model_dealer_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availableDiscountLazyComp = import('../available-discount/available-discount.component').then(({AvailableDiscountComponent}) => AvailableDiscountComponent);
    }, 0);
  }

  closeAvailableDiscount(){
    this.sharedService.changeTMInvNo("");
    
    jQuery('#model_dealer_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availableDiscountLazyComp = null;
  }

  openCRMCreditAmount(){
    setTimeout(() => {
      jQuery('#model_dealer_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.crmCreditAmountLazyComp = import('../crm-credit-amount/crm-credit-amount.component').then(({CrmCreditAmountComponent}) => CrmCreditAmountComponent);
    }, 0);
  }

  closeCRMCreditAmount(){
    jQuery('#model_dealer_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.crmCreditAmountLazyComp = null;
  }

  openActualConcessionCRM(){
    setTimeout(() => {
      jQuery('#model_dealer_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.actualConcessionCRMLazyComp = import('../actual-concession-crm/actual-concession-crm.component').then(({ActualConcessionCrmComponent}) => ActualConcessionCrmComponent);
    }, 0);
  }

  closeActualConcessionCRM(){
    jQuery('#model_dealer_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.actualConcessionCRMLazyComp = null;
  }

  openAdvanceSearch(){
    jQuery('#modal_dealer_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeAdvanceSearch(){
    jQuery('#modal_dealer_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  importClaims(){
    jQuery('#modal_dealer_bulk_claims').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeBulkClaimUpload(){
    jQuery('#modal_dealer_bulk_claims').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.searchFilter(true);
  }

  chooseBulkClaimFile($event){
    this.bulkClaimFile = $event.target.files.item(0);

    if(this.bulkClaimFile != null && (this.bulkClaimFile.name.toLocaleLowerCase().endsWith('.csv'))){
      this.isBulkClaimFile = true;
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('#file_bulk_claim').val('');
      this.bulkClaimFile = null;
      this.isBulkClaimFile = false;
      this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'Please Upload CSV File Only', life: 7000});
    }
  }

  uploadBulkClaimFile(){
    if(this.bulkClaimFile != null && this.bulkClaimFile.size > 0){
      $('.loader').show();

      document.getElementById('dealerBulkClaimTable').scrollLeft = 0;

      this.claimsService.bulkClaimUpload(this.bulkClaimFile).subscribe((claimsDealerDashboardResponse) => {
        if(claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "" && claimsDealerDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT != ""){
          $('#file_bulk_claim').val('');
          this.bulkClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT;
          this.isBulkClaimFile = false;
          this.bulkClaimFile = null;
          this.isBulkClaimObj = true;
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'success', sticky: true, summary: 'Success', detail:'Bulk Claim Upload Successful', life: 7000}); 
        }
        else{
          this.bulkClaimObj = [];
          this.isBulkClaimObj = false;
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error in Bulk Claim Upload: ' + claimsDealerDashboardResponse.RESPONSE_OUT, life: 7000});           
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDealerDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error in Bulk Claim Upload', life: 7000}); 
        }
      });
    }
  }

  downloadBulkClaimTemplate(){
    var link = document.createElement('a');
    link.href = 'assets/Download-Templates/VME_CLAIMS_BULK_UPLOAD.csv';  // use realtive url 
    link.download = 'VME_CLAIMS_BULK_UPLOAD.csv';
    document.body.appendChild(link);
    link.click();  
  }

  exportBulkClaims(){
    if(this.bulkClaimObj != null && this.bulkClaimObj.length > 0){
      $('.loader').show();

      var JSONData = JSON.parse(JSON.stringify(this.bulkClaimObj, ["claim_ID", "scheme_ID", "chassis_NO", "scheme_NAME", "claim_AMOUNT", "status", "dealer_CODE", "remark"]));
      var ShowLabel = true;
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
      var CSV = ''; 
      var reqData: number[] = [];
      var headings: string[] = [];
      
        if(ShowLabel){
          var row = "";
          var num = -1;
          
          for(var index in arrData[0]){
            num++;
            
            if(index == 'claim_ID' || index == 'scheme_ID' || index == 'chassis_NO' || index == 'scheme_NAME' || index == 'claim_AMOUNT' || index == 'status' || index == 'dealer_CODE' || index == 'remark'){
              reqData.push(num);
              headings.push(index);

              if(index == 'claim_ID'){
                index = 'Claim Id';
              }

              if(index == 'chassis_NO'){
                index = 'Chassis Number';
              }

              if(index == 'scheme_ID'){
                index = 'Scheme Id';
              }

              if(index == 'scheme_NAME'){
                index = 'Scheme Name';
              }
          
              if(index == 'claim_AMOUNT'){
                index = 'Claim Amount';
              }

              if(index == 'status'){
                index = 'Status';
              }

              if(index == 'dealer_CODE'){
                index = 'Dealer Code';
              }

              if(index == 'remark'){
                index = 'Remark';
              }
      
              row += index + ',';
            }
          }
            
          row = row.slice(0, -1);
          
          CSV += row + '\r\n';
        }
      
        for(var i = 0; i < arrData.length; i++){
          var row = "";
          
          for(var j = 0; j < headings.length;j++){
            row += '"' + arrData[i][headings[j]] + '",';
          }
          
          row.slice(0, row.length - 1);
          CSV += row + '\r\n';
        }
      
        if(CSV == ''){
          return;
        }   
        
        var fileName = "Bulk Uploaded File";
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        var link = document.createElement("a");    
        link.href = uri;
        link.download = fileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $('.loader').hide();
    }
  }

  resetBulkClaims(){
    $('#file_bulk_claim').val('');
    this.isBulkClaimFile = false;
    this.bulkClaimFile = null;
    this.bulkClaimObj = [];
  }

  toggleSearchFilters(){
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }

  editButtonIndividual(i){
    if((this.individualClaimObj[i].st_ID == "DRFT" || this.individualClaimObj[i].st_ID == "RECO" || this.individualClaimObj[i].st_ID == "EXSD" || this.individualClaimObj[i].st_ID == "PDRE" || this.individualClaimObj[i].st_ID == "DDOC" || this.individualClaimObj[i].st_ID == "PDOA" || this.individualClaimObj[i].st_ID == "SRCO") && this.individualClaimObj[i].block_FLAG == 'Open' && this.individualClaimObj[i].cust_ROLE == "DLR"){
      return true;
    }
    else{
      return false;
    }
  }

  editButtonGroup(i){
    if((this.groupClaimObj[i].st_ID == "DRFT" || this.groupClaimObj[i].st_ID == "RECO" || this.groupClaimObj[i].st_ID == "EXSD" || this.groupClaimObj[i].st_ID == "PDRE" || this.groupClaimObj[i].st_ID == "DDOC" || this.groupClaimObj[i].st_ID == "PDOA" || this.groupClaimObj[i].st_ID == "SRCO") && this.groupClaimObj[i].block_FLAG == 'Open' && this.groupClaimObj[i].cust_ROLE == "DLR"){
      return true;
    }
    else{
      return false;
    }
  }
}
