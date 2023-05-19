import { DatePipe } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ConfirmationService, MessageService } from 'primeng/api';
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
import { ClaimTabsComponent } from '../claim-tabs/claim-tabs.component';
import { ClaimTabsViewComponent } from '../claim-tabs-view/claim-tabs-view.component';
import { ChassisDetailsTabsViewComponent } from '../chassis-details-tabs-view/chassis-details-tabs-view.component';
import { environment } from 'src/environments/environment';
import { BulkClaim } from '../models/bulk-claim.model';
import { FinancierNameDetails } from '../models/financier-name-details.model';
import { BeneficiaryDetails } from '../models/beneficiary-details.model';
import { GroupClaimApproverViewTabsComponent } from '../group-claim-approver-view-tabs/group-claim-approver-view-tabs.component';
import { GroupClaimApproverTabsComponent } from '../group-claim-approver-tabs/group-claim-approver-tabs.component';
import { Action } from '../models/action.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-claims-dashboard',
  templateUrl: './claims-dashboard.component.html',
  styleUrls: ['./claims-dashboard.component.scss']
})
export class ClaimsDashboardComponent implements OnInit {
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  gpager: any = {};
  gtableCount: number;
  gtableSize: number = 10;
  bpager: any = {};
  btableCount: number;
  btableSize: number = 10;
  isGDCApprover: boolean = false;
  isGDCChecker: boolean = false;
  isGDCFinance: boolean = false;
  isGDCHold: boolean = false;
  isGDCMaker: boolean = false;
  isToggleSearchFilters: boolean = true;
  roleList: Array<Role> = [];
  positionList: Array<Position> = [];
  geoMappingList: Array<GeoMapping> = [];
  businessUnitObj: Array<BusinessUnit> = [];
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
  status: string = "";
  position: string = "";
  businessUnit: string;
  financierNameList: Array<FinancierNameDetails> = [];
  isIndividualClaim: boolean = true;
  individualClaimInputObj: any = {};
  isIndividualClaimObj: boolean = false;
  individualClaimLoading: boolean = false;
  individualClaimObj: Array<IndividualClaim> = [];
  groupClaimInputObj: any = {};
  isGroupClaimObj: boolean = false;
  groupClaimLoading: boolean = false;
  groupClaimObj: Array<GroupClaim> = [];
  beneficiaryNameInputParams: HttpParams;
  isBulkClaimObj: boolean = false;
  bulkClaimLoading: boolean = false;
  bulkClaimObj: Array<BulkClaim> = [];
  beneficiaryNameLoading: boolean = false;
  beneficiaryNameObj: Array<BeneficiaryDetails> = [];
  isBeneficiaryNameObj: boolean = false;
  dealerDetails: any;
  isBulkClaimFile: boolean = false;
  bulkClaimFile: File = null;
  selectedIndividualClaims: any;
  selectedGroupClaims: any;
  individualClaimsModalForm: FormGroup;
  groupClaimsModalForm: FormGroup;
  individualClaimTabsLazyComp: Promise<Type<ClaimTabsComponent>>;
  individualClaimViewTabsLazyComp: Promise<Type<ClaimTabsViewComponent>>;
  groupClaimTabsLazyComp: Promise<Type<GroupClaimApproverTabsComponent>>;
  groupClaimViewTabsLazyComp: Promise<Type<GroupClaimApproverViewTabsComponent>>;
  chassisViewTabsLazyComp: Promise<Type<ChassisDetailsTabsViewComponent>>;
  individualClaimHeader: string = "";
  groupClaimHeader: string = "";
  workflowCode: string = "";
  isIndividualClaimView: boolean = false;
  isGroupClaimView: boolean = false;
  initialValidationObj: Array<string> = [];
  initialValidationLoading: boolean = false;
  actionList: Array<Action> = [];
  approverDashboardDetailsObj: any;
  beneficiaryNameModalForm: FormGroup;
  individualClaimSubmitForm: FormGroup;
  groupClaimSubmitForm: FormGroup;
  custodyMessageObj: Array<any> = [];
  custodyMessageLoading: boolean = false;
  isIndividualUserList: boolean = false;
  isGroupUserList: boolean = false;
  individualUserList: Array<User> = [];
  groupUserList: Array<User> = [];
  isIndividualRemark: boolean = true;
  isGroupRemark: boolean = true;
  

  constructor(private claimsService: ClaimsService,
              public sharedService: SharedService,
              private router: Router,
              private messageService: MessageService,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private confirmationService:ConfirmationService) { }

  ngOnInit(): void {
    $('.loader').hide();

    this.initializeComponent();
    this.dragAndScrollIndividualTable();
    this.dragAndScrollGroupTable();
    this.dragAndScrollBeneficiaryNameTable();
    this.createOrEditForm();

    this.getRole();
    this.getClaimTypeHardCoded();
    this.getClaimType();
    this.getAssignmentType();
    this.getFinancierNames();
    
    this.sharedService.getModifiedAction().subscribe((response) => {
      if(response && response != null && response != "" && (response != "DRFT" && response != "SVDT")) {
        this.closeIndividualClaim();
        this.closeGroupClaim();
      }
    });
  }
  
