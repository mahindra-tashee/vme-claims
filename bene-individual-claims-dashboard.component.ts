import { Component, OnInit } from '@angular/core';

import * as $ from "jquery";
declare var jQuery: any;

import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { IndividualClaim, IndividualClaimDetails } from '../models/individual-claim.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { BusinessUnit } from '../models/business-unit.model';
import { GeoMapping } from '../models/geo-mapping.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bene-individual-claims-dashboard',
  templateUrl: './bene-individual-claims-dashboard.component.html',
  styleUrls: ['./bene-individual-claims-dashboard.component.scss']
})
export class BeneIndividualClaimsDashboardComponent implements OnInit {
  isToggleSearchFilters: boolean=false;
  individualClaimLoading: boolean=false;
  isBeneIndividualClaimObj: boolean=false;
  individualClaimInputParams: any={};
  show: boolean;
  buttonName: string;
  pager: any = {};
  tableCount: number;
  tableSize: number = 10;
  actionList: any;
  submitViewForm: any;
  beneClaimDetailsObj: any;
  SchemeType: string;
  individualClaimInputObj :any ={};
  selectedIndividualClaims: any;
  position: string = "" ;
  role :string = "" ;
  isIndividualClaim: boolean = true;
  isIndividualClaimObj: boolean = false;
  individualClaimObj: Array<IndividualClaim> = [];
  beneIndividualClaimObj: Array<IndividualClaim> = [];
  businessUnitList: Array<BusinessUnit> = [];
  geoMappingList: Array<GeoMapping> = [];
  businessUnit: string = "";
  action: string = "";
  remarks: string = "";
  pRemarks :any;
  pAction :any;
  claimIdArray:any;
  beneIndividualObj: any;
  isClaimIdSelected: boolean;

