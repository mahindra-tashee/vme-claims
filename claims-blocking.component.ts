import { DatePipe } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import * as $ from "jquery";
declare var jQuery: any;

import { BusinessUnit } from '../models/business-unit.model';
import { GeoMapping } from '../models/geo-mapping.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { IndividualClaim } from '../models/individual-claim.model';
import { ClaimDealerTabsViewComponent } from '../claim-dealer-tabs-view/claim-dealer-tabs-view.component';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';
import { environment } from 'src/environments/environment';
import { GroupClaim } from '../models/group-claim.model';
import { GroupClaimViewTabComponent } from '../group-claim-view-tab/group-claim-view-tab.component';
import { Position } from '../models/position.model';
import { Role } from '../models/role.model';
import { Scheme, SchemeType } from '../models/scheme.model';
import { IndBlockingUpdate } from '../models/ind-blocking-update.model';

@Component({
  selector: 'app-claims-blocking',
  templateUrl: './claims-blocking.component.html',
  styleUrls: ['./claims-blocking.component.scss']
})
export class ClaimsBlockingComponent implements OnInit {
  isToggleSearchFilters: boolean = false;
  geoMappingList: Array<GeoMapping> = [];
  businessUnitList: Array<BusinessUnit> = [];
  roleList: Array<Role> = [];
  positionList: Array<Position> = [];
  schemeTypeList: Array<SchemeType> = [];
  schemeList: Array<Scheme> = [];
  businessUnit: string = "";
  role: string = "";
  position: string = "";
  isGroupClaim: boolean = false;
  isBlock: boolean = true;
  isUnblock: boolean = false;
  isUnblockBlock: boolean = false;
  isBlockCriteriaSelected: boolean = false;
  isUnblockCriteriaSelected: boolean = false;
  tableSize: number = 10;
  gtableSize: number = 10;
  btableSize: number = 10;
  pager: any = {};
  gpager: any = {};
  bpager: any = {};
  tableCount: number;
  gtableCount: number;
  btableCount: number;
  selectedIndividualClaims: any;
  selectedGroupClaims: any;
  selectedCriteriaBlockClaims: any;
  isIndividualClaim: boolean = true;
  individualClaimInputObj: any = {};
  isIndividualClaimObj: boolean = false;
  individualClaimLoading: boolean = false;
  individualClaimObj: Array<IndividualClaim> = [];
  isIndividualClaimView: boolean = false;
  groupClaimInputObj: any = {};
  isGroupClaimObj: boolean = false;
  groupClaimLoading: boolean = false;
  groupClaimObj: Array<GroupClaim> = [];
  criteriaClaimInputObj: any = {};
  isCriteriaClaimObj: boolean = false;
  criteriaClaimLoading: boolean = false;
  criteriaClaimObj: Array<GroupClaim> = [];
  schemeViewUrl: string;
  isGroupClaimView: boolean = false;
  claimTypeHardCodeList: Array<any> = [];
  gClaimId: Array<string> = [];
  claimId: Array<string> = [];
  seqNo: Array<string> = [];
  selectedFilterCount: number = 0;
  blockStatus: string;
  unblockStatus: string;
  isSelectedCheckBox: boolean = false;
  blockCriteriaObj: Array<IndBlockingUpdate> = [];;
  buId: any = [];
  schemeId: any = [];
  monthYear: any = [];
  dealerCode: any = [];
  blockFlag: any = [];
  chassisNo: any = [];
  individualClaimViewTabsLazyComp: Promise<Type<ClaimDealerTabsViewComponent>>;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  groupClaimViewTabsLazyComp: Promise<Type<GroupClaimViewTabComponent>>;

  constructor(private claimsService: ClaimsService,
              public sharedService: SharedService,
              private router: Router,
              private messageService: MessageService,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollIndividualTable();
    this.dragAndScrollGroupTable();
    this.dragAndScrollCriteriaClaimTable();

    this.getBusinessUnit();
    this.getClaimTypeHardCoded();
  }

