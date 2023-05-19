import { Component, OnInit, Type } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { MessageService } from 'primeng/api';
import { ClaimsService } from '../services/claims.service';
import { ActionHistoryComponent } from '../action-history/action-history.component';
import { SharedService } from '../services/shared.service';
import { ActivatedRoute } from '@angular/router';
import { Action } from '../models/action.model';
import { InsurancePolicyDetailsComponent } from '../insurance-policy-details/insurance-policy-details.component';
import { ClaimDealerDetailsComponent } from '../claim-dealer-details/claim-dealer-details.component';
import { DealerDocumentsComponent } from '../dealer-documents/dealer-documents.component';
import { NFADetailsViewComponent } from '../nfadetails-view/nfadetails-view.component';
import { EwDetailsViewComponent } from '../ew-details-view/ew-details-view.component';
import { AmcDetailsViewComponent } from '../amc-details-view/amc-details-view.component';
import { FinancierDetailsComponent } from '../financier-details/financier-details.component';
import { first } from 'rxjs/operators';
import { ExchangeDetailsComponent } from '../exchange-details/exchange-details.component';
import { LoyaltyDetailsComponent } from '../loyalty-details/loyalty-details.component';

@Component({
  selector: 'app-claim-dealer-tabs',
  templateUrl: './claim-dealer-tabs.component.html',
  styleUrls: ['./claim-dealer-tabs.component.scss']
})
export class ClaimDealerTabsComponent implements OnInit {
  actionList: Array<Action> = [];
  claimsDetailsLazyComp:Promise<Type<ClaimDealerDetailsComponent>>;
  documentsLazyComp: Promise<Type<DealerDocumentsComponent>>;
  actionHistoryLazyComp: Promise<Type<ActionHistoryComponent>>;
  insurancePolicyLazyComp: Promise<Type<InsurancePolicyDetailsComponent>>;
  financierLazyComp: Promise<Type<FinancierDetailsComponent>>;
  nfaDetailsLazyComp: Promise<Type<NFADetailsViewComponent>>;
  ewDetailsLazyComp: Promise<Type<EwDetailsViewComponent>>;
  amcDetailsLazyComp:Promise<Type<AmcDetailsViewComponent>>;
  exchangeLazyComp:Promise<Type<ExchangeDetailsComponent>>;
  loyaltyLazyComp:Promise<Type<LoyaltyDetailsComponent>>;
  isEdit: boolean = false;
  isTMI: boolean = false;
  isNFADetails: boolean = false;
  isAMC: boolean = false;
  isEW: boolean = false;
  isFinancier:boolean = false;
  isExchange:boolean = false;
  isLoyalty:boolean = false;