  constructor(private messageService:MessageService,
              public sharedService:SharedService,
              private formBuilder:FormBuilder,
              private claimsService:ClaimsService,
              private datePipe: DatePipe,
              private confirmationService :ConfirmationService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.dragAndScrollBeneIndividualTable();
    this.getBusinessUnit();

    this.route.queryParams.subscribe((params) => {
      if(params && params != null && params['role'] && params['role'] != null && params['role'] != ""){
        this.role = params['role'];
      }
    });

    this.route.queryParams.subscribe((params) => {
      if(params && params != null && params['position'] && params['position'] != null && params['position'] != ""){
        this.position = params['position'];
      }
    });
  }
  initializeComponent(): void {
    jQuery('#dd_individual_dashboard_claim_amount_type').dropdown();
    jQuery('#dd_dashboard_bene_individual_size').dropdown();
    jQuery('#dd_bene_individual_action').dropdown();
    jQuery('#dd_bene_individual_dashboard_business_unit').dropdown();

    jQuery('#range_claim_amount').range({
      min: 0,
      max: 500000,
      start: 0,
      step: 1,
      onChange: function (value) {
        $('#span_claim_amount').html(value);
      }
    });
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('.tabular.menu .item').tab({history:false});
      jQuery('.menu .item').tab();
    }, 0);

  this.createOrEditForm();
  }

  createOrEditForm() {
    this.submitViewForm = this.formBuilder.group({
      CLAIM_ID :[''],
      ACTION: [this.beneClaimDetailsObj?.action, Validators.required],
      REMARKS: [this.beneClaimDetailsObj?.remark, Validators.required]
    });
  }

  getBusinessUnit(){
    jQuery('#dd_bene_individual_dashboard_business_unit').parent().addClass('disabled');

    this.claimsService.getBusinessUnit().subscribe((claimsDealerDashboardResponse) => {
      if(claimsDealerDashboardResponse && claimsDealerDashboardResponse != null && claimsDealerDashboardResponse != ""){
        this.geoMappingList = claimsDealerDashboardResponse;

        for(let i = 0; i < this.geoMappingList.length; i++){
          this.businessUnitList[i] = new BusinessUnit();
          this.businessUnitList[i].text = this.geoMappingList[i].BU;
          this.businessUnitList[i].value = this.geoMappingList[i].BU;
        }

        setTimeout(() => {
          jQuery('#dd_bene_individual_dashboard_business_unit').dropdown('set selected', this.businessUnitList[0].value);

          this.sharedService.changeBusinessUnit(this.businessUnitList[0].value);

          this.businessUnit = this.businessUnitList[0].value;

          this.searchFilter(true);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Business Unit Data', life: 7000});
    });
  }

  searchFilter(flag){
    this.selectedIndividualClaims = [];
    this.individualClaimInputObj = new Object();

    if($('#txt_individual_dashboard_claim_id').val().toString().trim()  != null && $('#txt_individual_dashboard_claim_id').val().toString().trim()  != ""){
      this.individualClaimInputObj.pCLAIM_ID = $('#txt_individual_dashboard_claim_id').val().toString().trim() != null && $('#txt_individual_dashboard_claim_id').val().toString().trim() != "" ? $('#txt_individual_dashboard_claim_id').val().toString().trim().split(',') : [];
    }
    else{
      this.individualClaimInputObj.pCLAIM_ID = [];
    }

    if($('#txt_individual_dashboard_chassis_no').val().toString().trim() != null && $('#txt_individual_dashboard_chassis_no').val().toString().trim() != ""){
      this.individualClaimInputObj.pCHASSIS_NO = $('#txt_individual_dashboard_chassis_no').val().toString().trim().split(',');
    }
    else{
      this.individualClaimInputObj.pCHASSIS_NO = [];
    }

    if(jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('get value') != null && jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('get value') != "" && jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('get value') != "NA"){
      this.individualClaimInputObj.pAMT_OPT = jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('get value');
      this.individualClaimInputObj.pAMT = $('#span_claim_amount').text().toString().trim();
    }
    else{
      this.individualClaimInputObj.pAMT_OPT = '';
      this.individualClaimInputObj.pAMT = '';
    }

    if(jQuery('#dd_bene_individual_dashboard_business_unit').dropdown('get value') != null && jQuery('#dd_bene_individual_dashboard_business_unit').dropdown('get value') != "" && jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('get value') != "NA"){
      this.individualClaimInputObj.pBU_ID = jQuery('#dd_bene_individual_dashboard_business_unit').dropdown('get value');
    }
    else{
      this.individualClaimInputObj.pBU_ID = '';
    }

    this.individualClaimInputObj.pPOSITION = this.position;
    this.individualClaimInputObj.pROLE = this.role;
    this.individualClaimInputObj.pBLOCK_FLAG = '';
    this.individualClaimInputObj.pSTOCK_TRANSFER = '';
    this.individualClaimInputObj.pMONTH_YEAR = '';
    this.individualClaimInputObj.pSCHEME_NAME = '';
    this.individualClaimInputObj.pST_DESC = '';
    this.individualClaimInputObj.pDATE_TYPE = '';
    this.individualClaimInputObj.pFROM_DATE = '';
    this.individualClaimInputObj.pTO_DATE = '';
    this.individualClaimInputObj.pROLE_DESCRIPTION = '';
    this.individualClaimInputObj.pSTM_ID = [];
    this.individualClaimInputObj.pSCHEME_ID = [];
    this.individualClaimInputObj.pDEALER_CODE = '';
    this.individualClaimInputObj.pNFA_NO = [];
    this.individualClaimInputObj.pCLAIM_TYPE = '';
    this.individualClaimInputObj.pCUST_ROLE = '';
    this.individualClaimInputObj.pSTATUS_ID = 'PCON';

    if(!flag && this.role != null && this.role==""){
      this.getIndividualClaims();
    }
    else{
      this.getIndividualClaims();
    }
  } 

  getIndividualClaims(){
    $('.loader').show();
    this.isIndividualClaimObj = false;

    document.getElementById('beneIndividualClaimTable').scrollLeft = 0;

    this.individualClaimInputObj.pageNumber = '1';
    this.individualClaimInputObj.pageSize = this.tableSize.toString();
    this.claimsService.getIndividualClaims(this.individualClaimInputObj).subscribe((beneIndividualClaimDashboardResponse) => {
      if(beneIndividualClaimDashboardResponse && beneIndividualClaimDashboardResponse.STATUS_OUT == "SUCCESS" && beneIndividualClaimDashboardResponse.RESPONSE_OUT.count > 0){
        this.tableCount = beneIndividualClaimDashboardResponse.RESPONSE_OUT.count;
        this.individualClaimObj = beneIndividualClaimDashboardResponse.RESPONSE_OUT.list;
        this.isIndividualClaimObj = true;

        setTimeout(() => {
          for (let i=0;i< this.individualClaimObj.length;i++){
            jQuery('#dd_individual_claim_confirmation_' +[i]).dropdown();
          }
        }, 0);
      }
      else{
        this.individualClaimObj = [];
        this.tableCount = 0;
        this.isIndividualClaimObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
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
        this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
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

      this.claimsService.getIndividualClaims(this.individualClaimInputObj).subscribe((beneIndividualClaimDashboardResponse) => {
        if(beneIndividualClaimDashboardResponse && beneIndividualClaimDashboardResponse.STATUS_OUT === "SUCCESS"){
          this.individualClaimObj = beneIndividualClaimDashboardResponse.RESPONSE_OUT.list;
          this.beneIndividualClaimObj = beneIndividualClaimDashboardResponse.RESPONSE_OUT.list;
          this.isIndividualClaimObj = true;
        }
        else{
          this.tableCount = 0;
          this.individualClaimObj = null;
          this.isIndividualClaimObj = false;

          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Individual Claims', life: 7000});
        }

        $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'beneIndClaimsDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claims Data', life: 7000});
        }
      });
    }
  }

  clearFilter(flag){
    jQuery('#dd_individual_dashboard_claim_amount_type').dropdown('restore defaults');
    $('#txt_individual_dashboard_claim_id').val('');
    $('#txt_individual_dashboard_chassis_no').val('');

    jQuery('#range_claim_amount').range({
      min: 0,
      max: 500000,
      start: 0,
      step: 1,
      onChange: function (value) {
        $('#span_claim_amount').html(value);
      }
    });
    this.searchFilter(true);
  }

  individualClaimCustodyUpdate(){
    this.submitViewForm.markAllAsTouched();

    if(this.selectedIndividualClaims.length < 1){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Please Select atleast 1 Claim', life: 7000 });
      return;
    }
    else if(this.submitViewForm.invalid){
      return;
    }
    else{
      this.confirmationService.confirm({
        message: 'Do You Want to Submit the Claims?',
        header: 'Save Claim',
        accept: () => {
          $('.loader').show();

          let individualClaimsInputObj :IndividualClaim = new IndividualClaim();  
          this.isIndividualClaimObj = false;
          let count :number = 0

          let claimIdArray :Array<string> = [];
          claimIdArray = this.selectedIndividualClaims.map((item)=> item?.claim_ID);

          individualClaimsInputObj.action = this.submitViewForm.controls.ACTION.value;
          individualClaimsInputObj.remarks = this.submitViewForm.controls.REMARKS.value;
          individualClaimsInputObj.benePosition = this.position;

          for(let i = 0 ; i < this.individualClaimObj.length;i++){
            for(let j = 0; j < claimIdArray.length;j++){
              if(claimIdArray[j]== this.individualClaimObj[i].claim_ID){
                this.isClaimIdSelected = true;
                if(this.individualClaimObj[i].claim_AMOUNT != null && this.individualClaimObj[i].claim_AMOUNT != "" && ((Number)(this.individualClaimObj[i].claim_AMOUNT)) > 0 && ((Number)(this.individualClaimObj[i].claim_AMOUNT)) <= ((Number)(this.individualClaimObj[i].claim_AMT_GDC))){
                  individualClaimsInputObj.individualClaim[count] = new IndividualClaimDetails();
                  individualClaimsInputObj.individualClaim[count].claimId =  this.individualClaimObj[i].claim_ID;
                  individualClaimsInputObj.individualClaim[count].claimAmtOrg = this.individualClaimObj[i].claim_AMOUNT_ORG;
                  individualClaimsInputObj.individualClaim[count].custRole = this.individualClaimObj[i].cust_ROLE;
                  individualClaimsInputObj.individualClaim[count].claimAmtMod = this.individualClaimObj[i].claim_AMOUNT;
                  individualClaimsInputObj.individualClaim[count].beneConfirm =  jQuery('#dd_individual_claim_confirmation_'+[i]).dropdown('get value')
                
                  count++;
                }
                else{
                  this.isIndividualClaimObj = true;
                  $('html,body,div').animate({ scrollTop: 0 }, 'slow');
                  this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'info', summary: 'Note', detail: 'Claim Amount Cannot be Greator than GDC  amount ', life: 7000 });
                }
              }
            }
          }
          setTimeout(() => {
            this.submitBeneIndividualClaim(individualClaimsInputObj);
          }, 0);
        },
        key: 'beneIndividualDashboardDialog'
      });
    }
  }

  submitBeneIndividualClaim(individualClaimsInputObj){
    if(this.isClaimIdSelected && !this.isIndividualClaimObj){
      this.claimsService.updateBeneIndividualClaimCustody(individualClaimsInputObj).subscribe((beneIndividualResponse) => {
        if(beneIndividualResponse && beneIndividualResponse != null && beneIndividualResponse != ""){
          this.beneIndividualObj = beneIndividualResponse;
          setTimeout(() => {
            this.submitClaims()
          }, 0);
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: beneIndividualResponse[0].successMsgOut, life: 7000 });
        }

        this.searchFilter(true);
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({ key: 'beneIndClaimsDashboardMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
        }
      });
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
  
  submitClaims(){
    jQuery('#modal_bene_individual_submit_claims').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');
  }

  closeSubmitClaims() {
    jQuery('#modal_bene_individual_submit_claims').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');
  }

  toggleSearchFilters(){
    this.isToggleSearchFilters = !this.isToggleSearchFilters;
  }

  dragAndScrollBeneIndividualTable(){
    const slider = document.querySelector<HTMLElement>('#beneIndividualClaimTable');
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
}