  initializeComponent(): void {
    jQuery('#dd_claims_blocking_business_unit').dropdown();
    jQuery('#dd_claims_blocking_scheme_type').dropdown();
    jQuery('#dd_claims_blocking_scheme').dropdown();
    jQuery('#dd_claims_blocking_claim_type').dropdown();
    jQuery('#dd_claims_blocking_block_criteria').dropdown();
    jQuery('#dd_claims_blocking_unblock_criteria').dropdown();
    jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown();
    jQuery('#dd_claim_blocking_individual_size').dropdown();
    jQuery('#dd_claims_blocking_group_size').dropdown();
    jQuery('#dd_claims_blocking_criteria_Claim_size').dropdown();

    setTimeout(() => {
      jQuery('.coupled.modal').modal({ allowMultiple: true });
      jQuery('.accordion').accordion({ selector: { trigger: '.title' } });
      jQuery('.tabular.menu .item').tab({ history: false });
      jQuery('.menu .item').tab();

      $('#dd_claims_blocking_scheme_type').on('change', () => {
        this.getScheme();
      });

      $('#dd_claims_blocking_claim_type_hardcoded').on('change', () => {
        if (jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') == "IND") {
          this.isIndividualClaim = true;
        }
        else {
          this.isIndividualClaim = false;
        }
      });
    }, 0);

    $('#dd_claims_blocking_block_criteria').on('change', () => {
      if (jQuery('#dd_claims_blocking_block_criteria').dropdown('get value') != "" && jQuery('#dd_claims_blocking_block_criteria').dropdown('get value') != null) {
        this.isBlockCriteriaSelected = true;
      }
      else {
        this.isBlockCriteriaSelected = false;
      }
    });

    $('#dd_claims_blocking_claim_type').on('change', () => {
      jQuery('#dd_claims_blocking_block_criteria').dropdown('restore defaults');
      jQuery('#dd_claims_blocking_unblock_criteria').dropdown('restore defaults');
      if (jQuery('#dd_claims_blocking_claim_type').dropdown('get value') == "Open") {
        this.isBlock = true;
        this.isUnblock = false;
      }
      else if (jQuery('#dd_claims_blocking_claim_type').dropdown('get value') == "Temporary Blocked") {
        this.isBlock = false;
        this.isUnblock = true;
      }
      else if (jQuery('#dd_claims_blocking_claim_type').dropdown('get value') == "Permanently Blocked") {
        this.isBlock = false;
        this.isUnblock = false;
      }
    });

    $('#dd_claims_blocking_unblock_criteria').on('change', () => {
      let selectedIndividualClaims: any = [];
      this.selectedIndividualClaims = selectedIndividualClaims;
      this.selectedIndividualClaims.length = 0;
      
      if(jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'PB') {
        this.isUnblockBlock = true;
        this.isUnblock = false;
        this.isUnblockCriteriaSelected = true;
        
        if(this.isGroupClaim == true) {
          jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'PB' ? this.selectedGroupClaims = JSON.parse(JSON.stringify(this.groupClaimObj)) : "";
          this.isSelectedCheckBox = true;
        }
        else {
          jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'PB' ? this.selectedIndividualClaims = JSON.parse(JSON.stringify(this.individualClaimObj)) : "";
          this.isSelectedCheckBox = true;
        }
      }
      else if(jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'SB') {
        this.isUnblockBlock = true;
        this.isUnblock = false;
        this.isUnblockCriteriaSelected = true;
        this.isSelectedCheckBox = false;
      }
      else if(jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'SU') {
        this.isUnblockBlock = false;
        this.isUnblock = true;
        this.isUnblockCriteriaSelected = true;
        this.isSelectedCheckBox = false;
      }
      else if(jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'U') {
        this.isUnblockBlock = false;
        this.isUnblock = true;
        this.isUnblockCriteriaSelected = true;
        
        if (this.isGroupClaim == true) {
          jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'U' ? this.selectedGroupClaims = JSON.parse(JSON.stringify(this.groupClaimObj)) : "";
          this.isSelectedCheckBox = true;
        }
        else {
          jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'U' ? this.selectedIndividualClaims = JSON.parse(JSON.stringify(this.individualClaimObj)) : "";
          this.isSelectedCheckBox = true;
        }
      }
      else if (jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'UC' || jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'SU') {
        this.isUnblockBlock = false;
        this.isUnblock = true;
        this.isUnblockCriteriaSelected = true;
        this.isSelectedCheckBox = false;
      }
      else if (jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'UCA' || jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value') == 'SU') {
        this.isUnblockBlock = false;
        this.isUnblock = true;
        this.isUnblockCriteriaSelected = true;
        this.isSelectedCheckBox = false;
      }
      else {
        this.isUnblockCriteriaSelected = false;
        this.isSelectedCheckBox = false;
      }
    });

    $('#dd_claims_blocking_claim_type').on('change', () => {
      this.individualClaimObj = [];
      this.isIndividualClaimObj = false;
      this.groupClaimObj = [];
      this.isGroupClaimObj = false;
      this.criteriaClaimObj = [];
      this.isCriteriaClaimObj = false;
    });

    jQuery("#cal_claims_blocking_month_year_date").calendar({
      type: "month",
      popupOptions: {
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      }
    });
  }

  dragAndScrollIndividualTable() {
    const slider = document.querySelector<HTMLElement>('#individualClaimTable');
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

  dragAndScrollGroupTable() {
    const slider = document.querySelector<HTMLElement>('#groupClaimTable');
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

  dragAndScrollCriteriaClaimTable() {
    const slider = document.querySelector<HTMLElement>('#criteriaBlockClaimTable');
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

  getBusinessUnit() {
    jQuery('#dd_claims_blocking_business_unit').parent().addClass('disabled');

    this.claimsService.getBusinessUnit().subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "") {
        this.geoMappingList = claimsDealerDashboardResponse;

        for (let i = 0; i < this.geoMappingList.length; i++) {
          this.businessUnitList[i] = new BusinessUnit();
          this.businessUnitList[i].text = this.geoMappingList[i].BU;
          this.businessUnitList[i].value = this.geoMappingList[i].BU;
        }

        setTimeout(() => {
          jQuery('#dd_claims_blocking_business_unit').dropdown('set selected', this.businessUnitList[0].value);

          this.sharedService.changeBusinessUnit(this.businessUnitList[0].value);

          this.businessUnit = this.businessUnitList[0].value;

          this.getSchemeType();
          this.searchFilter(true);
        }, 0);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Business Unit', life: 7000 });
      }

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Business Unit Data', life: 7000 });
    });
  }