  constructor(private messageService: MessageService,
              private claimService: ClaimsService,
              private sharedService: SharedService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.resetSteps();

    this.route.queryParams.subscribe((params) => {
      if(params['claimId'] != undefined && params['claimId'] != null && params['claimId'] != ""){
        this.sharedService.messageKey = "claimsDealerDashboardMessage";
        this.sharedService.isClaimEdit = true;
        this.sharedService.changeClaimId(params['claimId']);

        setTimeout(() => {
          this.isEdit = true;
          this.getClaimDataById(params['claimId'], true);
        }, 0);
      }
      else{
        this.sharedService.messageKey = "claimsDealerDashboardMessage";
        
        if(this.sharedService.isClaimEdit){
          this.isEdit = true;

          this.sharedService.getClaimId().subscribe((response) => {
            if(response && response != null && response != ""){
              this.getClaimDataById(response, true);
            }
          });
        }
        else{
          this.isEdit = false;

          this.sharedService.changeSchemeId(this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID);

          this.getAction(this.sharedService.userRole, this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, '');

          this.claimsDetailsLazyComp = import('../claim-dealer-details/claim-dealer-details.component').then(({ClaimDealerDetailsComponent}) => ClaimDealerDetailsComponent);
          this.documentsLazyComp = import('../dealer-documents/dealer-documents.component').then(({DealerDocumentsComponent}) => DealerDocumentsComponent);

          let type: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.type;
          let schemeId: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID;

          if(type.includes('TMI')){
            this.isTMI = true;

            setTimeout(() => {
              this.insurancePolicyLazyComp = import('../insurance-policy-details/insurance-policy-details.component').then(({InsurancePolicyDetailsComponent}) => InsurancePolicyDetailsComponent);
            }, 0);
          }
          else if(type.includes('AMC')){
            this.isAMC = true;
            
            setTimeout(() => {
              this.amcDetailsLazyComp = import('../amc-details-view/amc-details-view.component').then(({AmcDetailsViewComponent})=>AmcDetailsViewComponent);
            }, 0);
          }
          else if(type.includes('EW')){
            this.isEW = true;
            
            setTimeout(() => {
              this.ewDetailsLazyComp = import('../ew-details-view/ew-details-view.component').then(({EwDetailsViewComponent})=>EwDetailsViewComponent);
            }, 0);
          }
          else if(type.includes('FS')){
            this.isFinancier = true;
            
            setTimeout(() => {
             this.financierLazyComp = import('../financier-details/financier-details.component').then(({FinancierDetailsComponent})=>FinancierDetailsComponent);
            }, 0);
          }
          else if(type.includes('EXC')){
            this.isExchange = true;
            
            setTimeout(() => {
             this.exchangeLazyComp = import('../exchange-details/exchange-details.component').then(({ExchangeDetailsComponent})=>ExchangeDetailsComponent);
            }, 0);
          }
          else if(type.includes('LYT')){
            this.isLoyalty = true;
            
            setTimeout(() => {
             this.loyaltyLazyComp = import('../loyalty-details/loyalty-details.component').then(({LoyaltyDetailsComponent})=>LoyaltyDetailsComponent);
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
            this.isNFADetails = false;
            this.isAMC = false;
            this.isEW = false;
            this.isFinancier = false;
            this.isExchange = false;
            this.isLoyalty = false;
          }

          setTimeout(() => {
            this.resetSteps();
          }, 0);
        }
      }
    });

    this.sharedService.getClaimIdNotAvailable().subscribe((response) => {
      if(response && response == true){
        $('html,body,div').animate({ scrollTop: 0 }, 'fast');

        this.resetSteps();

        setTimeout(() => {
          this.messageService.add({key: 'claimTabsMessage', severity:'info', summary: 'Note', detail:'Please Create Claim', life: 7000});
        }, 0);

        this.sharedService.changeClaimIdNotAvailable(false);
      }
    });
  }

  getClaimDataById(claimId, flag){
    let claimObjById: any;

    this.claimService.getClaimDetailsById(claimId).subscribe((claimTabsResponse) => {
      if(claimTabsResponse && claimTabsResponse.STATUS_OUT == "SUCCESS"  && claimTabsResponse.RESPONSE_OUT != null){
        claimObjById = claimTabsResponse.RESPONSE_OUT[0];

        if(flag){
          this.sharedService.changeBusinessUnit(claimObjById.bu_ID);
        }
        
        this.sharedService.claimObjById = claimObjById;

        this.sharedService.changeSchemeId(this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID);
        this.sharedService.changeChassisNo(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.chassis);
        this.sharedService.changeNFANo(claimObjById?.nfa_NO);
        
        let type: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.type;
        let schemeId: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID;

        this.getAction(this.sharedService.userRole, this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, this.sharedService.status);

        setTimeout(() => {
          this.claimsDetailsLazyComp = import('../claim-dealer-details/claim-dealer-details.component').then(({ClaimDealerDetailsComponent}) => ClaimDealerDetailsComponent);
          this.documentsLazyComp = import('../dealer-documents/dealer-documents.component').then(({DealerDocumentsComponent}) => DealerDocumentsComponent);
          
          if(type.includes('TMI')){
            this.isTMI = true;

            setTimeout(() => {
              this.insurancePolicyLazyComp = import('../insurance-policy-details/insurance-policy-details.component').then(({InsurancePolicyDetailsComponent}) => InsurancePolicyDetailsComponent);
            }, 0);
          }
          else if(type.includes('AMC')){
            this.isAMC = true;
            
            setTimeout(() => {
              this.amcDetailsLazyComp=import('../amc-details-view/amc-details-view.component').then(({AmcDetailsViewComponent}) => AmcDetailsViewComponent);
            }, 0);
          }
          else if(type.includes('EW')){
            this.isEW = true;
            
            setTimeout(() => {
              this.ewDetailsLazyComp=import('../ew-details-view/ew-details-view.component').then(({EwDetailsViewComponent}) => EwDetailsViewComponent);
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
            this.isNFADetails = false;
            this.isAMC = false;
            this.isEW = false;
            this.isFinancier = false;
            this.isExchange = false;
            this.isLoyalty = false;
          }

          if(this.isEdit){
            this.actionHistoryLazyComp = import('../action-history/action-history.component').then(({ActionHistoryComponent}) => ActionHistoryComponent);
          }

          setTimeout(() => {
            this.resetSteps();
          }, 0);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    });
  }

  getAction(role: string, schemeTypeValue: string, status: string){
    this.claimService.getAction(role, schemeTypeValue, status).subscribe((claimTabsResponse) => {
      if(claimTabsResponse && claimTabsResponse.STATUS_OUT == "SUCCESS" && claimTabsResponse.RESPONSE_OUT != null && claimTabsResponse.RESPONSE_OUT.length > 0){
        this.actionList = claimTabsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimTabsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimTabsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
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