  initializeComponent(): void {
    jQuery('#dd_dashboard_role').dropdown();
    $('#dd_dashboard_role').parent().find('.text').addClass('default');
    $('#dd_dashboard_role').parent().find('.text.default').html('Role');
    jQuery('#dd_dashboard_position').dropdown();
    $('#dd_dashboard_position').parent().find('.text').addClass('default');
    $('#dd_dashboard_position').parent().find('.text.default').html('Position');
    jQuery('#dd_dashboard_business_unit').dropdown();
    $('#dd_dashboard_business_unit').parent().find('.text').addClass('default');
    $('#dd_dashboard_business_unit').parent().find('.text.default').html('Business Unit');
    jQuery('#dd_dashboard_scheme_type').dropdown();
    jQuery('#dd_dashboard_scheme').dropdown();
    jQuery('#dd_dashboard_claim_type_hardcoded').dropdown();
    jQuery('#dd_dashboard_claim_type').dropdown();
    jQuery('#dd_dashboard_assignment_type').dropdown();
    jQuery('#dd_dashboard_status').dropdown();
    jQuery('#dd_dashboard_claim_amount_type').dropdown();
    jQuery('#dd_dashboard_date_type').dropdown();
    jQuery('#dd_dashboard_financier_name').dropdown();
    jQuery('#dd_dashboard_stock_transfer').dropdown();
    jQuery('#dd_dashboard_individual_size').dropdown();
    jQuery('#dd_dashboard_group_size').dropdown();
    jQuery('#dd_individual_claim_modal_scheme').dropdown();
    jQuery('#dd_dashboard_individual_action').dropdown();
    jQuery('#dd_dashboard_group_action').dropdown();
    jQuery('#dd_dashboard_individual_user').dropdown();
    jQuery('#dd_dashboard_group_user').dropdown();
    jQuery('#dd_dashboard_beneficiary_search_column').dropdown();
    jQuery('#dd_dashboard_beneficiary_search_filter').dropdown();
    jQuery('#dd_dashboard_beneficiary_size').dropdown();
    jQuery('#dd_dashboard_individual_reason').dropdown();
    jQuery('#dd_dashboard_group_reason').dropdown();

    setTimeout(() => {
      jQuery('.coupled.modal').modal({ allowMultiple: true });
      jQuery('.accordion').accordion({ selector: { trigger: '.title' } });
      jQuery('.tabular.menu .item').tab({ history: false });
      jQuery('.menu .item').tab();

      $('#dd_dashboard_role').on('change', () => {
        this.role = jQuery('#dd_dashboard_role').dropdown('get value');
        this.sharedService.changeRole(this.role);
        this.sharedService.userRole = this.role == "TSM" ? "EXTSM" : this.role;

        this.isGDCChecker = this.role == "CGDC" ? true : false;
        this.isGDCFinance = this.role == "MGDC" ? true : false;
        this.isGDCHold = this.role == "GDCH" ? true : this.role == "OLHD" ? true : this.role == "OPHD" ? true : false ;
        

        this.getPosition(this.role);
        this.getStatus();
      });
  
      $('#dd_dashboard_position').on('change', () => {
        this.position = jQuery('#dd_dashboard_position').dropdown('get value');

        this.getBusinessUnit(this.position);
      });
  
      $('#dd_dashboard_scheme_type').on('change', () => {
        this.getScheme();
      });
  
      $('#dd_dashboard_claim_type_hardcoded').on('change', () => {
        if (jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') == "IND") {
          this.isIndividualClaim = true;
        }
        else {
          this.isIndividualClaim = false;
        }
      });

      $('#dd_dashboard_individual_action').on('change', () => {
        (this.role == "MGDC" || this.role == "GDCH" || this.role == "OLHD" || this.role == "OPHD") && jQuery('#dd_dashboard_individual_action').dropdown('get value') == "APPR" ? this.isIndividualUserList = true : this.isIndividualUserList = false;

        this.isIndividualUserList ? this.getUserList(true): '';
      });

      $('#dd_dashboard_group_action').on('change', () => {
        (this.role == "MGDC" || this.role == "GDCH" || this.role == "OLHD" || this.role == "OPHD") && jQuery('#dd_dashboard_group_action').dropdown('get value') == "APPR" ? this.isGroupUserList = true : this.isGroupUserList = false;

        this.isGroupUserList ? this.getUserList(false): '';
      });

      $('#dd_dashboard_individual_reason').on('change', () => {
        if(jQuery('#dd_dashboard_individual_reason').dropdown('get value') == "Your Own Comment"){
          this.isIndividualRemark = true;
          this.individualClaimSubmitForm.controls.REMARKS.addValidators(Validators.required);
        }
        else{
          this.isIndividualRemark = false;
          this.individualClaimSubmitForm.controls.REMARKS.clearValidators();
        }

        this.individualClaimSubmitForm.controls.REMARKS.setValue('');
      });

      $('#dd_dashboard_group_reason').on('change', () => {
        if(jQuery('#dd_dashboard_group_reason').dropdown('get value') == "Your Own Comment"){
          this.isGroupRemark = true;
          this.groupClaimSubmitForm.controls.REMARKS.addValidators(Validators.required);
        }
        else{
          this.isGroupRemark = false;
          this.groupClaimSubmitForm.controls.REMARKS.clearValidators();
        }

        this.groupClaimSubmitForm.controls.REMARKS.setValue('');
      });
    }, 0);

    jQuery("#cal_individual_claims_month_year").calendar({
      type: "month",
      popupOptions: {
        observeChanges: false,
        position: "bottom left",
        lastResort: "bottom left",
        prefer: "opposite"
      },
      onChange: (date, text, mode) => {
        this.individualClaimsModalForm.controls.MONTH_YEAR.setValue(text);
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
      }
    });

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
        if (date != "" && date != null && date != undefined && isEndDate == false && (new Date($("#txt_dashboard_end_date").val().toString()) < new Date(date.toString()) || ($("#txt_dashboard_end_date").val().toString() == null))) {
          jQuery("#cal_dashboard_end_date").calendar("set date", date);
        }
        else if (isEndDate) {
          isEndDate = false;
        }

        jQuery("#txt_dashboard_start_date").calendar("set date", text);
      },
      endCalendar: jQuery("#cal_dashboard_end_date")
    }).calendar("set date", new Date());

    jQuery("#cal_dashboard_end_date").calendar({
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
        if (date != "" && date != null && date != undefined && ($("#txt_dashboard_start_date").val().toString() == "" || $("#txt_dashboard_end_date").val().toString() == null)) {
          isEndDate = true;
          jQuery("#cal_dashboard_start_date").calendar("set date", date);
        }

        jQuery("#txt_dashboard_end_date").calendar("set date", text);
      },
      startCalendar: jQuery("#cal_dashboard_start_date")
    }).calendar("set date", new Date());
  }

  createOrEditForm() {
    this.beneficiaryNameModalForm = this.formBuilder.group({
      SELECT_FILTER: ['', Validators.required],
      SELECT_COLUMN: ['', Validators.required],
      SEARCH: ['', Validators.required]
    });

    this.individualClaimSubmitForm = this.formBuilder.group({
      CLAIM_ID: [[], Validators.required],
      ACTION: ['', Validators.required],
      USER: ['', this.isIndividualUserList ? Validators.required : ''],
      REMARKS: ['', Validators.required]
    });

    this.groupClaimSubmitForm = this.formBuilder.group({
      GROUP_CLAIM_ID: [[], Validators.required],
      ACTION: ['', Validators.required],
      USER: ['', this.isGroupUserList ? Validators.required : ''],
      REMARKS: ['', Validators.required]
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
  
  dragAndScrollBeneficiaryNameTable() {
    const slider = document.querySelector<HTMLElement>('#beneficiaryNameTable');
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

  dragAndScrollCustodyMessageTable() {
    const slider = document.querySelector<HTMLElement>('#custodyMessageTable');
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

  getRole() {
    $('#dd_dashboard_role').parent().addClass('loading');
    $('#dd_dashboard_role').parent().addClass('disabled');
    
    jQuery('#dd_dashboard_role').dropdown('clear');
    jQuery('#dd_dashboard_role').dropdown('restore defaults');
    
    this.roleList = [];

    $('#dd_dashboard_role').parent().find('.text').addClass('default');
    $('#dd_dashboard_role').parent().find('.text.default').html('Role');

    this.claimsService.getRole().subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
        this.roleList = claimsDashboardResponse;

        setTimeout(() => {
          jQuery('#dd_dashboard_role').dropdown('set selected', this.roleList[0].ROLE_ID);

          this.role = this.roleList[0].ROLE_ID;

          this.sharedService.changeRole(this.role);
          this.sharedService.userRole = this.role == "TSM" ? "EXTSM" : this.role;

          this.isGDCChecker = this.role == "CGDC" ? true : false;
          this.isGDCFinance = this.role == "MGDC" ? true : false;
          this.isGDCHold = this.role == "GDCH" ? true : this.role == "OLHD" ? true : this.role == "OPHD" ? true : false ;

          this.getPosition(this.role);
          this.getStatus();
        }, 0);
      }
      else {
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Role', life: 7000 });
      }
    }, (error) => {
      $('#dd_dashboard_role').parent().removeClass('loading');
      $('#dd_dashboard_role').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow'); 
      this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Role Data', life: 7000 });
    });
  }

  getPosition(role) {
    if(role != null && role != ""){
      $('#dd_dashboard_role').parent().addClass('loading');
      $('#dd_dashboard_role').parent().addClass('disabled');
      $('#dd_dashboard_position').parent().addClass('loading');
      $('#dd_dashboard_position').parent().addClass('disabled');

      jQuery('#dd_dashboard_position').dropdown('clear');
      jQuery('#dd_dashboard_position').dropdown('restore defaults');

      this.positionList = [];

      jQuery('#dd_dashboard_business_unit').dropdown('clear');
      jQuery('#dd_dashboard_business_unit').dropdown('restore defaults');

      this.businessUnitList = [];

      jQuery('#dd_dashboard_scheme_type').dropdown('clear');
      jQuery('#dd_dashboard_scheme_type').dropdown('restore defaults');

      this.schemeTypeList = [];

      $('#dd_dashboard_position').parent().find('.text').addClass('default');
      $('#dd_dashboard_position').parent().find('.text.default').html('Position');

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
          $('#dd_dashboard_role').parent().removeClass('loading');
          $('#dd_dashboard_role').parent().removeClass('disabled');
          $('#dd_dashboard_position').parent().removeClass('loading');
          $('#dd_dashboard_position').parent().removeClass('disabled');

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Position', life: 7000 });
        }
      }, (error) => {
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');
        $('#dd_dashboard_position').parent().removeClass('loading');
        $('#dd_dashboard_position').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Position Data', life: 7000 });
      });
    }
  }

  getBusinessUnit(position) {
    if(position != null && position != ""){
      $('#dd_dashboard_role').parent().addClass('loading');
      $('#dd_dashboard_role').parent().addClass('disabled');
      $('#dd_dashboard_position').parent().addClass('loading');
      $('#dd_dashboard_position').parent().addClass('disabled');
      $('#dd_dashboard_business_unit').parent().addClass('loading');
      $('#dd_dashboard_business_unit').parent().addClass('disabled');

      jQuery('#dd_dashboard_business_unit').dropdown('clear');
      jQuery('#dd_dashboard_business_unit').dropdown('restore defaults');

      this.businessUnitList = [];

      jQuery('#dd_dashboard_scheme_type').dropdown('clear');
      jQuery('#dd_dashboard_scheme_type').dropdown('restore defaults');

      this.schemeTypeList = [];

      $('#dd_dashboard_business_unit').parent().find('.text').addClass('default');
      $('#dd_dashboard_business_unit').parent().find('.text.default').html('Business Unit');

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
  
            this.getSchemeType();
            this.searchFilter(true);
          }, 0);
        }
        else {
          $('#dd_dashboard_role').parent().removeClass('loading');
          $('#dd_dashboard_role').parent().removeClass('disabled');
          $('#dd_dashboard_position').parent().removeClass('loading');
          $('#dd_dashboard_position').parent().removeClass('disabled');
          $('#dd_dashboard_business_unit').parent().removeClass('loading');
          $('#dd_dashboard_business_unit').parent().removeClass('disabled');

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Business Unit', life: 7000 });
        }
      }, (error) => {
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');
        $('#dd_dashboard_position').parent().removeClass('loading');
        $('#dd_dashboard_position').parent().removeClass('disabled');
        $('#dd_dashboard_business_unit').parent().removeClass('loading');
        $('#dd_dashboard_business_unit').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Business Unit Data', life: 7000 });
      });
    }
  }

  getSchemeType() {
    let schemeCategoryType = "RET_INS";
    let businessUnit = jQuery('#dd_dashboard_business_unit').dropdown('get value');

    if (schemeCategoryType != null && schemeCategoryType != "" && businessUnit != null && businessUnit != "") {
      $('#dd_dashboard_role').parent().addClass('loading');
      $('#dd_dashboard_role').parent().addClass('disabled');
      $('#dd_dashboard_position').parent().addClass('loading');
      $('#dd_dashboard_position').parent().addClass('disabled');
      $('#dd_dashboard_business_unit').parent().addClass('loading');
      $('#dd_dashboard_business_unit').parent().addClass('disabled');
      $('#dd_dashboard_scheme_type').parent().addClass('loading');
      $('#dd_dashboard_scheme_type').parent().addClass('disabled');

      jQuery('#dd_dashboard_scheme_type').dropdown('clear');
      jQuery('#dd_dashboard_scheme_type').dropdown('restore defaults');

      this.schemeTypeList = [];

      this.claimsService.getSchemeTypeList(businessUnit, schemeCategoryType).subscribe((claimsDashboardResponse) => {
        if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.length > 0) {
          this.schemeTypeList = claimsDashboardResponse;
        }
        else {
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Scheme Type', life: 7000 });
        }

        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');
        $('#dd_dashboard_position').parent().removeClass('loading');
        $('#dd_dashboard_position').parent().removeClass('disabled');
        $('#dd_dashboard_business_unit').parent().removeClass('loading');
        $('#dd_dashboard_business_unit').parent().removeClass('disabled');
        $('#dd_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dashboard_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dashboard_role').parent().removeClass('loading');
        $('#dd_dashboard_role').parent().removeClass('disabled');
        $('#dd_dashboard_position').parent().removeClass('loading');
        $('#dd_dashboard_position').parent().removeClass('disabled');
        $('#dd_dashboard_business_unit').parent().removeClass('loading');
        $('#dd_dashboard_business_unit').parent().removeClass('disabled');
        $('#dd_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dashboard_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Scheme Type Data', life: 7000 });
        }
      });
    }
  }

  getScheme() {
    let schemeType = jQuery('#dd_dashboard_scheme_type').dropdown('get value');

    if (schemeType != null && schemeType != "") {
      $('#dd_dashboard_scheme_type').parent().addClass('loading');
      $('#dd_dashboard_scheme_type').parent().addClass('disabled');

      $('#dd_dashboard_scheme').parent().addClass('loading');
      $('#dd_dashboard_scheme').parent().addClass('disabled');

      jQuery('#dd_dashboard_scheme').dropdown('clear');
      jQuery('#dd_dashboard_scheme').dropdown('restore defaults');

      this.claimsService.getAllActiveSchemes(schemeType).subscribe((claimsDashboardResponse) => {
        if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT.length > 0){
          this.schemeList = claimsDashboardResponse.RESPONSE_OUT;
        }
        else {
          this.schemeList = [];
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Scheme', life: 7000 });
        }

        $('#dd_dashboard_scheme').parent().removeClass('loading');
        $('#dd_dashboard_scheme').parent().removeClass('disabled');

        $('#dd_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dashboard_scheme_type').parent().removeClass('disabled');
      }, (error) => {
        $('#dd_dashboard_scheme').parent().removeClass('loading');
        $('#dd_dashboard_scheme').parent().removeClass('disabled');

        $('#dd_dashboard_scheme_type').parent().removeClass('loading');
        $('#dd_dashboard_scheme_type').parent().removeClass('disabled');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Scheme Data', life: 7000 });
        }
      });
    }
  }

  getClaimTypeHardCoded() {
    $('#dd_dashboard_claim_type_hardcoded').parent().addClass('disabled');
    $('#dd_dashboard_claim_type_hardcoded').parent().addClass('loading');

    this.claimTypeHardCodeList[0] = new Object();
    this.claimTypeHardCodeList[0].description = "Individual Claim";
    this.claimTypeHardCodeList[0].value = "IND";

    this.claimTypeHardCodeList[1] = new Object();
    this.claimTypeHardCodeList[1].description = "Group Claim";
    this.claimTypeHardCodeList[1].value = "GRP";

    setTimeout(() => {
      $('#dd_dashboard_claim_type_hardcoded').parent().removeClass('disabled');
      $('#dd_dashboard_claim_type_hardcoded').parent().removeClass('loading');

      jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('set selected', this.claimTypeHardCodeList[0].value);
    }, 0);
  }

  getClaimType() {
    jQuery('#dd_dashboard_claim_type').parent().addClass('disabled');
    jQuery('#dd_dashboard_claim_type').parent().addClass('loading');

    this.claimsService.getClaimType().subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
        this.claimTypeList = claimsDashboardResponse;
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Claim Type', life: 7000 });
      }

      jQuery('#dd_dashboard_claim_type').parent().removeClass('disabled');
      jQuery('#dd_dashboard_claim_type').parent().removeClass('loading');
    }, (error) => {
      jQuery('#dd_dashboard_claim_type').parent().removeClass('disabled');
      jQuery('#dd_dashboard_claim_type').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Claim Type Data', life: 7000 });
      }
    });
  }

  getAssignmentType() {
    jQuery('#dd_dashboard_assignment_type').parent().addClass('disabled');
    jQuery('#dd_dashboard_assignment_type').parent().addClass('loading');

    this.assignmentTypeList[0] = new Object();
    this.assignmentTypeList[0].description = "Assigned to Me";
    this.assignmentTypeList[0].value = "AM";

    this.assignmentTypeList[1] = new CustodyRole();
    this.assignmentTypeList[1].description = "Not Assigned to Me";
    this.assignmentTypeList[1].value = "NAM";

    setTimeout(() => {
      jQuery('#dd_dashboard_assignment_type').parent().removeClass('disabled');
      jQuery('#dd_dashboard_assignment_type').parent().removeClass('loading');
    }, 0);
  }

  getStatus() {
    jQuery('#dd_dashboard_status').parent().addClass('disabled');
    jQuery('#dd_dashboard_status').parent().addClass('loading');

    jQuery('#dd_dashboard_status').dropdown('clear');
    jQuery('#dd_dashboard_status').dropdown('restore defaults');

    this.claimsService.getApproverStatus(this.role).subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT.length > 0) {
        this.statusList = claimsDashboardResponse.RESPONSE_OUT;
      }
      else {
        this.statusList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Status', life: 7000 });
      }

      jQuery('#dd_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_dashboard_status').parent().removeClass('loading');
    }, (error) => {
      this.statusList = [];
      jQuery('#dd_dashboard_status').parent().removeClass('disabled');
      jQuery('#dd_dashboard_status').parent().removeClass('loading');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Status Data', life: 7000 });
      }
    });
  }

  searchFilter(flag) {
    this.selectedIndividualClaims = [];
    this.selectedGroupClaims = [];

    this.individualClaimInputObj = new Object();
    this.groupClaimInputObj = new Object();

    if(jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') == "IND") {
      this.individualClaimInputObj.pCLAIM_ID = $('#txt_dashboard_claim_id').val().toString().trim() != null && $('#txt_dashboard_claim_id').val().toString().trim() != "" ? $('#txt_dashboard_claim_id').val().toString().trim().split(','):[];
      this.groupClaimInputObj.pG_CLAIM_ID = [];
    }
    else{
      this.individualClaimInputObj.pCLAIM_ID = [];
      this.groupClaimInputObj.pG_CLAIM_ID = $('#txt_dashboard_group_claim_id').val().toString().trim() != null && $('#txt_dashboard_group_claim_id').val().toString().trim() != "" ? $('#txt_dashboard_group_claim_id').val().toString().trim().split(','): [];
    }

    if(jQuery('#dd_dashboard_scheme_type').dropdown('get value') != null && jQuery('#dd_dashboard_scheme_type').dropdown('get value') != "") {
      this.individualClaimInputObj.pSCHEME_TYPE_ID = jQuery('#dd_dashboard_scheme_type').dropdown('get value');
      this.groupClaimInputObj.pSCHEME_TYPE_ID = jQuery('#dd_dashboard_scheme_type').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSCHEME_TYPE_ID = [];
      this.groupClaimInputObj.pSCHEME_TYPE_ID = [];
    }

    if(jQuery('#dd_dashboard_scheme').dropdown('get value') != null && jQuery('#dd_dashboard_scheme').dropdown('get value') != "") {
      this.individualClaimInputObj.pSCHEME_ID = jQuery('#dd_dashboard_scheme').dropdown('get value');
      this.groupClaimInputObj.pSCHEME_ID = jQuery('#dd_dashboard_scheme').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSCHEME_ID = [];
      this.groupClaimInputObj.pSCHEME_ID = [];
    }

    if(jQuery('#dd_dashboard_status').dropdown('get value') != null && jQuery('#dd_dashboard_status').dropdown('get value') != "") {
      this.individualClaimInputObj.pSTATUS = jQuery('#dd_dashboard_status').dropdown('get value');
      this.groupClaimInputObj.pSTATUS = jQuery('#dd_dashboard_status').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pSTATUS = '';
      this.groupClaimInputObj.pSTATUS = '';
    }

    if(jQuery('#dd_dashboard_financier_name').dropdown('get value') != null && jQuery('#dd_dashboard_financier_name').dropdown('get value') != "") {
      this.individualClaimInputObj.pFINANCIER_NAME = jQuery('#dd_dashboard_financier_name').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pFINANCIER_NAME = '';
    }
    
    if($('#txt_dashboard_dealer_code').val().toString().trim() != null && $('#txt_dashboard_dealer_code').val().toString().trim() != ""){
      this.individualClaimInputObj.pDEALER_CODE = $('#txt_dashboard_dealer_code').val().toString().trim().split(',');
      this.groupClaimInputObj.pDEALER_CODE = $('#txt_dashboard_dealer_code').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pDEALER_CODE = [];
      this.groupClaimInputObj.pDEALER_CODE = [];
    }

    if(jQuery('#dd_dashboard_date_type').dropdown('get value') != null && jQuery('#dd_dashboard_date_type').dropdown('get value') != "" && jQuery('#dd_dashboard_date_type').dropdown('get value') != "NA") {
      this.individualClaimInputObj.pDATE_TYPE = jQuery('#dd_dashboard_date_type').dropdown('get value');
      this.groupClaimInputObj.pDATE_TYPE = jQuery('#dd_dashboard_date_type').dropdown('get value');

      this.individualClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_start_date').val()), 'dd-MMM-yyyy');
      this.individualClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_end_date').val()), 'dd-MMM-yyyy');

      this.groupClaimInputObj.pFROM_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_start_date').val()), 'dd-MMM-yyyy');
      this.groupClaimInputObj.pTO_DATE = this.datePipe.transform(new Date(jQuery('#txt_dashboard_end_date').val()), 'dd-MMM-yyyy');
    }
    else{
      this.individualClaimInputObj.pDATE_TYPE = '';
      this.groupClaimInputObj.pDATE_TYPE = '';

      this.individualClaimInputObj.pFROM_DATE = '';
      this.individualClaimInputObj.pTO_DATE = '';

      this.groupClaimInputObj.pFROM_DATE = '';
      this.groupClaimInputObj.pTO_DATE = '';
    }

    this.individualClaimInputObj.pMONTH_YEAR = '';
    this.groupClaimInputObj.pMONTH_YEAR = '';

    if(jQuery('#dd_dashboard_business_unit').dropdown('get value') != null && jQuery('#dd_dashboard_business_unit').dropdown('get value') != "") {
      this.individualClaimInputObj.pBU_ID = jQuery('#dd_dashboard_business_unit').dropdown('get value');
      this.groupClaimInputObj.pBU_ID = jQuery('#dd_dashboard_business_unit').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pBU_ID = '';
      this.groupClaimInputObj.pBU_ID = '';
    }

    if(jQuery('#dd_dashboard_claim_type').dropdown('get value') != null && jQuery('#dd_dashboard_claim_type').dropdown('get value') != "") {
      this.individualClaimInputObj.pCLAIM_TYPE = jQuery('#dd_dashboard_claim_type').dropdown('get value');
      this.groupClaimInputObj.pCLAIM_TYPE = jQuery('#dd_dashboard_claim_type').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pCLAIM_TYPE = '';
      this.groupClaimInputObj.pCLAIM_TYPE = '';
    }
    
    if($('#txt_dashboard_nfa_no').val().toString().trim() != null && $('#txt_dashboard_nfa_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pNFA_NO = $('#txt_dashboard_nfa_no').val().toString().trim().split(',');
      this.groupClaimInputObj.pNFA_NO = $('#txt_dashboard_nfa_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pNFA_NO = [];
      this.groupClaimInputObj.pNFA_NO = [];
    }

    if($('#txt_dashboard_chassis_no').val().toString().trim() != null && $('#txt_dashboard_chassis_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pCHASSIS_NO = $('#txt_dashboard_chassis_no').val().toString().trim().split(',');
      this.groupClaimInputObj.pCHASSIS_NO = $('#txt_dashboard_chassis_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pCHASSIS_NO = [];
      this.groupClaimInputObj.pCHASSIS_NO = [];
    }

    if(jQuery('#dd_dashboard_claim_amount_type').dropdown('get value') != null && jQuery('#dd_dashboard_claim_amount_type').dropdown('get value') != "" && jQuery('#dd_dashboard_claim_amount_type').dropdown('get value') != "NA") {
      this.individualClaimInputObj.pAMT_OPT = jQuery('#dd_dashboard_claim_amount_type').dropdown('get value');
      this.groupClaimInputObj.pAMT_OPT = jQuery('#dd_dashboard_claim_amount_type').dropdown('get value');

      this.individualClaimInputObj.pAMT = $('#span_claim_amount').text().toString().trim();
      this.groupClaimInputObj.pAMT = $('#span_claim_amount').text().toString().trim();
    }
    else{
      this.individualClaimInputObj.pAMT_OPT = '';
      this.groupClaimInputObj.pAMT_OPT = '';

      this.individualClaimInputObj.pAMT = '';
      this.groupClaimInputObj.pAMT = '';
    }
    
    if(jQuery('#dd_dashboard_role').dropdown('get value') != null && jQuery('#dd_dashboard_role').dropdown('get value') != "") {
      this.individualClaimInputObj.pROLE = jQuery('#dd_dashboard_role').dropdown('get value');
      this.groupClaimInputObj.pROLE = jQuery('#dd_dashboard_role').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pROLE = '';
      this.groupClaimInputObj.pROLE = '';
    }

    this.individualClaimInputObj.pROLE_DESCRIPTION = '';
    this.groupClaimInputObj.pROLE_DESCRIPTION = '';
    this.individualClaimInputObj.pST_DESC = '';
    this.groupClaimInputObj.pST_DESC = '';
    this.individualClaimInputObj.pSCHEME = '';
    this.groupClaimInputObj.pSCHEME = '';
    this.individualClaimInputObj.pBENE = $('#txt_dashboard_beneficiary_name').val().toString().trim();
    this.groupClaimInputObj.pBENE = $('#txt_dashboard_beneficiary_name').val().toString().trim();
    
    jQuery('#modal_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    if(!flag && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') == "IND") {
      this.getIndividualClaims();
    }
    else if(!flag && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != null && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') != "" && jQuery('#dd_dashboard_claim_type_hardcoded').dropdown('get value') == "GRP") {
      this.getGroupClaims();
    }
    else{
      this.getIndividualClaims();
      this.getGroupClaims();
    }
  }
  
  clearFilter(flag) {
    jQuery('#dd_dashboard_scheme_type').dropdown('restore defaults');
    jQuery('#dd_dashboard_scheme').dropdown('restore defaults');
    jQuery('#dd_dashboard_claim_type').dropdown('restore defaults');
    jQuery('#dd_dashboard_status').dropdown('restore defaults');

    this.schemeList = [];

    $('#txt_dashboard_claim_id').val('');
    $('#txt_dashboard_group_claim_id').val('');

    this.searchFilter(true);
  }

  clearAdvanceFilter(flag){
    jQuery('#dd_dashboard_assignment_type').dropdown('restore defaults');
    jQuery('#dd_dashboard_claim_amount_type').dropdown('restore defaults');
    jQuery('#dd_dashboard_date_type').dropdown('restore defaults');
    jQuery('#dd_dashboard_financier_name').dropdown('clear');

    $('#txt_dashboard_chassis_no').val('');
    $('#txt_dashboard_dealer_code').val('');
    $('#txt_dashboard_nfa_no').val('');
    $('#txt_dashboard_beneficiary_name').val('');

    jQuery("#cal_dashboard_start_date").calendar("set date", new Date());
    jQuery("#cal_dashboard_end_date").calendar("set date", new Date());

    this.searchFilter(true);
  }

  getIndividualClaims() {
    document.getElementById('individualClaimTable').scrollLeft = 0;
    $('.loader').show();
    this.isIndividualClaimObj = false;

    this.individualClaimInputObj.pageNumber = '1';
    this.individualClaimInputObj.pageSize = this.tableSize.toString();

    this.claimsService.getApproverIndividualClaims(this.individualClaimInputObj).subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT.count > 0) {
        this.tableCount = claimsDashboardResponse.RESPONSE_OUT.count;
        this.individualClaimObj = claimsDashboardResponse.RESPONSE_OUT.list;
        this.isIndividualClaimObj = true;
        
        setTimeout(() => {
          if(this.role != null && this.role != "" && jQuery('#dd_dashboard_scheme_type').dropdown('get value') != null && jQuery('#dd_dashboard_scheme_type').dropdown('get value') != "" && jQuery('#dd_dashboard_status').dropdown('get value') != null && jQuery('#dd_dashboard_status').dropdown('get value') != ""){
            this.status = jQuery('#dd_dashboard_status').dropdown('get value');
            this.getAction(this.role, jQuery('#dd_dashboard_scheme_type').dropdown('get value'), jQuery('#dd_dashboard_status').dropdown('get value'));
          }
          else{
            this.actionList = [];
            jQuery('#dd_dashboard_individual_action').dropdown('clear');
          }
        }, 0);
      }
      else {
        this.individualClaimObj = [];
        this.tableCount = 0;
        this.isIndividualClaimObj = false;
        this.actionList = [];
        jQuery('#dd_dashboard_individual_action').dropdown('clear');

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Individual Claims', life: 7000 });
      }

      this.pager.currentPage = 1;
      this.pager.pageSize = this.tableSize;

      const page = 1;

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      this.actionList = [];
      jQuery('#dd_dashboard_individual_action').dropdown('clear');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Individual Claims Data', life: 7000 });
      }
    });
  }

  individualClaimSizeChanged(event) {
    jQuery('#dd_dashboard_individual_size').dropdown('set selected', event.target.value);
    this.tableSize = event.target.value;
    this.setIndividualClaimPage(1);
  }

  setIndividualClaimPage(page: number) {
    if (this.individualClaimInputObj != null) {
      $('.loader').show();
      this.isIndividualClaimObj = false;

      if (page < 1 || page > this.pager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.pager = this.sharedService.getPager(this.tableCount, page, this.tableSize);

      this.individualClaimInputObj.pageNumber = this.pager.currentPage.toString();
      this.individualClaimInputObj.pageSize = this.pager.pageSize.toString();

      this.claimsService.getApproverIndividualClaims(this.individualClaimInputObj).subscribe((claimsDashboardResponse) => {
        if (claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS") {
          this.individualClaimObj = claimsDashboardResponse.RESPONSE_OUT.list;
          this.isIndividualClaimObj = true;
        }
        else {
          this.tableCount = 0;
          this.individualClaimObj = null;
          this.isIndividualClaimObj = false;
          this.actionList = [];
          jQuery('#dd_dashboard_individual_action').dropdown('clear');

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Individual Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        this.actionList = [];
        jQuery('#dd_dashboard_individual_action').dropdown('clear');
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Individual Claims Data', life: 7000 });
        }
      });
    }
  }

  getGroupClaims() {
    $('.loader').show();
    this.isGroupClaimObj = false;

    document.getElementById('groupClaimTable').scrollLeft = 0;

    this.groupClaimInputObj.pageNumber = '1';
    this.groupClaimInputObj.pageSize = this.gtableSize.toString();

    this.claimsService.getApproverGroupClaims(this.groupClaimInputObj).subscribe((claimsDashboardResponse) => {
      if (claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT.count > 0) {
        this.gtableCount = claimsDashboardResponse.RESPONSE_OUT.count;
        this.groupClaimObj = claimsDashboardResponse.RESPONSE_OUT.list;
        this.isGroupClaimObj = true;

        setTimeout(() => {
          if(this.role != null && this.role != "" && jQuery('#dd_dashboard_scheme_type').dropdown('get value') != null && jQuery('#dd_dashboard_scheme_type').dropdown('get value') != "" && jQuery('#dd_dashboard_status').dropdown('get value') != null && jQuery('#dd_dashboard_status').dropdown('get value') != ""){
            this.status = jQuery('#dd_dashboard_status').dropdown('get value');
            this.getAction(this.role, jQuery('#dd_dashboard_scheme_type').dropdown('get value'), jQuery('#dd_dashboard_status').dropdown('get value'));
          }
          else{
            this.actionList = [];
          }
        }, 0);
      }
      else {
        this.groupClaimObj = [];
        this.gtableCount = 0;
        this.isGroupClaimObj = false;
        this.actionList = [];

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Claims', life: 7000 });
      }

      this.gpager.currentPage = 1;
      this.gpager.pageSize = this.gtableSize;

      const page = 1;

      this.gpager = this.sharedService.getPager(this.gtableCount, page, this.gtableSize);

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      this.actionList = [];
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claims Data', life: 7000 });
      }
    });
  }

  groupClaimSizeChanged(event) {
    jQuery('#dd_dashboard_group_size').dropdown('set selected', event.target.value);
    this.gtableSize = event.target.value;
    this.setGroupClaimPage(1);
  }

  setGroupClaimPage(page: number) {
    if (this.groupClaimInputObj != null) {
      $('.loader').show();
      this.isGroupClaimObj = false;

      if (page < 1 || page > this.gpager.totalPages) {
        $('.loader').hide();
        return;
      }

      this.gpager = this.sharedService.getPager(this.gtableCount, page, this.gtableSize);

      this.groupClaimInputObj.pageNumber = this.gpager.currentPage.toString();
      this.groupClaimInputObj.pageSize = this.gpager.pageSize.toString();

      this.claimsService.getApproverGroupClaims(this.groupClaimInputObj).subscribe((claimsDashboardResponse) => {
        if (claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS") {
          this.groupClaimObj = claimsDashboardResponse.RESPONSE_OUT.list;
          this.isGroupClaimObj = true;
        }
        else {
          this.gtableCount = 0;
          this.groupClaimObj = null;
          this.isGroupClaimObj = false;
          this.actionList = [];

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Group Claims', life: 7000 });
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        this.actionList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Group Claims Data', life: 7000 });
        }
      });
    }
  }

  getSelectedClaimId() {
    let claimId: Array<string> = [];

    this.individualClaimSubmitForm.controls.CLAIM_ID.setValue([]);

    claimId = this.selectedIndividualClaims.map((item) => item.claim_ID);

    this.individualClaimSubmitForm.controls.CLAIM_ID.setValue(claimId);
  }

  exportIndividualClaims() {
    if (this.individualClaimInputObj != null) {
      $('.loader').show();

      let individualClaimInputObj = JSON.parse(JSON.stringify(this.individualClaimInputObj));
      individualClaimInputObj.pCLAIM_ID = this.individualClaimSubmitForm.controls.CLAIM_ID.value;
      individualClaimInputObj.pageSize = '0';
      individualClaimInputObj.pageNumber = '0';

      this.claimsService.exportApproverIndividualClaims(individualClaimInputObj).subscribe((claimsDashboardResponse) => {
        const blob = claimsDashboardResponse;
        const url = window.URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = "Individual-Claim-Details.xls";
        link.click();
        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Exporting Individual Claims Data', life: 7000 });
        }
      });
    }
  }

  individualClaimCustodyUpdate(){
    this.individualClaimSubmitForm.markAllAsTouched();

    if(this.individualClaimSubmitForm.controls.CLAIM_ID.value == null || this.individualClaimSubmitForm.controls.CLAIM_ID.value == ""){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
      return;
    }
    else if(this.role == "MGDC" && this.status == "ESND" && (this.individualClaimSubmitForm.controls.ACTION.value == "HOLD" || this.individualClaimSubmitForm.controls.ACTION.value == "REJT" || this.individualClaimSubmitForm.controls.ACTION.value == "RECO")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail: 'This Action is Not Allowed', life: 7000});
    }
    else if(this.individualClaimSubmitForm.controls.ACTION.value == "VRFD"){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail: 'This Action is Not Allowed from Dashboard', life: 7000});
    }
    else if(this.individualClaimSubmitForm.invalid){
      return;
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.individualClaimSubmitForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let individualClaimInputObj: any = {};
          individualClaimInputObj.pCLAIM_ID = this.individualClaimSubmitForm.controls.CLAIM_ID.value?.join();
          individualClaimInputObj.pAction = this.individualClaimSubmitForm.controls.ACTION.value;

          if(jQuery('#dd_dashboard_individual_reason').dropdown('get value') == "Your Own Comment"){
            individualClaimInputObj.pRemark = this.individualClaimSubmitForm.controls.REMARKS.value;
          }
          else{
            individualClaimInputObj.pRemark = jQuery('#dd_dashboard_individual_reason').dropdown('get value');
          }

          individualClaimInputObj.pFromRole = this.role;
          individualClaimInputObj.pToRole = this.individualClaimSubmitForm.controls.USER.value;

          this.claimsService.updateApproverIndividualClaimCustody(individualClaimInputObj).subscribe((claimsDashboardResponse) => {
            if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT.length > 0){
              let i = 0;

              this.custodyMessageObj = [];

              claimsDashboardResponse.RESPONSE_OUT.filter((item) => {
                this.custodyMessageObj[i] = new Object();
                this.custodyMessageObj[i].CLAIM_ID = item.claimId;
                this.custodyMessageObj[i].MESSAGE = item.successMsgOut;
                i++;
              });

              $('.loader').hide();
              
              setTimeout(() => {
                jQuery('#modal_custody_message').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show'); 
                
                this.dragAndScrollCustodyMessageTable();
              }, 0);
            }
            else{
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
            }

            this.searchFilter(true);
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{  
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
            }
          });
        },
        key: 'claimDashboardDialog'
      });
    }
  }

  getSelectedGroupClaimId(){
    let gClaimId: Array<string> = [];

    this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.setValue([]);

    gClaimId = this.selectedGroupClaims.map((item) => item.g_CLAIM_ID);

    this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.setValue(gClaimId);
  }

  exportGroupClaims() {
    if (this.groupClaimInputObj != null) {
      $('.loader').show();

      let groupClaimInputObj = JSON.parse(JSON.stringify(this.groupClaimInputObj));
      groupClaimInputObj.pG_CLAIM_ID = this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value;
      groupClaimInputObj.pageSize = '0';
      groupClaimInputObj.pageNumber = '0';

      this.claimsService.exportApproverGroupClaims(groupClaimInputObj).subscribe((claimsDashboardResponse) => {
        const blob = claimsDashboardResponse;
        const url = window.URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = "Group-Claim-Details.xlsx";
        link.click();
        $('.loader').hide();
      }, (error) => {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        $('.loader').hide();
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Exporting Group Claims Data', life: 7000 });
        }
      });
    }
  }

  groupClaimCustodyUpdate(){
    this.groupClaimSubmitForm.markAllAsTouched();
    
    if(this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value == null || this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value == ""){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
      return;
    }
    else if(this.role == "MGDC" && this.status == "ESND" && (this.groupClaimSubmitForm.controls.ACTION.value == "HOLD" || this.groupClaimSubmitForm.controls.ACTION.value == "REJT" || this.groupClaimSubmitForm.controls.ACTION.value == "RECO")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail:'This Action is Not Allowed', life: 7000});
    }
    else if(this.groupClaimSubmitForm.controls.ACTION.value == "VRFD"){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail: 'This Action is Not Allowed from Dashboard', life: 7000});
    }
    else if(this.groupClaimSubmitForm.invalid){
      return;
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.groupClaimSubmitForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let groupClaimInputObj: any = {};
          groupClaimInputObj.pGclaim_id = this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value?.join();
          groupClaimInputObj.pAction = this.groupClaimSubmitForm.controls.ACTION.value;

          if(jQuery('#dd_dashboard_group_action').dropdown('get value') == "Your Own Comment"){
            groupClaimInputObj.pRemark = this.groupClaimSubmitForm.controls.REMARKS.value;
          }
          else{
            groupClaimInputObj.pRemark = jQuery('#dd_dashboard_group_action').dropdown('get value');
          }

          
          groupClaimInputObj.pFromRole = this.role;
          groupClaimInputObj.pToRole = this.groupClaimSubmitForm.controls.USER.value;

          this.claimsService.postApproverGroupClaim(groupClaimInputObj).subscribe((claimsDashboardResponse) => {
            if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT.length > 0){
              let i = 0;

              this.custodyMessageObj = [];

              claimsDashboardResponse.RESPONSE_OUT.filter((item) => {
                this.custodyMessageObj[i] = new Object();
                this.custodyMessageObj[i].CLAIM_ID = item.claimId;
                this.custodyMessageObj[i].MESSAGE = item.successMsgOut;
                i++;
              });

              $('.loader').hide();
              
              setTimeout(() => {
                jQuery('#modal_custody_message').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show'); 
                
                this.dragAndScrollCustodyMessageTable();
              }, 0);
            }
            else{
              $('.loader').hide();
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }

            this.searchFilter(true);
          }, (error) => {
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
            }
            else if(error && error.status && error.status == 500 && error.message){
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
            }
            else{  
              this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Group Claim Custody', life: 7000 });
            }
          });
        },
        key: 'claimDashboardDialog'
      });
    }
  }

  getIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId){
    $('.loader').show();

    this.claimsService.getApproverIndividualBasicClaimsDetails(chassisNo, schemeId, position, claimId).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.individualClaimsPreSelectedData = claimsDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, true);
      }
      else{
        $('.loader').hide();
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details By Chassis', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details By Chassis', life: 7000});
      }
    });
  }

  getGroupBasicClaimsDetails(schemeId, ppl, position){
    $('.loader').show();
    
    this.claimsService.getApproverGroupBasicClaimsDetails(schemeId, ppl, position).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.groupClaimsPreSelectedData = claimsDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId('', schemeId, false);
      }
      else{
        this.sharedService.groupClaimsPreSelectedData = {};
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details', life: 7000});
      }
    });
  }

  getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, isIndividualClaim){
    this.claimsService.getApproverClaimLimit(chassisNo, schemeId).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != ""){
        if(isIndividualClaim){
          this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDashboardResponse.CLAIM_LIMIT;
        }
        else{
          this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDashboardResponse.CLAIM_LIMIT;
        }
        
        setTimeout(() => {
          $('.loader').hide();

          if(isIndividualClaim){
            if(this.isIndividualClaimView){
              jQuery('#modal_individual_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  
              this.individualClaimViewTabsLazyComp = import('../claim-tabs-view/claim-tabs-view.component').then(({ClaimTabsViewComponent}) => ClaimTabsViewComponent);
            }
            else{
              this.newIndividualClaim(); 
            }
          }
          else{
            if(this.isGroupClaimView){
              jQuery('#modal_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  
              this.groupClaimViewTabsLazyComp = import('../group-claim-approver-view-tabs/group-claim-approver-view-tabs.component').then(({GroupClaimApproverViewTabsComponent}) => GroupClaimApproverViewTabsComponent);
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
        this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Limit', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Limit', life: 7000});
      }
    });
  }

  newIndividualClaim(){
    jQuery('#modal_individual_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.individualClaimTabsLazyComp = import('../claim-tabs/claim-tabs.component').then(({ClaimTabsComponent}) => ClaimTabsComponent);
  }

  editIndividualClaim(chassisNo, claimId, schemeId, status){
    this.isIndividualClaimView = false;
    this.sharedService.isClaimEdit = true;
    this.sharedService.status = status;
    this.sharedService.changeClaimId(claimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, "", claimId);

      this.individualClaimHeader = "Edit Individual Claim";
    }, 0);
  }

  closeIndividualClaim(){
    jQuery('#modal_individual_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

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

    jQuery('#model_available_discount_external').remove();
    jQuery('#model_avail_concession_external').remove();
    jQuery('#model_actual_concession_crm_external').remove();
    jQuery('#model_crm_credit_amount_external').remove();

    setTimeout(() => {
      this.getIndividualBasicClaimsDetails(chassisNo, schemeId, this.position, claimId);
    }, 0);
  }

  closeIndividualClaimView(){
    jQuery('#modal_individual_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeClaimId("");
    this.sharedService.claimObjById = {};
    this.individualClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getIndividualClaims();
  }

  newGroupClaim(){
    jQuery('#modal_group_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

    this.groupClaimTabsLazyComp = import('../group-claim-approver-tabs/group-claim-approver-tabs.component').then(({GroupClaimApproverTabsComponent}) => GroupClaimApproverTabsComponent);
  }

  editGroupClaim(groupClaimId, schemeId, status, ppl){
    this.isGroupClaimView = false;
    this.sharedService.isGroupClaimEdit = true;
    this.sharedService.status = status;
    this.sharedService.changeGroupClaimId(groupClaimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getGroupBasicClaimsDetails(schemeId, ppl, "");

      this.groupClaimHeader = "Edit Group Claim";
    }, 0);
  }

  closeGroupClaim(){
    jQuery('#modal_group_claim_creation').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeGroupClaimId('');
    this.sharedService.changeSchemeId('');
    this.sharedService.groupClaimObjById = {};
    this.sharedService.isGroupClaimEdit = false;
    this.groupClaimTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.searchFilter(true);
  }

  openGroupClaimView(groupClaimId, schemeId, status, ppl){
    this.isGroupClaimView = true;
    this.sharedService.status = status;
    this.sharedService.changeGroupClaimId(groupClaimId);
    this.sharedService.changeSchemeId(schemeId);

    setTimeout(() => {
      this.getGroupBasicClaimsDetails(schemeId, ppl, "");
    }, 0);
  }

  closeGroupClaimView(){
    jQuery('#modal_group_claim_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.changeGroupClaimId("");
    this.sharedService.groupClaimObjById = {};
    this.groupClaimViewTabsLazyComp = null;
    this.sharedService.changeAction('');
    this.sharedService.changeRemark('');

    this.getGroupClaims();
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
    jQuery('#model_scheme_view').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
    
    this.sharedService.schemeViewUrl = "";
    
    setTimeout(() => {
      this.sharedService.schemeViewUrl = environment.IMSANGULARURL + '/schemestabsview?schemeId=' + schemeId;
    }, 0);
  }

  closeSchemeView() {
    this.sharedService.schemeViewUrl = "";
  }

  closeCustodyMessage(){
    jQuery('#modal_custody_message').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide'); 
    this.custodyMessageObj = [];
  }

  openAvailConcession(){
    setTimeout(() => {
      jQuery('#model_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availConcessionLazyComp = import('../avail-concession/avail-concession.component').then(({AvailConcessionComponent}) => AvailConcessionComponent);
    }, 0);
  }

  closeAvailConcession(){
    jQuery('#model_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availConcessionLazyComp = null;
  }

  openAvailableDiscount(){
    setTimeout(() => {
      jQuery('#model_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availableDiscountLazyComp = import('../available-discount/available-discount.component').then(({AvailableDiscountComponent}) => AvailableDiscountComponent);
    }, 0);
  }

  closeAvailableDiscount(){
    this.sharedService.changeTMInvNo("");
    
    jQuery('#model_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availableDiscountLazyComp = null;
  }

  openCRMCreditAmount(){
    setTimeout(() => {
      jQuery('#model_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.crmCreditAmountLazyComp = import('../crm-credit-amount/crm-credit-amount.component').then(({CrmCreditAmountComponent}) => CrmCreditAmountComponent);
    }, 0);
  }

  closeCRMCreditAmount(){
    jQuery('#model_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.crmCreditAmountLazyComp = null;
  }

  openActualConcessionCRM(){
    setTimeout(() => {
      jQuery('#model_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.actualConcessionCRMLazyComp = import('../actual-concession-crm/actual-concession-crm.component').then(({ActualConcessionCrmComponent}) => ActualConcessionCrmComponent);
    }, 0);
  }

  closeActualConcessionCRM(){
    jQuery('#model_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.actualConcessionCRMLazyComp = null;
  }

  toggleSearchFilters() {
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }
  
  getAction(role: string, schemeTypeValue: string, status: string) {
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((claimDetailsResponse) => {
      if (claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT.length > 0) {
        this.actionList = claimDetailsResponse.RESPONSE_OUT;
      }
      else {
        this.actionList = [];

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Action', life: 7000 });
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Action Data', life: 7000 });
      }
    });
  }

  getUserList(flag){
    if(flag && (this.individualClaimSubmitForm.controls.CLAIM_ID.value == null || this.individualClaimSubmitForm.controls.CLAIM_ID.value == "")){
      jQuery('#dd_dashboard_individual_action').dropdown('clear');
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
      return;
    }
    else if(!flag && (this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value == null || this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value == "")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
      return;
    }

    $('#dd_dashboard_individual_user').parent().addClass('loading');
    $('#dd_dashboard_individual_user').parent().addClass('disabled');
    $('#dd_dashboard_group_user').parent().addClass('loading');
    $('#dd_dashboard_group_user').parent().addClass('disabled');

    let approverUserListInputParams: HttpParams = new HttpParams();

    if(flag){
      approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.individualClaimSubmitForm.controls.CLAIM_ID.value[0]);
      approverUserListInputParams = approverUserListInputParams.set('action_IN', this.individualClaimSubmitForm.controls.ACTION.value);
      approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'IND');
      approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);
    }
    else{
      approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.groupClaimSubmitForm.controls.GROUP_CLAIM_ID.value[0]);
      approverUserListInputParams = approverUserListInputParams.set('action_IN', this.groupClaimSubmitForm.controls.ACTION.value);
      approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'GRP');
      approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);
    }

    this.claimsService.getApproverUserList(approverUserListInputParams).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.COUNT && claimsDashboardResponse.COUNT != null && claimsDashboardResponse.COUNT != "" && claimsDashboardResponse.COUNT > 0){
        flag ? this.individualUserList = claimsDashboardResponse.RESPONSE_OUT : this.groupUserList = claimsDashboardResponse.RESPONSE_OUT;
      }
      else if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.COUNT && claimsDashboardResponse.COUNT != null && claimsDashboardResponse.COUNT != "" && claimsDashboardResponse.COUNT <= 0){
        this.individualUserList = [];
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail: 'No Data Available for User Names', life: 7000});
      }
      else{
        this.individualUserList = [];
        this.groupUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names: ' + claimsDashboardResponse.RESPONSE_OUT, life: 7000});
      }
      
      $('#dd_dashboard_individual_user').parent().removeClass('loading');
      $('#dd_dashboard_individual_user').parent().removeClass('disabled');
      $('#dd_dashboard_group_user').parent().removeClass('loading');
      $('#dd_dashboard_group_user').parent().removeClass('disabled');
    }, (error) => {
      $('#dd_dashboard_individual_user').parent().removeClass('loading');
      $('#dd_dashboard_individual_user').parent().removeClass('disabled');
      $('#dd_dashboard_group_user').parent().removeClass('loading');
      $('#dd_dashboard_group_user').parent().removeClass('disabled');

      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names', life: 7000});
      }
    });
  }
  
  getFinancierNames() {
    this.claimsService.getFinancierNames().subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "") {
        this.financierNameList = claimsDashboardResponse.RESPONSE_OUT;
      }
      else{
        this.financierNameList = [];

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDashboardMessage', severity:'info', summary: 'Note', detail: 'No Data Available for Financer Names', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({key: 'claimsDashboardMessage', severity:'error', summary: 'Error', detail: 'Error Getting Financer Names', life: 7000});
      }
    });
  }

  openAdvanceSearch(){
    jQuery('#modal_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeAdvanceSearch(){
    jQuery('#modal_advance_search').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }
       
  openBeneficiaryName() {
    this.beneficiaryNameObj = [];
    
    this.beneficiaryNameModalForm.reset();

    jQuery('#model_beneficiary_name').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }
  
  closeBeneficiaryName() {
    this.beneficiaryNameObj = [];

    jQuery('#model_beneficiary_name').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  selectBeneficiaryName(beneficiaryNameItem) {
    this.closeBeneficiaryName();

    $('#txt_dashboard_beneficiary_name').val(beneficiaryNameItem.beneficiery_USER_ID);
  }

  getBeneficiaryName() {
    this.beneficiaryNameModalForm.markAllAsTouched();

    if(this.beneficiaryNameModalForm.invalid){
      return;
    }

    this.beneficiaryNameLoading = true;
    
    this.beneficiaryNameInputParams = new HttpParams();
    this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pSelectFilter', jQuery('#dd_dashboard_beneficiary_search_filter').dropdown('get value'));
    this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pSearchColumn', jQuery('#dd_dashboard_beneficiary_search_column').dropdown('get value'));
    this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pSearchValue', $('#txt_dashboard_search_beneficiary_name').val().toString().trim());
    this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pageNumber', '1');
    this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pageSize', this.btableSize.toString());
    
    this.claimsService.getBeneficiaryName(this.beneficiaryNameInputParams).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT.DETAILS && claimsDashboardResponse.RESPONSE_OUT.DETAILS != null && claimsDashboardResponse.RESPONSE_OUT.DETAILS != "" && claimsDashboardResponse.RESPONSE_OUT.DETAILS.length > 0){
        this.btableCount = claimsDashboardResponse.RESPONSE_OUT.COUNT;
        this.beneficiaryNameObj = claimsDashboardResponse.RESPONSE_OUT.DETAILS;
        this.isBeneficiaryNameObj = true;
      }
      else{
        this.beneficiaryNameObj = [];
        this.btableCount = 0;
        this.isBeneficiaryNameObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Beneficiary Details', life: 7000 });
      }

      this.bpager.currentPage = 1;
      this.bpager.pageSize = this.btableSize;

      const page = 1;

      this.bpager = this.sharedService.getPager(this.btableCount, page, this.btableSize);

      this.beneficiaryNameLoading = false;
    }, (error) => {
      this.beneficiaryNameLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{  
        this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Beneficiary Details', life: 7000 });
      }
    });
  }

  beneficiaryNameSizeChanged(event) {
    jQuery('#dd_dashboard_beneficiary_size').dropdown('set selected', event.target.value);
    this.btableSize = event.target.value;
    this.setBeneficiaryPage(1);
  }

  setBeneficiaryPage(page: number) {
    if(this.beneficiaryNameInputParams != null){
      this.beneficiaryNameLoading = true;
      this.isBeneficiaryNameObj = false;
  
      if(page < 1 || page > this.bpager.totalPages){
        this.beneficiaryNameLoading = false;
        return;
      }
  
      this.bpager = this.sharedService.getPager(this.btableCount, page, this.btableSize);
  
      this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pageNumber', this.bpager.currentPage.toString())
      this.beneficiaryNameInputParams = this.beneficiaryNameInputParams.set('pageSize', this.bpager.pageSize.toString())
      
      this.claimsService.getBeneficiaryName(this.beneficiaryNameInputParams).subscribe((claimsDashboardResponse ) => {
        if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != "" && claimsDashboardResponse.STATUS_OUT && claimsDashboardResponse.STATUS_OUT != null && claimsDashboardResponse.STATUS_OUT != "" && claimsDashboardResponse.STATUS_OUT == "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != "" && claimsDashboardResponse.RESPONSE_OUT.DETAILS && claimsDashboardResponse.RESPONSE_OUT.DETAILS != null && claimsDashboardResponse.RESPONSE_OUT.DETAILS != "" && claimsDashboardResponse.RESPONSE_OUT.DETAILS.length > 0){
          this.beneficiaryNameObj = claimsDashboardResponse.RESPONSE_OUT.DETAILS;
          this.isBeneficiaryNameObj = true;
        }
        else{
          this.beneficiaryNameObj = [];
          this.btableCount = 0;
          this.isBeneficiaryNameObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Beneficiary Details', life: 7000 });
        }

        this.beneficiaryNameLoading = false;
      }, (error) => {
        this.beneficiaryNameLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{  
          this.messageService.add({ key: 'claimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Beneficiary Details', life: 7000 });
        }
      });
    }
  }

  editButtonIndividual(i){
    if(this.isGDCHold){
      return true;
    }
    else if(this.individualClaimObj[i].st_ID == "CSAP" || this.individualClaimObj[i].st_ID == "HOLD" || this.individualClaimObj[i].st_ID == "REJD" || this.individualClaimObj[i].st_ID == "EXST"){
      return false;
    }
    else if(this.isGDCFinance && this.individualClaimObj[i].st_ID == "ESND"){
      return true;
    }
    else{
      return true;
    }
  }

  editButtonGroup(i){
    if(this.isGDCHold){
      return true;
    }
    else if(this.groupClaimObj[i].st_ID == "CSAP" || this.groupClaimObj[i].st_ID == "HOLD" || this.groupClaimObj[i].st_ID == "REJD" || this.groupClaimObj[i].st_ID == "EXST"){
      return false;
    }
    else if(this.isGDCFinance && this.groupClaimObj[i].st_ID == "ESND"){
      return true;
    }
    else{
      return true;
    }
  }
}