  getClaimTypeHardCoded() {
    $('#dd_claims_blocking_claim_type_hardcoded').parent().addClass('disabled');
    $('#dd_claims_blocking_claim_type_hardcoded').parent().addClass('loading');

    this.claimTypeHardCodeList[0] = new Object();
    this.claimTypeHardCodeList[0].description = "Individual Claim";
    this.claimTypeHardCodeList[0].value = "IND";

    this.claimTypeHardCodeList[1] = new Object();
    this.claimTypeHardCodeList[1].description = "Group Claim";
    this.claimTypeHardCodeList[1].value = "GRP";

    this.claimTypeHardCodeList[2] = new Object();
    this.claimTypeHardCodeList[2].description = "Criteria Block Claim";
    this.claimTypeHardCodeList[2].value = "CB";

    setTimeout(() => {
      $('#dd_claims_blocking_claim_type_hardcoded').parent().removeClass('disabled');
      $('#dd_claims_blocking_claim_type_hardcoded').parent().removeClass('loading');

      jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('set selected', this.claimTypeHardCodeList[0].value);
    }, 0);
  }

  getSchemeType() {
    let schemeCategoryType = "RET_INS";
    let businessUnit = jQuery('#dd_claims_blocking_business_unit').dropdown('get value');

    if (schemeCategoryType != null && schemeCategoryType != "" && businessUnit != null && businessUnit != "") {
      $('#dd_claims_blocking_role').parent().addClass('loading');
      $('#dd_claims_blocking_role').parent().addClass('disabled');
      $('#dd_claims_blocking_position').parent().addClass('loading');
      $('#dd_claims_blocking_position').parent().addClass('disabled');
      $('#dd_claims_blocking_business_unit').parent().addClass('loading');
      $('#dd_claims_blocking_business_unit').parent().addClass('disabled');
      $('#dd_claims_blocking_scheme_type').parent().addClass('loading');
      $('#dd_claims_blocking_scheme_type').parent().addClass('disabled');

      jQuery('#dd_claims_blocking_scheme_type').dropdown('clear');
      jQuery('#dd_claims_blocking_scheme_type').dropdown('restore defaults');

      this.schemeTypeList = [];

      this.claimsService.getSchemeTypeList(businessUnit, schemeCategoryType).subscribe((claimsBlockingResponse) => {
        if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.length > 0) {
          this.schemeTypeList = claimsBlockingResponse;
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Scheme Type', life: 7000 });
        }

        $('#dd_claims_blocking_role').parent().removeClass('loading');
        $('#dd_claims_blocking_role').parent().removeClass('disabled');
        $('#dd_claims_blocking_position').parent().removeClass('loading');
        $('#dd_claims_blocking_position').parent().removeClass('disabled');
        $('#dd_claims_blocking_business_unit').parent().removeClass('loading');
        $('#dd_claims_blocking_business_unit').parent().removeClass('disabled');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_claims_blocking_role').parent().removeClass('loading');
        $('#dd_claims_blocking_role').parent().removeClass('disabled');
        $('#dd_claims_blocking_position').parent().removeClass('loading');
        $('#dd_claims_blocking_position').parent().removeClass('disabled');
        $('#dd_claims_blocking_business_unit').parent().removeClass('loading');
        $('#dd_claims_blocking_business_unit').parent().removeClass('disabled');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Scheme Type Data', life: 7000 });
        }
      });
    }
  }

  getScheme() {
    let schemeType = jQuery('#dd_claims_blocking_scheme_type').dropdown('get value');

    if (schemeType != null && schemeType != "") {
      $('#dd_claims_blocking_scheme_type').parent().addClass('loading');
      $('#dd_claims_blocking_scheme_type').parent().addClass('disabled');

      $('#dd_claims_blocking_scheme').parent().addClass('loading');
      $('#dd_claims_blocking_scheme').parent().addClass('disabled');

      jQuery('#dd_claims_blocking_scheme').dropdown('clear');
      jQuery('#dd_claims_blocking_scheme').dropdown('restore defaults');

      this.claimsService.getAllActiveSchemes(schemeType).subscribe((claimsBlockingResponse) => {
        if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.STATUS_OUT && claimsBlockingResponse.STATUS_OUT != null && claimsBlockingResponse.STATUS_OUT != "" && claimsBlockingResponse.STATUS_OUT == "SUCCESS" && claimsBlockingResponse.RESPONSE_OUT && claimsBlockingResponse.RESPONSE_OUT != null && claimsBlockingResponse.RESPONSE_OUT != "" && claimsBlockingResponse.RESPONSE_OUT.length > 0) {
          this.schemeList = claimsBlockingResponse.RESPONSE_OUT;
        }
        else {
          this.schemeList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Scheme', life: 7000 });
        }

        $('#dd_claims_blocking_scheme').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme').parent().removeClass('disabled');

        $('#dd_claims_blocking_scheme_type').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_claims_blocking_scheme').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme').parent().removeClass('disabled');

        $('#dd_claims_blocking_scheme_type').parent().removeClass('loading');
        $('#dd_claims_blocking_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key:'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Scheme Data', life: 7000 });
        }
      });
    }
  }

  blockClaim() {
    this.blockStatus = jQuery('#dd_claims_blocking_block_criteria').dropdown('get value');
    this.selectedFilterCount;

    if (this.blockStatus == "TC") {
      if (this.isGroupClaim == true) {
        if (this.selectedFilterCount < 2) {
          jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
        }
        else {
          this.updateGroupClaim("T");
          this.updateBlockCriteria("T");
        }
      }
      else {
        if (this.selectedFilterCount < 2) {
          jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
        }
        else {
          this.updateIndividualClaim("T");
          this.updateBlockCriteria("T");
        }
      }
    }
    else if (this.blockStatus == "T") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("T");
      }
      else {
        this.updateIndividualClaim("T");
      }
    }
    else if (this.blockStatus == "PC") {
      if (this.isGroupClaim == true) {
        if (this.selectedFilterCount < 2) {
          jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
        }
        else {
          this.updateGroupClaim("P");
          this.updateBlockCriteria("P");
        }
      }
      else {
        if (this.selectedFilterCount < 2) {
          jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
        }
        else {
          this.updateIndividualClaim("P");
          this.updateBlockCriteria("P");
        }
      }
    }
    else if (this.blockStatus == "P") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("P");
      }
      else {
        this.updateIndividualClaim("P");
      }
    }
    else if (this.blockStatus == "CT") {
      if (this.selectedFilterCount < 2) {
        jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
      }
      else {
        this.updateBlockCriteria("T");
      }

    }
    else if (this.blockStatus == "CP") {
      if (this.selectedFilterCount < 2) {
        jQuery('#blockciteria').modal({ closable: false, autofocus: false }).modal('show');
      }
      else {
        this.updateBlockCriteria("P");
      }
    }
  }

  unblockClaim() {
    this.unblockStatus = jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value');

    if (this.unblockStatus == "U") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("O");
      }
      else {
        this.updateIndividualClaim("O");
      }
    }
    else if (this.unblockStatus == "SU") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("O");
      }
      else {
        this.updateIndividualClaim("O");
      }
    }
    else if (this.unblockStatus == "PB") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("P");
      }
      else {
        this.updateIndividualClaim("P");
      }
    }
    else if (this.unblockStatus == "SB") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("P");
      }
      else {
        this.updateIndividualClaim("P");
      }
    }
    else if (this.unblockStatus == "UC") {
      this.putBlockCriteria("O");
    }
    else if (this.unblockStatus == "UCA") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("O");
        this.updateBlockCriteria("O");
      }
      else {
        this.updateIndividualClaim("O");
        this.updateBlockCriteria("O");
      }
    }
  }

  permanentBlockClaim() {
    this.unblockStatus = jQuery('#dd_claims_blocking_unblock_criteria').dropdown('get value');

    if (this.unblockStatus == "U") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("O");
        this.updateBlockCriteria("O");
      }
      else {
        this.updateIndividualClaim("O");
        this.updateBlockCriteria("O");
      }
    }
    else if (this.unblockStatus == "SU") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("O");
      }
      else {
        this.updateIndividualClaim("O");
      }
    }
    else if (this.unblockStatus == "PB") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("P");
      }
      else {
        this.updateIndividualClaim("P");
      }
    }
    else if (this.unblockStatus == "SB") {
      if (this.isGroupClaim == true) {
        this.updateGroupClaim("P");
      }
      else {
        this.updateIndividualClaim("P");
      }
    }
  }

  individualClaimSizeChanged(event) {
    jQuery('#dd_claim_blocking_individual_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setIndividualClaimPage(1);
  }

  getSelectedIndividualClaimId() {
    this.isGroupClaim = false;

    this.claimId = this.selectedIndividualClaims.map((item) => item.claim_ID);
    return this.claimId;
  }

  setIndividualClaimPage(page: number) {
    if (this.individualClaimInputObj != null) {
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

      this.claimsService.getIndividualBlockingClaims(this.individualClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS") {
          this.individualClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
          this.isIndividualClaimObj = true;
        }
        else {
          this.tableCount = 0;
          this.individualClaimObj = null;
          this.isIndividualClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Individual Blocking Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Individual Blocking Claims Data', life: 7000 });
        }
      });
    }
  }

  getIndividualClaims() {
    $('.loader').show();
    this.isIndividualClaimObj = false;

    this.individualClaimInputObj.pageNumber = '1';
    this.individualClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getIndividualBlockingClaims(this.individualClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0) {
        this.tableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.individualClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isIndividualClaimObj = true;
      }
      else {
        this.individualClaimObj = [];
        this.tableCount = 0;
        this.isIndividualClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Individual Blocking Claims', life: 7000 });
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
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Individual Blocking Claims Data', life: 7000 });
      }
    });
  }

  groupClaimSizeChanged(event) {
    this.isIndividualClaim = false;
    jQuery('#dd_claims_blocking_group_size').dropdown('set selected', event.target.value);
    this.gtableSize = event.target.value;
    this.setGroupClaimPage(1);
  }

  setGroupClaimPage(page: number) {
    if (this.groupClaimInputObj != null) {
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

      this.claimsService.getGroupBlockingClaims(this.groupClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS") {
          this.groupClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
          this.isGroupClaimObj = true;
        }
        else {
          this.gtableCount = 0;
          this.groupClaimObj = null;
          this.isGroupClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Blocking Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Blocking Claims Data', life: 7000 });
        }
      });
    }
  }

  getGroupClaims() {
    $('.loader').show();
    this.isGroupClaimObj = false;

    this.groupClaimInputObj.pageNumber = '1';
    this.groupClaimInputObj.pageSize = this.gtableSize.toString();

    this.claimsService.getGroupBlockingClaims(this.groupClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0) {
        this.gtableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.groupClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isGroupClaimObj = true;
      }
      else {
        this.groupClaimObj = [];
        this.gtableCount = 0;
        this.isGroupClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Blocking Claims', life: 7000 });
      }

      this.gpager.currentPage = 1;
      this.gpager.pageSize = this.gtableSize;

      const page = 1;

      this.gpager = this.sharedService.getPager(this.gtableCount, page, this.gtableSize);

      $('.loader').hide();
    }, (error) => {
       $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Blocking Claims Data', life: 7000 });
      }
    });
  }

  getSelectedGroupClaimId() {
    this.isGroupClaim = true;
    this.gClaimId = this.selectedGroupClaims.map((item) => item.g_CLAIM_ID);
    return this.gClaimId;
  }

  getSelectedCrieria() {
    this.seqNo = this.selectedCriteriaBlockClaims.map((item) => item.seq_NO);
    return this.seqNo;
  }

  criteriaClaimSizeChanged(event) {
    jQuery('#dd_claims_blocking_criteria_Claim_size').dropdown('set selected', event.target.value);
    this.btableSize = event.target.value;
    this.setCriteriaClaimPage(1);
  }

  setCriteriaClaimPage(page: number) {
    if (this.criteriaClaimInputObj != null) {
      $('.loader').show();
      this.isCriteriaClaimObj = false;
      this.selectedCriteriaBlockClaims = [];

      if (page < 1 || page > this.bpager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.bpager = this.sharedService.getPager(this.btableCount, page, this.btableSize);

      this.criteriaClaimInputObj.pageNumber = this.bpager.currentPage.toString();
      this.criteriaClaimInputObj.pageSize = this.bpager.pageSize.toString();

      this.claimsService.getCriteriaBlockingClaims(this.criteriaClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
        if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS") {
          this.criteriaClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
          this.isCriteriaClaimObj = true;
        }
        else {
          this.btableCount = 0;
          this.criteriaClaimObj = null;
          this.isCriteriaClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Criteria Blocking Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Criteria Blocking Claims Data', life: 7000 });
        }
      });
    }
  }

  getCriteriaClaim() {
    $('.loader').show();
    this.isCriteriaClaimObj = false;

    this.criteriaClaimInputObj.pageNumber = '1';
    this.criteriaClaimInputObj.pageSize = this.btableSize.toString();

    this.claimsService.getCriteriaBlockingClaims(this.criteriaClaimInputObj).subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT.count > 0) {
        this.btableCount = claimsDealerDashboardResponse.RESPONSE_OUT.count;
        this.criteriaClaimObj = claimsDealerDashboardResponse.RESPONSE_OUT.list;
        this.isCriteriaClaimObj = true;
      }
      else {
        this.criteriaClaimObj = [];
        this.btableCount = 0;
        this.isCriteriaClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Criteria Blocking Claims', life: 7000 });
      }

      this.bpager.currentPage = 1;
      this.bpager.pageSize = this.btableSize;

      const page = 1;

      this.bpager = this.sharedService.getPager(this.btableCount, page, this.btableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Criteria Blocking Claims Data', life: 7000 });
      }
    });
  }

  searchFilter(flag) {
    this.selectedIndividualClaims = [];
    this.selectedGroupClaims = [];
    this.selectedCriteriaBlockClaims = [];

    this.individualClaimInputObj = new Object();
    this.groupClaimInputObj = new Object();
    this.criteriaClaimInputObj = new Object();
    this.selectedFilterCount = 0;
    
    if (jQuery('#dd_claims_blocking_business_unit').dropdown('get value') != null && jQuery('#dd_claims_blocking_business_unit').dropdown('get value') != "") {
      this.individualClaimInputObj.pBU_ID = jQuery('#dd_claims_blocking_business_unit').dropdown('get value');
      this.groupClaimInputObj.pBU_ID = jQuery('#dd_claims_blocking_business_unit').dropdown('get value');
      this.criteriaClaimInputObj.pBU_ID = jQuery('#dd_claims_blocking_business_unit').dropdown('get value');
      this.selectedFilterCount++;
    }
    else {
      this.individualClaimInputObj.pBU_ID = '';
      this.groupClaimInputObj.pBU_ID = '';
      this.criteriaClaimInputObj.pBU_ID = '';
    }

    if (jQuery('#dd_claims_blocking_scheme').dropdown('get value') != null && jQuery('#dd_claims_blocking_scheme').dropdown('get value') != "") {
      this.individualClaimInputObj.pSCHEME_ID = jQuery('#dd_claims_blocking_scheme').dropdown('get value');
      this.groupClaimInputObj.pSCHEME_ID = jQuery('#dd_claims_blocking_scheme').dropdown('get value');
      this.criteriaClaimInputObj.pSCHEME_ID = jQuery('#dd_claims_blocking_scheme').dropdown('get value');
      this.selectedFilterCount++;
    }
    else {
      this.individualClaimInputObj.pSCHEME_ID = '';
      this.groupClaimInputObj.pSCHEME_ID = '';
      this.criteriaClaimInputObj.pSCHEME_ID = '';
    }

    if (jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') == "IND") {
      this.individualClaimInputObj.pCLAIM_ID = $('#txt_claims_blocking_individual_claim_id').val().toString().trim() != null && $('#txt_claims_blocking_individual_claim_id').val().toString().trim() != "" ? $('#txt_claims_blocking_individual_claim_id').val().toString().trim().split(',') : [];
      this.groupClaimInputObj.pGCLAIM_ID = [];
    }
    else {
      this.individualClaimInputObj.pCLAIM_ID = [];
      this.groupClaimInputObj.pGCLAIM_ID = $('#txt_claims_blocking_group_claim_id').val().toString().trim() != null && $('#txt_claims_blocking_group_claim_id').val().toString().trim() != "" ? $('#txt_claims_blocking_group_claim_id').val().toString().trim().split(',') : [];

    }

    if ($('#txt_claims_blocking_chassis_no').val().toString().trim() != null && $('#txt_claims_blocking_chassis_no').val().toString().trim() != "") {
      this.individualClaimInputObj.pCHASSIS_NO = $('#txt_claims_blocking_chassis_no').val().toString().trim().split(',');
      this.criteriaClaimInputObj.pCHASSIS_NO = $('#txt_claims_blocking_chassis_no').val().toString().trim().split(',');
      this.selectedFilterCount++;
    }
    else {
      this.individualClaimInputObj.pCHASSIS_NO = [];
      this.criteriaClaimInputObj.pCHASSIS_NO = [];
    }

    if ($('#txt_claims_blocking_dealer').val().toString().trim() != null && $('#txt_claims_blocking_dealer').val().toString().trim() != "") {
      this.individualClaimInputObj.pDEALER_CODE = $('#txt_claims_blocking_dealer').val().toString().trim();
      this.groupClaimInputObj.pDEALER_CODE = $('#txt_claims_blocking_dealer').val().toString().trim();
      this.criteriaClaimInputObj.pDEALER_CODE = $('#txt_claims_blocking_dealer').val().toString().trim();
      this.selectedFilterCount++;
    }
    else {
      this.individualClaimInputObj.pDEALER_CODE = "";
      this.groupClaimInputObj.pDEALER_CODE = "";
      this.criteriaClaimInputObj.pDEALER_CODE = "";
    }

    if (jQuery('#dd_claims_blocking_claim_type').dropdown('get value') != null && jQuery('#dd_claims_blocking_claim_type').dropdown('get value') != "") {
      this.individualClaimInputObj.pBLOCK_FLAG = jQuery('#dd_claims_blocking_claim_type').dropdown('get value');
      this.groupClaimInputObj.pBLOCK_FLAG = jQuery('#dd_claims_blocking_claim_type').dropdown('get value');
      let blockFlag = jQuery('#dd_claims_blocking_claim_type').dropdown('get value');
      if (blockFlag == "Open") {
        this.criteriaClaimInputObj.pBLOCK_FLAG = 'O';
      }
      else if (blockFlag == "Temporary Blocked") {
        this.criteriaClaimInputObj.pBLOCK_FLAG = 'T';
      }
      else {
        this.criteriaClaimInputObj.pBLOCK_FLAG = 'P';
      }

    }
    else {
      this.individualClaimInputObj.pBLOCK_FLAG = '';
      this.groupClaimInputObj.pBLOCK_FLAG = '';
      this.criteriaClaimInputObj.pBLOCK_FLAG = '';
    }

    let monthYear = jQuery('#txt_claims_blocking_month_year_date').val();

    if (monthYear != null && monthYear != "") {
      this.individualClaimInputObj.pMONTH_YEAR = this.datePipe.transform(new Date(jQuery('#txt_claims_blocking_month_year_date').val()), 'yyyy-MM');
      this.groupClaimInputObj.pMONTH_YEAR = this.datePipe.transform(new Date(jQuery('#txt_claims_blocking_month_year_date').val()), 'yyyy-MM');
      this.criteriaClaimInputObj.pMONTH_YEAR = this.datePipe.transform(new Date(jQuery('#txt_claims_blocking_month_year_date').val()), 'yyyy-MM');
      this.selectedFilterCount++;
    }
    else {
      this.individualClaimInputObj.pMONTH_YEAR = '';
      this.groupClaimInputObj.pMONTH_YEAR = '';
      this.criteriaClaimInputObj.pMONTH_YEAR = '';
    }

    if (!flag && jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_claims_blocking_claim_type_hardcoded').dropdown('get value') != "") {
      this.getIndividualClaims();
      this.getGroupClaims();
      this.getCriteriaClaim();
    }
    else {
      this.getIndividualClaims();
      this.getGroupClaims();
      this.getCriteriaClaim();
    }
  }

  updateIndividualClaim(blockStatusFlag: string) {
    let individualClaimInputObj: any = {};
    individualClaimInputObj.pCLAIM_ID = this.getSelectedIndividualClaimId();
    individualClaimInputObj.pBLOCK_FLAG = blockStatusFlag;

    if (this.claimId.length <= 0) {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
    }

    else {
      this.claimsService.postIndividualClaims(individualClaimInputObj).subscribe((claimsBlockingResponse) => {
        if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.STATUS_OUT && claimsBlockingResponse.STATUS_OUT != null && claimsBlockingResponse.STATUS_OUT != "" && claimsBlockingResponse.STATUS_OUT == "SUCCESS") {
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'success', summary: 'Success', detail: claimsBlockingResponse.RESPONSE_OUT, life: 7000 });
          this.getIndividualClaims();
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: claimsBlockingResponse.RESPONSE_OUT, life: 7000 });
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Please Select Individual Claims', life: 7000 });
        }
      });
    }
  }

  updateGroupClaim(blockStatusFlag: string) {
    let groupClaimInputObj: any = {};
    groupClaimInputObj.pGCLAIM_ID = this.getSelectedGroupClaimId();
    groupClaimInputObj.pBLOCK_FLAG = blockStatusFlag;

    if (this.gClaimId.length <= 0) {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
    }
    else {
      this.claimsService.postGroupClaims(groupClaimInputObj).subscribe((claimsBlockingResponse) => {
        if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.STATUS_OUT && claimsBlockingResponse.STATUS_OUT != null && claimsBlockingResponse.STATUS_OUT != "" && claimsBlockingResponse.STATUS_OUT == "SUCCESS") {
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'success', summary: 'Success', detail: claimsBlockingResponse.RESPONSE_OUT, life: 7000 });
          this.getGroupClaims();
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Error in Group Claim Status Update', life: 7000 });
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Please Select Group Claims', life: 7000 });
        }
      });
    }
  }

  putBlockCriteria(blockStatusFlag: string) {
    let criteriaInputObj: any = {};
    criteriaInputObj.pSEQ_ID = this.getSelectedCrieria();
    criteriaInputObj.pBLOCK_FLAG = blockStatusFlag;

    if (this.seqNo.length <= 0) {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Criteria', life: 7000 });
    }
    else {
      this.claimsService.putCriteriaClaims(criteriaInputObj).subscribe((claimsBlockingResponse) => {
        if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.STATUS_OUT && claimsBlockingResponse.STATUS_OUT != null && claimsBlockingResponse.STATUS_OUT != "" && claimsBlockingResponse.STATUS_OUT == "SUCCESS") {
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'success', summary: 'Success', detail: claimsBlockingResponse.RESPONSE_OUT, life: 7000 });
          this.getCriteriaClaim();
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Error in Criteria Claim Status Update', life: 7000 });
        }
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error in Criteria Claim Status Update', life: 7000 });
        }
      });
    }
  }

  updateBlockCriteria(blockStatusFlag: string) {
    let pBlockFlagNew: string;
    pBlockFlagNew = blockStatusFlag;
    
    if (jQuery('#dd_claims_blocking_business_unit').dropdown('get value') != null && jQuery('#dd_claims_blocking_business_unit').dropdown('get value') != "") {
      this.buId = jQuery('#dd_claims_blocking_business_unit').dropdown('get value');
    }
    else {
      this.buId = [];
    }

    if (jQuery('#dd_claims_blocking_scheme').dropdown('get value') != null && jQuery('#dd_claims_blocking_scheme').dropdown('get value') != "") {
      this.schemeId = jQuery('#dd_claims_blocking_scheme').dropdown('get value');
    }
    else {
      this.schemeId = '';
    }

    if ($('#txt_claims_blocking_chassis_no').val().toString().trim() != null && $('#txt_claims_blocking_chassis_no').val().toString().trim() != "") {
      this.chassisNo = $('#txt_claims_blocking_chassis_no').val().toString().trim().split(',');
    }
    else {
      this.chassisNo = [];
    }

    if ($('#txt_claims_blocking_dealer').val().toString().trim() != null && $('#txt_claims_blocking_dealer').val().toString().trim() != "") {
      this.dealerCode = $('#txt_claims_blocking_dealer').val().toString().trim();
    }
    else {

      this.dealerCode = '';
    }

    this.blockFlag = pBlockFlagNew;

    this.monthYear = jQuery('#txt_claims_blocking_month_year_date').val();
    if (this.monthYear != null && this.monthYear != "") {
      this.monthYear = this.datePipe.transform(new Date(jQuery('#txt_claims_blocking_month_year_date').val()), 'MM-yyyy');
    }
    else {
      this.monthYear = '';
    }

    this.blockCriteriaObj[0] = new IndBlockingUpdate();
    this.blockCriteriaObj[0].pBU_ID = this.buId;
    this.blockCriteriaObj[0].pCHASSIS_NO = this.chassisNo;
    this.blockCriteriaObj[0].pDEALER_CODE = this.dealerCode;
    this.blockCriteriaObj[0].pSCHEME_ID = this.schemeId;
    this.blockCriteriaObj[0].pMONTH_YEAR = this.monthYear;
    this.blockCriteriaObj[0].pBLOCK_FLAG = this.blockFlag;

    this.claimsService.updateBlockCriteriaData(this.blockCriteriaObj).subscribe((claimsBlockingResponse) => {
      if (claimsBlockingResponse && claimsBlockingResponse != null && claimsBlockingResponse != "" && claimsBlockingResponse.STATUS_OUT && claimsBlockingResponse.STATUS_OUT != null && claimsBlockingResponse.STATUS_OUT != "" && claimsBlockingResponse.STATUS_OUT == "SUCCESS") {
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'success', summary: 'Success', detail: claimsBlockingResponse.RESPONSE_OUT, life: 7000 });
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'Error in Criteria Claim Status Update', life: 7000 });
      }
    }, (error) => {
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error in Block Criteria Details', life: 7000 });
      }
    });
  }

  clearFilter() {
    jQuery('#dd_claims_blocking_scheme_type').dropdown('restore defaults');
    jQuery('#dd_claims_blocking_scheme').dropdown('restore defaults');
    jQuery('#dd_claims_blocking_claim_type').dropdown('restore defaults');

    this.schemeList = [];

    $('#txt_claims_blocking_individual_claim_id').val('');
    $('#txt_claims_blocking_group_claim_id').val('');
    $('#txt_claims_blocking_chassis_no').val('');
    $('#txt_claims_blocking_dealer').val('');
    $('#txt_claims_blocking_month_year_date').val('');

    this.searchFilter(true);
  }

  openIndividualClaimView(chassisNo, claimId, schemeId, status) {
    this.isIndividualClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeClaimId(claimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, this.position, claimId);
    }, 0);
  }

  closeIndividualClaimView() {
    jQuery('#modal_individual_claim_blocking_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
    jQuery('#model_individual_claim_blocking_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeClaimId("");
    this.sharedService.claimObjById = {};
    this.individualClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getIndividualClaims();
  }

  getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId) {
    $('.loader').show();

    this.claimsService.getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId).subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDealerDashboardResponse.RESPONSE_OUT != null && claimsDealerDashboardResponse.RESPONSE_OUT != "") {
        this.sharedService.individualClaimsPreSelectedData = claimsDealerDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, true);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claim Details By Chassis', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Claim Details By Chassis', life: 7000 });
      }
    });
  }

  getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, isIndividualClaim) {
    this.claimsService.getClaimLimit(chassisNo, schemeId).subscribe((claimsDealerDashboardResponse) => {
      if (claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != "") {
        if (isIndividualClaim) {
          this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDealerDashboardResponse.CLAIM_LIMIT;
        }
        else {
          this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDealerDashboardResponse.CLAIM_LIMIT;
        }

        setTimeout(() => {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');

          if (isIndividualClaim) {
            if (this.isIndividualClaimView) {
              jQuery('#modal_individual_claim_blocking_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

              this.individualClaimViewTabsLazyComp = import('../claim-dealer-tabs-view/claim-dealer-tabs-view.component').then(({ ClaimDealerTabsViewComponent }) => ClaimDealerTabsViewComponent);
            }
          }
          else {
            if (this.isGroupClaimView) {
              jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

              this.groupClaimViewTabsLazyComp = import('../group-claim-view-tab/group-claim-view-tab.component').then(({ GroupClaimViewTabComponent }) => GroupClaimViewTabComponent);
            }
          }
        }, 0);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claim Limit', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsBlockingMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Claim Limit', life: 7000 });
      }
    });
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
    jQuery('#model_blocking_claims_scheme_url_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.schemeViewUrl = "";

    setTimeout(() => {
      this.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView() {
    this.schemeViewUrl = "";
  }

  openGroupClaimView(groupClaimId, status) {
    this.isGroupClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeGroupClaimId(groupClaimId);

    setTimeout(() => {
      jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.groupClaimViewTabsLazyComp = import('../group-claim-view-tab/group-claim-view-tab.component').then(({ GroupClaimViewTabComponent }) => GroupClaimViewTabComponent);
    }, 0);
  }

  closeGroupClaimView() {
    jQuery('#modal_dealer_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeGroupClaimId("");
    this.sharedService.groupClaimObjById = {};
    this.groupClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getGroupClaims();
  }

  closeError() {
    jQuery('#blockciteria').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  toggleSearchFilters() {
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }
}
