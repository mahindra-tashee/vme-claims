import { Component, OnInit, Type } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ClaimDetailsComponent } from '../claim-details/claim-details.component';
import { ClaimsService } from '../services/claims.service';

import * as $ from "jquery";
declare var jQuery: any;

import { ActionHistoryComponent } from '../action-history/action-history.component';
import { SharedService } from '../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { ClaimDetailsViewComponent } from '../claim-details-view/claim-details-view.component';
import { DocumentViewComponent } from '../document-view/document-view.component';
import { EwDetailsViewComponent } from '../ew-details-view/ew-details-view.component';
import { AmcDetailsViewComponent } from '../amc-details-view/amc-details-view.component';
import { ClaimDealerDetailsViewComponent } from '../claim-dealer-details-view/claim-dealer-details-view.component';
import { DealerDocumentsViewComponent } from '../dealer-documents-view/dealer-documents-view.component';
import { InsurancePolicyDetailsComponent } from '../insurance-policy-details/insurance-policy-details.component';
import { DealerConfirmationAuditComponent } from '../dealer-confirmation-audit/dealer-confirmation-audit.component';
import { NFADetailsViewComponent } from '../nfadetails-view/nfadetails-view.component';
import { FinancierDetailsComponent } from '../financier-details/financier-details.component';
import { first } from 'rxjs/operators';
import { ExchangeDetailsComponent } from '../exchange-details/exchange-details.component';
import { LoyaltyDetailsComponent } from '../loyalty-details/loyalty-details.component';

@Component({
  selector: 'app-claim-dealer-tabs-view',
  templateUrl: './claim-dealer-tabs-view.component.html',
  styleUrls: ['./claim-dealer-tabs-view.component.scss']
})
export class ClaimDealerTabsViewComponent implements OnInit {
  ewDetailsLazyComp: Promise<Type<EwDetailsViewComponent>>;
  amcDetailsLazyComp:Promise<Type<AmcDetailsViewComponent>>;
  claimsDetailsViewLazyComp:Promise<Type<ClaimDealerDetailsViewComponent>>;
  documentsViewLazyComp: Promise<Type<DealerDocumentsViewComponent>>;
  actionHistoryLazyComp: Promise<Type<ActionHistoryComponent>>;
  insurancePolicyLazyComp: Promise<Type<InsurancePolicyDetailsComponent>>;
  dealerConfirmationLazyComp: Promise<Type<DealerConfirmationAuditComponent>>;
  nfaDetailsLazyComp: Promise<Type<NFADetailsViewComponent>>;
  financierLazyComp: Promise<Type<FinancierDetailsComponent>>;
  exchangeLazyComp:Promise<Type<ExchangeDetailsComponent>>;
  loyaltyLazyComp:Promise<Type<LoyaltyDetailsComponent>>;
  isTMI: boolean = false;
  isFinancier: boolean = false;
  isAMC: boolean = false;
  isEW: boolean = false;
  isDealeConfirmation: boolean = false;
  isNFADetails: boolean = false;
  isExchange: boolean = false;
  isLoyalty: boolean = false;
  actionList: any;

  constructor(private messageService:MessageService,
              private formBuilder: FormBuilder,
              private claimsService:ClaimsService,
              private sharedService:SharedService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.resetSteps();
    
    this.route.queryParams.subscribe((params) => {
      if(params['chassisNo'] != undefined && params['chassisNo'] != null && params['chassisNo'] != "" && params['schemeId'] != undefined && params['schemeId'] != null && params['schemeId'] != "" && params['claimId'] != undefined && params['claimId'] != null && params['claimId'] != ""){
        this.sharedService.messageKey = "claimDealerDashboardMessage";
        this.sharedService.changeClaimId(params['claimId']);
        this.sharedService.changeChassisNo(params['chassisNo']);
        this.sharedService.changeSchemeId(params['schemeId']);

        setTimeout(() => {
          this.getBasicClaimsDetails(params['chassisNo'], params['schemeId'], params['claimId']);
        }, 0);
      }
      else{
        this.sharedService.messageKey = "claimDealerDashboardMessage";
        
        this.sharedService.getClaimId().subscribe((response) => {
          if(response && response != null && response != ""){
            this.getClaimDataById(response, false);
          }
        });
      }
    });

    this.sharedService.getClaimIdNotAvailable().subscribe((response) => {
      if(response && response == true){
        $('html,body,div').animate({ scrollTop: 0 }, 'fast');

        this.resetSteps();

        setTimeout(() => {
          this.messageService.add({key: 'claimDealerTabsViewMessage', severity:'info', summary: 'Note', detail:'Please Create Claim', life: 7000});
        }, 0);

        this.sharedService.changeClaimIdNotAvailable(false);
      }
    });
  }

