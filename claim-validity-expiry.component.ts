import { DatePipe } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
import { KeycloakService } from '../core/auth/keycloak.service';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { BusinessUnit } from '../models/business-unit.model';
import { Scheme, SchemeType } from '../models/scheme.model';
import { PPL } from '../models/ppl.model';
import { PL } from '../models/pl.model';
import { LOB } from '../models/lob.model';
import { VC } from '../models/vc.model';
import { Region } from '../models/region.model';
import { Area } from '../models/area.model';
import { State } from '../models/state.model';
import { Dealer } from '../models/dealer.model';
import { ClaimValidityExpiryIndividualClaim } from '../models/claim-validity-expiry-individual-claim.model';
import { ClaimValidityExpiryGroupClaim } from '../models/claim-validity-expiry-group-claim.model';
import { environment } from 'src/environments/environment';
import { Zone } from '../models/zone.model';

@Component({
  selector: 'app-claim-validity-expiry',
  templateUrl: './claim-validity-expiry.component.html',
  styleUrls: ['./claim-validity-expiry.component.scss']
})
export class ClaimValidityExpiryComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  gpager: any = {};
  gtableCount: number;
  gtableSize: number = 10;
  businessUnitList: Array<BusinessUnit> = [];
  claimTypeHardCodeList: Array<any> = [];
  schemeTypeList: Array<SchemeType> = [];
  schemeList: Array<Scheme> = [];
  lobList: Array<LOB> = [];
  pplList: Array<PPL> = [];
  plList: Array<PL> = [];
  vcList: Array<VC> = [];
  zoneList: Array<Zone> = [];
  regionList: Array<Region> = [];
  areaList: Array<Area> = [];
  stateList: Array<State> = [];
  dealerList: Array<Dealer> = [];
  businessUnit: string = "";
  selectedIndividualClaims: any;
  selectedGroupClaims: any;
  isIndividualClaim: boolean = true;
  individualClaimInputObj: any = {};
  individualClaimUpdateInputObj: any = {};
  isIndividualClaimObj: boolean = false;
  individualClaimLoading: boolean = false;
  individualClaimObj: Array<ClaimValidityExpiryIndividualClaim> = [];
  groupClaimInputObj: any = {};
  groupClaimUpdateInputObj: any = {};
  isGroupClaimObj: boolean = false;
  groupClaimLoading: boolean = false;
  groupClaimObj: Array<ClaimValidityExpiryGroupClaim> = [];
  isTMCV: boolean = true;
  isToggleSearchFilters: boolean = true;

  constructor(private claimsService: ClaimsService, 
              public sharedService: SharedService,
              private router: Router, 
              private messageService: MessageService, 
              private formBuilder: FormBuilder, 
              private datePipe: DatePipe,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    $('.loader').hide();

    this.initializeComponent();

    this.getBusinessUnit();
    this.getClaimTypeHardCoded();
  }

  initializeComponent(): void {
    jQuery('#dd_claim_validity_expiry_business_unit').dropdown();
    jQuery('#dd_claim_validity_expiry_scheme_type').dropdown();
    jQuery('#dd_claim_validity_expiry_scheme').dropdown();
    jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown();
    jQuery('#dd_claim_validity_expiry_lob').dropdown();
    jQuery('#dd_claim_validity_expiry_ppl').dropdown();
    jQuery('#dd_claim_validity_expiry_pl').dropdown();
    jQuery('#dd_claim_validity_expiry_vc').dropdown();
    jQuery('#dd_claim_validity_expiry_zone').dropdown();
    jQuery('#dd_claim_validity_expiry_region').dropdown();
    jQuery('#dd_claim_validity_expiry_area').dropdown();
    jQuery('#dd_claim_validity_expiry_state').dropdown();
    jQuery('#dd_claim_validity_expiry_dealer').dropdown();
    jQuery('#dd_claim_validity_expiry_date_type').dropdown();
    jQuery('#dd_claim_validity_expiry_individual_size').dropdown();
    jQuery('#dd_claim_validity_expiry_group_size').dropdown();

    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);

    $('#dd_claim_validity_expiry_scheme_type').on('change', () => {
      this.getScheme();
    });

    $('#dd_claim_validity_expiry_claim_type_hardcoded').on('change', () => {
      if(jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') == "IND"){
        this.isIndividualClaim = true;
      }
      else{
        this.isIndividualClaim = false;
      }
    });

    $('#dd_claim_validity_expiry_zone').on('change', () => {
      this.getRegion();
      this.getState();
    });

    $('#dd_claim_validity_expiry_region').on('change', () => {
      if(this.isTMCV){
        this.getArea();
        this.getState();
      }
      else{
        this.getDealer();
      }
    });

    $('#dd_claim_validity_expiry_area').on('change', () => {
      this.getDealer();
    });

    $('#dd_claim_validity_expiry_state').on('change', () => {
      this.getDealer();
    });

    $('#dd_claim_validity_expiry_lob').on('change', () => {
      this.getPPL();
    });

    $('#dd_claim_validity_expiry_ppl').on('change', () => {
      this.getPL();
    });

    $('#dd_claim_validity_expiry_pl').on('change', () => {
      this.getVC();
    });

    let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = new Date();
    let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
    let isEndDate: boolean = false;

    jQuery("#cal_claim_validity_expiry_start_date").calendar({
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
        if(date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_claim_validity_expiry_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_claim_validity_expiry_end_date").val().toString() == null))){
          jQuery("#cal_claim_validity_expiry_end_date").calendar("set date", date);
        }
        else if(isEndDate){
          isEndDate = false;
        }

        jQuery("#txt_claim_validity_expiry_start_date").calendar("set date", text);
      },
      endCalendar: jQuery("#cal_claim_validity_expiry_end_date")
    }).calendar("set date", new Date());

    jQuery("#cal_claim_validity_expiry_end_date").calendar({
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
        if(date != "" && date != null && date != undefined && ($("#txt_claim_validity_expiry_start_date").val().toString() == "" || $("#txt_claim_validity_expiry_end_date").val().toString() == null)){
          isEndDate = true;
          jQuery("#cal_claim_validity_expiry_start_date").calendar("set date", date);
        }

        jQuery("#txt_claim_validity_expiry_end_date").calendar("set date", text);
      },
      startCalendar: jQuery("#cal_claim_validity_expiry_start_date")
    }).calendar("set date", new Date());
  }

  getClaimTypeHardCoded(){
    $('#dd_claim_validity_expiry_claim_type_hardcoded').parent().addClass('disabled');
    $('#dd_claim_validity_expiry_claim_type_hardcoded').parent().addClass('loading');

    this.claimTypeHardCodeList[0] = new Object();
    this.claimTypeHardCodeList[0].description = "Individual Claim";
    this.claimTypeHardCodeList[0].value = "IND";

    this.claimTypeHardCodeList[1] = new Object();
    this.claimTypeHardCodeList[1].description = "Group Claim";
    this.claimTypeHardCodeList[1].value = "GRP";

    setTimeout(() => {
      $('#dd_claim_validity_expiry_claim_type_hardcoded').parent().removeClass('disabled');
      $('#dd_claim_validity_expiry_claim_type_hardcoded').parent().removeClass('loading');

      jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('set selected', this.claimTypeHardCodeList[0].value);
    }, 0);
  }

  getBusinessUnit(){
    jQuery('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

    this.claimsService.getBusinessUnit().subscribe((claimValidityExpiryResponse) => {
      if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != ""){
        for(let i = 0; i < claimValidityExpiryResponse.length; i++){
          this.businessUnitList[i] = new BusinessUnit();
          this.businessUnitList[i].text = claimValidityExpiryResponse[i].BU;
          this.businessUnitList[i].value = claimValidityExpiryResponse[i].BU;
        }

        setTimeout(() => {
          jQuery('#dd_claim_validity_expiry_business_unit').dropdown('set selected', this.businessUnitList[0].value);

          this.businessUnit = this.businessUnitList[0].value;

          this.getSchemeType();
          this.searchFilter(true);

          this.isTMCV = this.businessUnit == "TMCV" ? true : false;
          
          this.isTMCV ? this.getRegion() : this.getZone();

          this.getLOB();
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Business Unit Data', life: 7000});
    });
  }

  getSchemeType(){
    let schemeCategoryType = "RET_INS";
    let businessUnit = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');

    if(schemeCategoryType != null && schemeCategoryType != "" && businessUnit != null && businessUnit != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_scheme_type').parent().addClass('loading');
      $('#dd_claim_validity_expiry_scheme_type').parent().addClass('disabled');

      this.claimsService.getSchemeTypeList(businessUnit, schemeCategoryType).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.schemeTypeList = claimValidityExpiryResponse;
        }
        else{
          this.schemeTypeList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme Type', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        this.schemeTypeList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Type Data', life: 7000});
        }
      });
    }
  }

  getScheme(){
    let schemeType = jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('get value').join();

    if(schemeType != null && schemeType != ""){
      $('#dd_claim_validity_expiry_scheme_type').parent().addClass('loading');
      $('#dd_claim_validity_expiry_scheme_type').parent().addClass('disabled');
      
      $('#dd_claim_validity_expiry_scheme').parent().addClass('loading');
      $('#dd_claim_validity_expiry_scheme').parent().addClass('disabled');

      jQuery('#dd_claim_validity_expiry_scheme').dropdown('clear');
      jQuery('#dd_claim_validity_expiry_scheme').dropdown('restore defaults');

      this.claimsService.getAllActiveSchemes(schemeType).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.STATUS_OUT && claimValidityExpiryResponse.STATUS_OUT != null && claimValidityExpiryResponse.STATUS_OUT != "" && claimValidityExpiryResponse.STATUS_OUT == "SUCCESS" && claimValidityExpiryResponse.RESPONSE_OUT && claimValidityExpiryResponse.RESPONSE_OUT != null && claimValidityExpiryResponse.RESPONSE_OUT != "" && claimValidityExpiryResponse.RESPONSE_OUT.length > 0){
          this.schemeList = claimValidityExpiryResponse.RESPONSE_OUT;
        }
        else{
          this.schemeList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Scheme', life: 7000});
        }

        $('#dd_claim_validity_expiry_scheme').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        this.schemeList = null;

        $('#dd_claim_validity_expiry_scheme').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Scheme Data', life: 7000});
        }
      });
    }
  }

  getZone(){
    let zoneInputObj: any = {};
    zoneInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
    zoneInputObj.AppId = "RVME";

    this.zoneList = null;
    this.regionList = null;
    this.stateList = null;
    this.dealerList = null;

    jQuery('#dd_claim_validity_expiry_zone').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_region').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_state').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_dealer').dropdown('clear');

    if(zoneInputObj != null && zoneInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_zone').parent().addClass('loading');
      $('#dd_claim_validity_expiry_zone').parent().addClass('disabled');

      this.claimsService.getZone(zoneInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.zoneList = claimValidityExpiryResponse;
        }
        else{
          this.zoneList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Zone', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
      }, (error) => {
        this.zoneList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Zone Data', life: 7000});
      });
    }
  }

  getRegion(){
    let regionInputObj: any = {};
    regionInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
    regionInputObj.AppId = "RVME";

    this.regionList = null;
    this.areaList = null;
    this.isTMCV ? this.stateList = null : '';
    this.dealerList = null;

    jQuery('#dd_claim_validity_expiry_region').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_area').dropdown('clear');
    this.isTMCV ? jQuery('#dd_claim_validity_expiry_state').dropdown('clear') : '';
    jQuery('#dd_claim_validity_expiry_dealer').dropdown('clear');

    if(regionInputObj != null && regionInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_region').parent().addClass('loading');
      $('#dd_claim_validity_expiry_region').parent().addClass('disabled');

      this.claimsService.getRegion(regionInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.regionList = claimValidityExpiryResponse;
        }
        else{
          this.regionList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Region', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');
      }, (error) => {
        this.regionList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Region Data', life: 7000});
      });
    }
  }

  getArea(){      
    let regionInputObj: any = {};
    let areaInputObj: any = {};

    if(this.isTMCV){
      areaInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
      areaInputObj.pRegion = jQuery('#dd_claim_validity_expiry_region').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_region').dropdown('get value') : null;
      areaInputObj.AppId = "RVME";
      areaInputObj.pZone = null;
    }
    else {
      regionInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
      regionInputObj.pRegion = null;
      regionInputObj.AppId = "RVME";
      regionInputObj.pZone = jQuery('#dd_claim_validity_expiry_zone').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_zone').dropdown('get value') : null;
    }

    !this.isTMCV ? this.regionList = null : '';
    this.areaList = null;
    this.dealerList = null;

    !this.isTMCV ? jQuery('#dd_claim_validity_expiry_region').dropdown('clear') : '';
    jQuery('#dd_claim_validity_expiry_area').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_dealer').dropdown('clear');

    if((regionInputObj != null && regionInputObj != "" && (regionInputObj.pZone != null && regionInputObj.pZone != "")) || (areaInputObj != null && areaInputObj != "" && (areaInputObj.pRegion != null && areaInputObj.pRegion != ""))){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_region').parent().addClass('loading');
      $('#dd_claim_validity_expiry_region').parent().addClass('disabled');

      if(this.isTMCV){
        $('#dd_claim_validity_expiry_area').parent().addClass('loading');
        $('#dd_claim_validity_expiry_area').parent().addClass('disabled');
      } 
      else{
        $('#dd_claim_validity_expiry_zone').parent().addClass('loading');
        $('#dd_claim_validity_expiry_zone').parent().addClass('disabled');
      }

      this.claimsService.getArea(this.isTMCV ? areaInputObj : regionInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.isTMCV ? this.areaList = claimValidityExpiryResponse : this.regionList = claimValidityExpiryResponse;
        }
        else{
          this.isTMCV ? this.areaList = null : this.regionList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          
          let message: string = this.isTMCV ? 'No Data Available for Area' : 'No Data Available for Area';

          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail: message, life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_area').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_area').parent().removeClass('disabled');
        } 
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }
      }, (error) => {
        this.isTMCV ? this.areaList = null : this.regionList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_area').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_area').parent().removeClass('disabled');
        } 
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }

        let message: string = this.isTMCV ? 'Error Getting Area Data' : 'Error Getting Region Data';

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: message, life: 7000});
      });
    }
  }

  getState(){
    let stateInputObj: any = {};
    stateInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
    stateInputObj.AppId = "RVME";

    if(this.isTMCV){
      stateInputObj.pRegion = jQuery('#dd_claim_validity_expiry_region').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_region').dropdown('get value') : null;
      stateInputObj.pZone = null;
    } 
    else{
      stateInputObj.pRegion = null;
      stateInputObj.pZone = jQuery('#dd_claim_validity_expiry_zone').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_zone').dropdown('get value') : null;
    }

    this.stateList = null;
    this.dealerList = null;

    jQuery('#dd_claim_validity_expiry_state').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_dealer').dropdown('clear');

    if(stateInputObj != null && stateInputObj != "" && ((stateInputObj.pRegion != null && stateInputObj.pRegion != "") || (stateInputObj.pZone != null && stateInputObj.pZone != ""))){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_state').parent().addClass('loading');
      $('#dd_claim_validity_expiry_state').parent().addClass('disabled');

      if(this.isTMCV){
        $('#dd_claim_validity_expiry_region').parent().addClass('loading');
        $('#dd_claim_validity_expiry_region').parent().addClass('disabled');
      }
      else{
        $('#dd_claim_validity_expiry_zone').parent().addClass('loading');
        $('#dd_claim_validity_expiry_zone').parent().addClass('disabled');
      }

      this.claimsService.getState(stateInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.stateList = claimValidityExpiryResponse;
        }
        else{
          this.stateList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for State', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_state').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_state').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');
        }
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }
      }, (error) => {
        this.stateList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_state').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_state').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');
        }
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting State Data', life: 7000});
      });
    }
  }

  getDealer(){
    let dealerInputObj: any = {};
    dealerInputObj.pBU = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
    dealerInputObj.AppId = "RVME";

    if(this.isTMCV){
      dealerInputObj.pState = jQuery('#dd_claim_validity_expiry_state').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_state').dropdown('get value') : null;
      dealerInputObj.pArea = jQuery('#dd_claim_validity_expiry_area').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_area').dropdown('get value') : null;
      dealerInputObj.pRegion = jQuery('#dd_claim_validity_expiry_region').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_region').dropdown('get value') : null;
      dealerInputObj.pZone = null;
    }
    else{
      dealerInputObj.pState = jQuery('#dd_claim_validity_expiry_state').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_state').dropdown('get value') : null;
      dealerInputObj.pArea = jQuery('#dd_claim_validity_expiry_area').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_area').dropdown('get value') : null;
      dealerInputObj.pRegion = null;
      dealerInputObj.pZone = jQuery('#dd_claim_validity_expiry_zone').dropdown('get value').length > 0 ? jQuery('#dd_claim_validity_expiry_zone').dropdown('get value') : null;
    };

    this.dealerList = null;

    jQuery('#dd_claim_validity_expiry_dealer').dropdown('clear');

    if(dealerInputObj != null && dealerInputObj != "" && ((dealerInputObj.pState != null && dealerInputObj.pState != "") || (dealerInputObj.pArea != null && dealerInputObj.pArea != ""))){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      if(this.isTMCV){
        $('#dd_claim_validity_expiry_area').parent().addClass('loading');
        $('#dd_claim_validity_expiry_area').parent().addClass('disabled');
      }
      else{
        $('#dd_claim_validity_expiry_zone').parent().addClass('loading');
        $('#dd_claim_validity_expiry_zone').parent().addClass('disabled');
      }

      $('#dd_claim_validity_expiry_region').parent().addClass('loading');
      $('#dd_claim_validity_expiry_region').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_state').parent().addClass('loading');
      $('#dd_claim_validity_expiry_state').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_dealer').parent().addClass('loading');
      $('#dd_claim_validity_expiry_dealer').parent().addClass('disabled');

      this.claimsService.getDealer(dealerInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.dealerList = claimValidityExpiryResponse;
        }
        else{
          this.dealerList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Dealer', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_area').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_area').parent().removeClass('disabled');
        }
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }
  
        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');
  
        $('#dd_claim_validity_expiry_state').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_state').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_dealer').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_dealer').parent().removeClass('disabled');
      }, (error) => {
        this.dealerList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        if(this.isTMCV){
          $('#dd_claim_validity_expiry_area').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_area').parent().removeClass('disabled');
        }
        else{
          $('#dd_claim_validity_expiry_zone').parent().removeClass('loading');
          $('#dd_claim_validity_expiry_zone').parent().removeClass('disabled');
        }
  
        $('#dd_claim_validity_expiry_region').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_region').parent().removeClass('disabled');
  
        $('#dd_claim_validity_expiry_state').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_state').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_dealer').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_dealer').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Dealer Data', life: 7000});
      });
    }
  }

  getLOB(){
    let lobInputObj = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value').split(",");

    this.lobList = null;
    this.pplList = null;
    this.plList = null;
    this.vcList = null;

    jQuery('#dd_claim_validity_expiry_lob').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_ppl').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_pl').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_vc').dropdown('clear');

    if(lobInputObj != null && lobInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_lob').parent().addClass('loading');
      $('#dd_claim_validity_expiry_lob').parent().addClass('disabled');

      this.claimsService.getLOB(lobInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.lobList = claimValidityExpiryResponse;
        }
        else{
          this.lobList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for LOB', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');
      }, (error) => {
        this.lobList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting LOB Data', life: 7000});
        }
      });
    }
  }

  getPPL(){
    let pplInputObj = jQuery('#dd_claim_validity_expiry_lob').dropdown('get value');

    this.pplList = null;
    this.plList = null;
    this.vcList = null;

    jQuery('#dd_claim_validity_expiry_ppl').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_pl').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_vc').dropdown('clear');

    if(pplInputObj != null && pplInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_lob').parent().addClass('loading');
      $('#dd_claim_validity_expiry_lob').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_ppl').parent().addClass('loading');
      $('#dd_claim_validity_expiry_ppl').parent().addClass('disabled');

      this.claimsService.getPPL(pplInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.pplList = claimValidityExpiryResponse;
        }
        else{
          this.pplList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for PPL', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');
      }, (error) => {
        this.pplList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: 'Error Getting PPL Data', life: 7000});
        }
      });
    }
  }

  getPL(){
    let plInputObj = jQuery('#dd_claim_validity_expiry_ppl').dropdown('get value');

    this.plList = null;
    this.vcList = null;

    jQuery('#dd_claim_validity_expiry_pl').dropdown('clear');
    jQuery('#dd_claim_validity_expiry_vc').dropdown('clear');

    if(plInputObj != null && plInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_lob').parent().addClass('loading');
      $('#dd_claim_validity_expiry_lob').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_ppl').parent().addClass('loading');
      $('#dd_claim_validity_expiry_ppl').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_pl').parent().addClass('loading');
      $('#dd_claim_validity_expiry_pl').parent().addClass('disabled');

      this.claimsService.getPL(plInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.plList = claimValidityExpiryResponse;
        }
        else{
          this.plList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for PL', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_pl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_pl').parent().removeClass('disabled');
      }, (error) => {
        this.plList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_pl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_pl').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: 'Error Getting PL Data', life: 7000});
        }
      });
    }
  }

  getVC(){
    let vcInputObj = jQuery('#dd_claim_validity_expiry_pl').dropdown('get value');

    this.vcList = null;

    jQuery('#dd_claim_validity_expiry_vc').dropdown('clear');

    if(vcInputObj != null && vcInputObj != ""){
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('loading');
      $('#dd_claim_validity_expiry_business_unit').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_lob').parent().addClass('loading');
      $('#dd_claim_validity_expiry_lob').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_ppl').parent().addClass('loading');
      $('#dd_claim_validity_expiry_ppl').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_pl').parent().addClass('loading');
      $('#dd_claim_validity_expiry_pl').parent().addClass('disabled');

      $('#dd_claim_validity_expiry_vc').parent().addClass('loading');
      $('#dd_claim_validity_expiry_vc').parent().addClass('disabled');

      this.claimsService.getVC(vcInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse != null && claimValidityExpiryResponse != "" && claimValidityExpiryResponse.length > 0){
          this.vcList = claimValidityExpiryResponse;
        }
        else{
          this.vcList = null;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for VC', life: 7000});
        }

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_pl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_pl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_vc').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_vc').parent().removeClass('disabled');
      }, (error) => {
        this.plList = null;

        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_business_unit').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_lob').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_lob').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_ppl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_ppl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_pl').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_pl').parent().removeClass('disabled');

        $('#dd_claim_validity_expiry_vc').parent().removeClass('loading');
        $('#dd_claim_validity_expiry_vc').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: 'Error Getting VC Data', life: 7000});
        }
      });
    }
  }

  clearFilter(){
    jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_scheme').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_lob').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_ppl').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_pl').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_vc').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_zone').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_region').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_area').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_state').dropdown('restore defaults');
    jQuery('#dd_claim_validity_expiry_dealer').dropdown('restore defaults');

    this.schemeList = [];

    $('#txt_claim_validity_expiry_claim_id').val('');
    $('#txt_claim_validity_expiry_group_claim_id').val('');
    $('#txt_claim_validity_expiry_chassis_no').val('');

    jQuery("#cal_claim_validity_expiry_start_date").calendar("set date", new Date());
    jQuery("#cal_claim_validity_expiry_end_date").calendar("set date", new Date());
    
    this.searchFilter(true);
  }

  searchFilter(flag){
    this.selectedIndividualClaims = [];
    this.selectedGroupClaims = [];

    this.individualClaimInputObj = new Object();
    this.groupClaimInputObj = new Object();

    if(jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value') != ""){
      this.individualClaimInputObj.pBU_ID = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
      this.groupClaimInputObj.pBU_ID = jQuery('#dd_claim_validity_expiry_business_unit').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pBU_ID = '';
      this.groupClaimInputObj.pBU_ID = '';
    }

    if(jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('get value') != ""){
      this.individualClaimInputObj.pSTM_ID  = jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('get value');
      this.groupClaimInputObj.pSTM_ID  = jQuery('#dd_claim_validity_expiry_scheme_type').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSTM_ID  = [];
      this.groupClaimInputObj.pSTM_ID  = [];
    }

    if(jQuery('#dd_claim_validity_expiry_scheme').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_scheme').dropdown('get value') != ""){
      this.individualClaimInputObj.pSCHEME_ID = jQuery('#dd_claim_validity_expiry_scheme').dropdown('get value');
      this.groupClaimInputObj.pSCHEME_ID = jQuery('#dd_claim_validity_expiry_scheme').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSCHEME_ID = [];
      this.groupClaimInputObj.pSCHEME_ID = [];
    }

    if(jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') == "IND"){
      this.individualClaimInputObj.pCLAIM_ID = $('#txt_claim_validity_expiry_claim_id').val().toString().trim() != null && $('#txt_claim_validity_expiry_claim_id').val().toString().trim() != "" ? $('#txt_claim_validity_expiry_claim_id').val().toString().trim().split(',') : [];
      this.groupClaimInputObj.pGCLAIM_ID = [];
    }
    else{
      this.individualClaimInputObj.pCLAIM_ID = [];
      this.groupClaimInputObj.pGCLAIM_ID = $('#txt_claim_validity_expiry_group_claim_id').val().toString().trim() != null && $('#txt_claim_validity_expiry_group_claim_id').val().toString().trim() != "" ? $('#txt_dealer_dashboard_group_claim_id').val().toString().trim().split(',') : [];
    }

    if($('#txt_claim_validity_expiry_chassis_no').val().toString().trim() != null && $('#txt_claim_validity_expiry_chassis_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pCHASSIS_NO = $('#txt_claim_validity_expiry_chassis_no').val().toString().trim().split(',');
      this.groupClaimInputObj.pCHASSIS_NO = $('#txt_claim_validity_expiry_chassis_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pCHASSIS_NO = [];
      this.groupClaimInputObj.pCHASSIS_NO = [];
    }

    if(jQuery('#dd_claim_validity_expiry_zone').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_zone').dropdown('get value') != ""){
      this.individualClaimInputObj.pRegion = jQuery('#dd_claim_validity_expiry_zone').dropdown('get value');
      this.groupClaimInputObj.pRegion = jQuery('#dd_claim_validity_expiry_zone').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pRegion = [];
      this.groupClaimInputObj.pRegion = [];
    }

    if(jQuery('#dd_claim_validity_expiry_region').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_region').dropdown('get value') != ""){
      this.isTMCV ? this.individualClaimInputObj.pRegion = jQuery('#dd_claim_validity_expiry_region').dropdown('get value') : this.individualClaimInputObj.pArea = jQuery('#dd_claim_validity_expiry_region').dropdown('get value');
      this.isTMCV ? this.groupClaimInputObj.pRegion = jQuery('#dd_claim_validity_expiry_region').dropdown('get value') : this.groupClaimInputObj.pArea = jQuery('#dd_claim_validity_expiry_region').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pRegion = [];
      this.groupClaimInputObj.pRegion = [];
    }

    if(jQuery('#dd_claim_validity_expiry_area').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_area').dropdown('get value') != ""){
      this.isTMCV ? this.individualClaimInputObj.pArea = jQuery('#dd_claim_validity_expiry_area').dropdown('get value') : [];
      this.isTMCV ? this.groupClaimInputObj.pArea = jQuery('#dd_claim_validity_expiry_area').dropdown('get value') : [];
    }
    else{
      this.individualClaimInputObj.pArea = [];
      this.groupClaimInputObj.pArea = [];
    }

    if(jQuery('#dd_claim_validity_expiry_state').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_state').dropdown('get value') != ""){
      this.individualClaimInputObj.pState = jQuery('#dd_claim_validity_expiry_state').dropdown('get value');
      this.groupClaimInputObj.pState = jQuery('#dd_claim_validity_expiry_state').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pState = [];
      this.groupClaimInputObj.pState = [];
    }

    if(jQuery('#dd_claim_validity_expiry_dealer').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_dealer').dropdown('get value') != ""){
      this.individualClaimInputObj.pDEALER_CODE = jQuery('#dd_claim_validity_expiry_dealer').dropdown('get value').join();
      this.groupClaimInputObj.pDEALER_CODE = jQuery('#dd_claim_validity_expiry_dealer').dropdown('get value').join();
    }
    else{
      this.individualClaimInputObj.pDEALER_CODE = "";
      this.groupClaimInputObj.pDEALER_CODE = "";
    }

    if(jQuery('#dd_claim_validity_expiry_lob').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_lob').dropdown('get value') != ""){
      this.individualClaimInputObj.pLOB = this.lobList.filter((lobItem) => jQuery('#dd_claim_validity_expiry_lob').dropdown('get value').includes(lobItem.fincode)).map((item) => item.vclob);
      this.groupClaimInputObj.pLOB = this.lobList.filter((lobItem) => jQuery('#dd_claim_validity_expiry_lob').dropdown('get value').includes(lobItem.fincode)).map((item) => item.vclob)
    }
    else{
      this.individualClaimInputObj.pLOB = [];
      this.groupClaimInputObj.pLOB = [];
    }

    if(jQuery('#dd_claim_validity_expiry_ppl').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_ppl').dropdown('get value') != ""){
      this.individualClaimInputObj.pPPL = this.pplList.filter((pplItem) => jQuery('#dd_claim_validity_expiry_ppl').dropdown('get value').includes(pplItem.fincode)).map((item) => item.vcppl);
      this.groupClaimInputObj.pPPL = this.pplList.filter((pplItem) => jQuery('#dd_claim_validity_expiry_ppl').dropdown('get value').includes(pplItem.fincode)).map((item) => item.vcppl);
    }
    else{
      this.individualClaimInputObj.pPPL = [];
      this.groupClaimInputObj.pPPL = [];
    }

    if(jQuery('#dd_claim_validity_expiry_pl').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_pl').dropdown('get value') != ""){
      this.individualClaimInputObj.pPL = this.plList.filter((plItem) => jQuery('#dd_claim_validity_expiry_pl').dropdown('get value').includes(plItem.fincode)).map((item) => item.vcpl);
      this.groupClaimInputObj.pPL = this.plList.filter((plItem) => jQuery('#dd_claim_validity_expiry_pl').dropdown('get value').includes(plItem.fincode)).map((item) => item.vcpl);
    }
    else{
      this.individualClaimInputObj.pPL = [];
      this.groupClaimInputObj.pPL = [];
    }

    if(jQuery('#dd_claim_validity_expiry_vc').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_vc').dropdown('get value') != ""){
      this.individualClaimInputObj.pVC = this.vcList.filter((vcItem) => jQuery('#dd_claim_validity_expiry_vc').dropdown('get value').includes(vcItem.fincode)).map((item) => item.desctext);
      this.groupClaimInputObj.pVC = this.vcList.filter((vcItem) => jQuery('#dd_claim_validity_expiry_vc').dropdown('get value').includes(vcItem.fincode)).map((item) => item.desctext);
    }
    else{
      this.individualClaimInputObj.pVC = [];
      this.groupClaimInputObj.pVC = [];
    }

    if(jQuery('#dd_claim_validity_expiry_date_type').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_date_type').dropdown('get value') != "" && jQuery('#dd_claim_validity_expiry_date_type').dropdown('get value') != "NA"){
      this.individualClaimInputObj.pDATE_TYPE = jQuery('#dd_claim_validity_expiry_date_type').dropdown('get value');
      this.groupClaimInputObj.pDATE_TYPE = jQuery('#dd_claim_validity_expiry_date_type').dropdown('get value');

      this.individualClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_claim_validity_expiry_start_date').val()),'dd-MMM-yyyy');
      this.individualClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_claim_validity_expiry_end_date').val()),'dd-MMM-yyyy');

      this.groupClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_claim_validity_expiry_start_date').val()),'dd-MMM-yyyy');
      this.groupClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_claim_validity_expiry_end_date').val()),'dd-MMM-yyyy');
    }
    else{
      this.individualClaimInputObj.pDATE_TYPE = '';
      this.groupClaimInputObj.pDATE_TYPE = '';

      this.individualClaimInputObj.pFROM_DATE = '';
      this.individualClaimInputObj.pTO_DATE = '';

      this.groupClaimInputObj.pFROM_DATE = '';
      this.groupClaimInputObj.pTO_DATE = '';
    }

    this.individualClaimInputObj.pCLAIM_TYPE = '';
    this.groupClaimInputObj.pCLAIM_TYPE = '';
    this.individualClaimInputObj.pCUST_ROLE = '';
    this.groupClaimInputObj.pCUST_ROLE = '';
    this.individualClaimInputObj.pSTATUS_ID = '';
    this.groupClaimInputObj.pSTATUS_ID = '';
    this.individualClaimInputObj.pMONTH_YEAR = '';
    this.groupClaimInputObj.pMONTH_YEAR = '';
    this.individualClaimInputObj.pSCHEME_NAME = '';
    this.groupClaimInputObj.pSCHEME_NAME = '';
    this.individualClaimInputObj.pST_DESC = '';
    this.groupClaimInputObj.pST_DESC = '';
    this.individualClaimInputObj.pROLE_DESCRIPTION = '';
    this.groupClaimInputObj.pROLE_DESCRIPTION = '';
    this.individualClaimInputObj.pPOSITION = '';
    this.groupClaimInputObj.pPOSITION = '';

    if(!flag && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') == "IND"){
      this.getIndividualClaims();
    }
    else if(!flag && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_claim_validity_expiry_claim_type_hardcoded').dropdown('get value') == "GRP"){
      this.getGroupClaims();
    }
    else{
      this.getIndividualClaims();
      this.getGroupClaims();
    }
  }

  getIndividualClaims(){
    $('.loader').show();
    this.isIndividualClaimObj = false;

    document.getElementById('claimValidityExpiryIndividualClaimTable').scrollLeft = 0;

    this.individualClaimInputObj.pageNumber = '1';
    this.individualClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getClaimValidityExpiryIndividualClaims(this.individualClaimInputObj).subscribe((claimValidityExpiryResponse) => {
      if(claimValidityExpiryResponse && claimValidityExpiryResponse.STATUS_OUT === "SUCCESS" && claimValidityExpiryResponse.RESPONSE_OUT.count > 0){
        this.tableCount = claimValidityExpiryResponse.RESPONSE_OUT.count;
        this.individualClaimObj = claimValidityExpiryResponse.RESPONSE_OUT.list;
        this.isIndividualClaimObj = true;

        setTimeout(() => {
          let nextDate = claimValidityExpiryResponse.RESPONSE_OUT.todayDate != null && claimValidityExpiryResponse.RESPONSE_OUT.todayDate != "" ? new Date(claimValidityExpiryResponse.RESPONSE_OUT.todayDate) : new Date();
          nextDate.setDate(nextDate.getDate() + 1);

          this.bindDatePicker(this.individualClaimObj, "individual", nextDate);
        }, 0);
      }
      else{
        this.individualClaimObj = [];
        this.tableCount = 0;
        this.isIndividualClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
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
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
      }
    });
  }

  individualClaimSizeChanged(event){
    jQuery('#dd_claim_validity_expiry_individual_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setIndividualClaimPage(1);
  }

  setIndividualClaimPage(page: number){
    if(this.individualClaimInputObj != null){
      $('.loader').show();
      this.isIndividualClaimObj = false;
      this.selectedIndividualClaims = [];

      if (page < 1 || page > this.pager.totalPages) {
        this.individualClaimLoading = false;
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.individualClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.individualClaimInputObj.pageSize = this.pager.pageSize.toString();

      this.claimsService.getClaimValidityExpiryIndividualClaims(this.individualClaimInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse.STATUS_OUT === "SUCCESS"){
          this.individualClaimObj = claimValidityExpiryResponse.RESPONSE_OUT.list;
          this.isIndividualClaimObj = true;

          setTimeout(() => {
            let nextDate = claimValidityExpiryResponse.RESPONSE_OUT.todayDate != null && claimValidityExpiryResponse.RESPONSE_OUT.todayDate != "" ? new Date(claimValidityExpiryResponse.RESPONSE_OUT.todayDate) : new Date();
            nextDate.setDate(nextDate.getDate() + 1);

            this.bindDatePicker(this.individualClaimObj, "individual", nextDate);
          }, 0);
        }
        else{
          this.tableCount = 0;
          this.individualClaimObj = null;
          this.isIndividualClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
        }
      });
    }
  }

  updateIndividualClaim(){
    if(this.individualClaimUpdateInputObj != null && this.individualClaimUpdateInputObj != "" && this.individualClaimUpdateInputObj.length > 0){
      this.confirmationService.confirm({
        message: 'Do You Want to Update Expiry Date?',
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          this.claimsService.putClaimValidityExpiryIndividualClaims(this.individualClaimUpdateInputObj).subscribe((claimValidityExpiryResponse) => {
            if(claimValidityExpiryResponse && claimValidityExpiryResponse != "" && claimValidityExpiryResponse != null && claimValidityExpiryResponse.STATUS_OUT && claimValidityExpiryResponse.STATUS_OUT != "" && claimValidityExpiryResponse.STATUS_OUT != null && claimValidityExpiryResponse.STATUS_OUT == "SUCCESS"){
              let successClaimId: Array<string> = [], failedClaimId: Array<string> = [];

              successClaimId = claimValidityExpiryResponse.RESPONSE_OUT.successList;
              failedClaimId = claimValidityExpiryResponse.RESPONSE_OUT.failedList;
              
              if(successClaimId.length > 0){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'claimValidityExpiryMessage', severity:'success', summary: 'Success', detail: "Expiry Date Updated Successfully. Claim Id" + successClaimId.join(), life: 7000});
              }

              if(failedClaimId.length > 0){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: "Expiry Date Update Failed. Claim Id" + failedClaimId.join(), life: 7000}); 
              }

              this.getIndividualClaims();
            }
            else{
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claims Expiry', life: 7000});
            }
            $('.loader').hide();
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{ 
              this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claims Expiry', life: 7000});
            }
          });
        },
        key: 'claimValidityExpiryDialog'
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimValidityExpiryMessage', severity: 'info', summary: 'Note', detail: 'Please Select Atleast 1 Claim', life: 7000});
    }
  }

  getSelectedIndividualClaimId() {
    let count: number = 0, selectedCount: number = 0;
    let selectedIndividualClaims: any;
    let claimId: string = "";

    this.individualClaimUpdateInputObj = [];
    selectedIndividualClaims = JSON.parse(JSON.stringify(this.selectedIndividualClaims));

    selectedIndividualClaims.map((item) => {
      if(item.expiry_DATE != null && item.expiry_DATE != ""){
        this.individualClaimUpdateInputObj[count] = new Object();
        this.individualClaimUpdateInputObj[count].claimId = item.claim_ID;
        this.individualClaimUpdateInputObj[count].expiryDate = item.expiry_DATE;
  
        count++;
      }
      else{
        selectedIndividualClaims.splice(selectedCount, 1);
        claimId = claimId + item.claim_ID + ", ";
      }

      selectedCount++;
    });

    this.selectedIndividualClaims.length = 0;
    this.selectedIndividualClaims = selectedIndividualClaims;

    if(claimId != null && claimId != ""){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimValidityExpiryMessage', severity: 'info', summary: 'Note', detail: 'Expiry Date Not Available for Claim Id: ' + claimId.substring(0, claimId.length - 2), life: 7000});
    }
  }

  getGroupClaims(){
    $('.loader').show();
    this.isGroupClaimObj = false;
    
    document.getElementById('claimValidityExpiryGroupClaimTable').scrollLeft = 0;

    this.groupClaimInputObj.pageNumber = '1';
    this.groupClaimInputObj.pageSize = this.gtableSize.toString();

    this.claimsService.getClaimValidityExpiryGroupClaims(this.groupClaimInputObj).subscribe((claimValidityExpiryResponse) => {
      if(claimValidityExpiryResponse && claimValidityExpiryResponse.STATUS_OUT === "SUCCESS" && claimValidityExpiryResponse.RESPONSE_OUT.count > 0){
        this.gtableCount = claimValidityExpiryResponse.RESPONSE_OUT.count;
        this.groupClaimObj = claimValidityExpiryResponse.RESPONSE_OUT.list;
        this.isGroupClaimObj = true;

        setTimeout(() => {
          let nextDate = claimValidityExpiryResponse.RESPONSE_OUT.todayDate != null && claimValidityExpiryResponse.RESPONSE_OUT.todayDate != "" ? new Date(claimValidityExpiryResponse.RESPONSE_OUT.todayDate) : new Date();
          nextDate.setDate(nextDate.getDate() + 1);

          this.bindDatePicker(this.groupClaimObj, "group", nextDate);
        }, 0);
      }
      else{
        this.groupClaimObj = [];
        this.gtableCount = 0;
        this.isGroupClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Group Claims', life: 7000});
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
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claims Data', life: 7000});
      }
    });
  }

  groupClaimSizeChanged(event){
    jQuery('#dd_claim_validity_expiry_group_size').dropdown('set selected', event.target.value);
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

      this.claimsService.getClaimValidityExpiryGroupClaims(this.groupClaimInputObj).subscribe((claimValidityExpiryResponse) => {
        if(claimValidityExpiryResponse && claimValidityExpiryResponse.STATUS_OUT === "SUCCESS"){
          this.groupClaimObj = claimValidityExpiryResponse.RESPONSE_OUT.list;
          this.isGroupClaimObj = true;

          setTimeout(() => {
            let nextDate = claimValidityExpiryResponse.RESPONSE_OUT.todayDate != null && claimValidityExpiryResponse.RESPONSE_OUT.todayDate != "" ? new Date(claimValidityExpiryResponse.RESPONSE_OUT.todayDate) : new Date();
            nextDate.setDate(nextDate.getDate() + 1);

            this.bindDatePicker(this.groupClaimObj, "group", nextDate);
          }, 0);
        }
        else{
          this.gtableCount = 0;
          this.groupClaimObj = null;
          this.isGroupClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'info', summary: 'Note', detail:'No Data Available for Group Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claims Data', life: 7000});
        }
      });
    }
  }

  updateGroupClaim(){
    if(this.groupClaimUpdateInputObj != null && this.groupClaimUpdateInputObj != "" && this.groupClaimUpdateInputObj.length > 0){
      this.confirmationService.confirm({
        message: 'Do You Want to Update Expiry Date?',
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          this.claimsService.putClaimValidityExpiryGroupClaims(this.groupClaimUpdateInputObj).subscribe((claimValidityExpiryResponse) => {
            if(claimValidityExpiryResponse && claimValidityExpiryResponse != "" && claimValidityExpiryResponse != null && claimValidityExpiryResponse.STATUS_OUT && claimValidityExpiryResponse.STATUS_OUT != "" && claimValidityExpiryResponse.STATUS_OUT != null && claimValidityExpiryResponse.STATUS_OUT == "SUCCESS"){
              let successClaimId: Array<string> = [], failedClaimId: Array<string> = [];

              successClaimId = claimValidityExpiryResponse.RESPONSE_OUT.successList;
              failedClaimId = claimValidityExpiryResponse.RESPONSE_OUT.failedList;
              
              if(successClaimId.length > 0){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'claimValidityExpiryMessage', severity:'success', summary: 'Success', detail: "Expiry Date Updated Successfully. Claim Id" + successClaimId.join(), life: 7000});
              }

              if(failedClaimId.length > 0){
                $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail: "Expiry Date Update Failed. Claim Id" + failedClaimId.join(), life: 7000}); 
              }
    
              this.getGroupClaims();
            }
            else{
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claims Expiry', life: 7000});
            }
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'claimValidityExpiryMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{ 
              this.messageService.add({key: 'claimValidityExpiryMessage', severity:'error', summary: 'Error', detail:'Error Updating Group Claims Expiry', life: 7000});
            }
          });
        },
        key: 'claimValidityExpiryDialog'
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimValidityExpiryMessage', severity: 'info', summary: 'Note', detail: 'Please Select Atleast 1 Claim', life: 7000});
    }
  }

  getSelectedGroupClaimId() {
    let count: number = 0, selectedCount: number = 0;
    let selectedGroupClaims: any;
    let claimId: string = "";

    this.groupClaimUpdateInputObj = [];
    selectedGroupClaims = JSON.parse(JSON.stringify(this.selectedGroupClaims));

    selectedGroupClaims.map((item) => {
      if(item.expiry_DATE != null && item.expiry_DATE != ""){
        this.groupClaimUpdateInputObj[count] = new Object();
        this.groupClaimUpdateInputObj[count].gclaimId = item.g_CLAIM_ID;
        this.groupClaimUpdateInputObj[count].expiryDate = item.expiry_DATE;
  
        count++;
      }
      else{
        selectedGroupClaims.splice(selectedCount, 1);
        claimId = claimId + item.claim_ID + ", ";
      }

      selectedCount++;
    });

    this.selectedGroupClaims.length = 0;
    this.selectedGroupClaims = selectedGroupClaims;

    if(claimId != null && claimId != ""){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimValidityExpiryMessage', severity: 'info', summary: 'Note', detail: 'Expiry Date Not Available for Claim Id: ' + claimId.substring(0, claimId.length - 2), life: 7000});
    }
  }

  bindDatePicker(claimObj, type, nextDate){
    for (let i = 0; i < claimObj.length; i++) {
      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_claim_validity_expiry_" + type + "_date_" + [i]).calendar({
        type: "date",
        formatter: {
          date: function (date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          },
        },
        popupOptions: {
          position: 'bottom left',
          lastResort: 'bottom left',
          prefer: 'opposite',
          hideOnScroll: false
        },
        onChange: (date, text, mode) => {
          $("#txt_claim_validity_expiry_" + type + "_date_" + [i]).val(text);
          
          if(type == "individual"){
            let selectedIndividualClaims: any = JSON.parse(JSON.stringify(this.selectedIndividualClaims));

            selectedIndividualClaims.splice(selectedIndividualClaims.map((item) => item.claim_ID).indexOf(this.individualClaimObj[i].claim_ID), 1);
            
            this.selectedIndividualClaims = 0;
            this.selectedIndividualClaims = selectedIndividualClaims;

            setTimeout(() => {
              this.individualClaimObj[i].expiry_DATE = text;
            }, 0);
          }
          else{
            let selectedGroupClaims: any = JSON.parse(JSON.stringify(this.selectedGroupClaims));

            selectedGroupClaims.splice(selectedGroupClaims.map((item) => item.claim_ID).indexOf(this.groupClaimObj[i].g_CLAIM_ID), 1);
            
            this.selectedGroupClaims = 0;
            this.selectedGroupClaims = selectedGroupClaims;

            setTimeout(() => {
              this.groupClaimObj[i].expiry_DATE = text;
            }, 0);
          }
        },
        startCalendar: nextDate
      }).calendar("set date", claimObj[i].expiry_DATE != null && claimObj[i].expiry_DATE != "" ? this.datePipe.transform(claimObj[i].expiry_DATE, 'dd-MMM-yyyy') : "");
    }
  }

  openIndividualClaimView(chassisNo, schemeId, claimId){
    jQuery('#model_claim_validity_expiry_individual_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.individualClaimViewUrl = "";

    setTimeout(() => {
      this.sharedService.individualClaimViewUrl = environment.CLAIMSANGULARURL + '/claimstabsview?chassisNo=' + chassisNo + '&schemeId=' + schemeId +'&claimId=' + claimId + '&messageKey=claimValidityExpiryMessage';
    }, 0);
  }

  closeIndividualClaimView(){
    this.sharedService.individualClaimViewUrl = "";
  }

  openGroupClaimView(ppl, schemeId, groupClaimId){
    jQuery('#modal_claim_validity_expiry_group_claim_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.groupClaimViewUrl = "";

    setTimeout(() => {
      this.sharedService.groupClaimViewUrl = environment.CLAIMSANGULARURL + '/groupclaimapproverviewtab?ppl=' + ppl + '&schemeId=' + schemeId + '&groupClaimId=' + groupClaimId + '&messageKey=claimValidityExpiryMessage';
    }, 0);
  }

  closeGroupClaimView(){
    this.sharedService.groupClaimViewUrl = "";
  }

  openChassisView(chassisNo){
    jQuery('#modal_claim_validity_expiry_chassis_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.chassisViewUrl = "";

    setTimeout(() => {
      this.sharedService.chassisViewUrl = environment.CLAIMSANGULARURL + '/chassistabsview?chassisNo=' + chassisNo;
    }, 0);
  }

  closeChassisView(){
    this.sharedService.chassisViewUrl = "";
  }

  openSchemeView(schemeId){
    jQuery('#model_claim_validity_expiry_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.sharedService.schemeViewUrl = "";

    setTimeout(() => {
      this.sharedService.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView(){
    this.sharedService.schemeViewUrl = "";
  }

  toggleSearchFilters(){
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }
}