  getBasicClaimsDetails(chassisNo, schemeId, claimId){
    this.claimsService.getIndividualBasicClaimsDetails(chassisNo, schemeId, '', claimId).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.individualClaimsPreSelectedData = claimsDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, claimId);
      }
      else{
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details By Chassis', life: 7000});
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
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details By Chassis', life: 7000});
      }
    });
  }

  getClaimLimitByChassisNoSchemeId(chassisNo, schemeId, claimId){
    this.claimsService.getClaimLimit(chassisNo, schemeId).subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse != null && claimsDashboardResponse != ""){
        this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = claimsDashboardResponse.CLAIM_LIMIT;
    
        setTimeout(() => {
          this.getClaimDataById(claimId, true);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Limit', life: 7000});
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
        this.messageService.add({key: 'claimsDealerDashboardMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Limit', life: 7000});
      }
    });
  }

  getClaimDataById(claimId, flag){
    let claimObjById: any;

    this.claimsService.getClaimDetailsById(claimId).subscribe((claimTabsViewResponse) => {
      if(claimTabsViewResponse && claimTabsViewResponse.STATUS_OUT == "SUCCESS" && claimTabsViewResponse.RESPONSE_OUT != null){
        claimObjById = claimTabsViewResponse.RESPONSE_OUT[0];

        if(flag){
          this.sharedService.changeBusinessUnit(claimObjById.bu_ID);
        }
        
        this.sharedService.claimObjById = claimObjById;

        this.sharedService.changeSchemeId(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_ID);
        this.sharedService.changeChassisNo(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.chassis);
        this.sharedService.changeNFANo(claimObjById?.nfa_NO);
        
        setTimeout(() => {
          this.claimsDetailsViewLazyComp = import('../claim-dealer-details-view/claim-dealer-details-view.component').then(({ClaimDealerDetailsViewComponent}) => ClaimDealerDetailsViewComponent);
          this.documentsViewLazyComp = import('../dealer-documents-view/dealer-documents-view.component').then(({DealerDocumentsViewComponent}) => DealerDocumentsViewComponent);
         
          let schemeId: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID;
          let type: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.type;
          let settlementType: string = this.sharedService.individualClaimsPreSelectedData.settlementTypeDetailEntity.settlement_TYPE;

          if(type.includes('TMI')){
            this.isTMI = true;

            setTimeout(() => {
              this.insurancePolicyLazyComp = import('../insurance-policy-details/insurance-policy-details.component').then(({InsurancePolicyDetailsComponent}) => InsurancePolicyDetailsComponent);
            }, 0);
          }
          else if(type.includes('AMC')){
            this.isAMC = true;
            
            setTimeout(() => {
              this.amcDetailsLazyComp = import('../amc-details-view/amc-details-view.component').then(({AmcDetailsViewComponent}) => AmcDetailsViewComponent);
            }, 0);
          }
          else if(type.includes('EW')){
            this.isEW = true;
            
            setTimeout(() => {
              this.ewDetailsLazyComp = import('../ew-details-view/ew-details-view.component').then(({EwDetailsViewComponent}) => EwDetailsViewComponent);
            }, 0);
          }
          else if(type.includes('FS')){
            this.isFinancier = true;
            
            setTimeout(() => {
              this.financierLazyComp = import('../financier-details/financier-details.component').then(({FinancierDetailsComponent}) => FinancierDetailsComponent);
            }, 0);
          }
          else if(type.includes('EXC')){
            this.isExchange = true;
            
            setTimeout(() => {
              this.exchangeLazyComp = import('../exchange-details/exchange-details.component').then(({ExchangeDetailsComponent}) => ExchangeDetailsComponent);
            }, 0);
          }
          else if(type.includes('LYT')){
            this.isLoyalty = true;
            
            setTimeout(() => {
              this.loyaltyLazyComp = import('../loyalty-details/loyalty-details.component').then(({LoyaltyDetailsComponent}) => LoyaltyDetailsComponent);
            }, 0);
          }
          else if(schemeId == 'SCHM-X' || schemeId == 'SCHM-O' || schemeId == 'SCHM-P' || schemeId == 'SCHM-S'){
            this.isNFADetails = true;

            setTimeout(() => {
              this.nfaDetailsLazyComp = import('../nfadetails-view/nfadetails-view.component').then(({NFADetailsViewComponent}) => NFADetailsViewComponent);
            }, 0);
          }
          else{
            this.isTMI = false;
            this.isAMC = false;
            this.isEW = false;
            this.isNFADetails = false;
            this.isLoyalty = false;
            this.isExchange = false;
            this.isFinancier = false;
          }

          if(settlementType.includes('SD')){
            this.isDealeConfirmation = true;
            
            setTimeout(() => {
              this.dealerConfirmationLazyComp=import('../dealer-confirmation-audit/dealer-confirmation-audit.component').then(({DealerConfirmationAuditComponent}) => DealerConfirmationAuditComponent);
            }, 0);
          }
          else{
            this.isDealeConfirmation = false;
          }
          
          this.actionHistoryLazyComp = import('../action-history/action-history.component').then(({ActionHistoryComponent}) => ActionHistoryComponent);
          
          this.resetSteps();
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDealerTabsViewMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDealerTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDealerTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDealerTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDealerTabsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDealerTabsViewMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    });
  }

  resetSteps(): void{
    $('.app-form').hide();
    $('.app-form.first-form').show();
    $('.step').removeClass('active');
    $('#first.step').addClass('active');

    $('.ui.mini.steps .step').click(function(){
      $('.ui.mini.steps .step').removeClass('active');
      $(this).addClass('active');
      var target = '.app-form.' + $(this).attr('id') + '-form';
      $('.app-form').hide();
      $(target).show();
    });
  }
}
