import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GroupClaimActionHistoryComponent } from '../group-claim-action-history/group-claim-action-history.component';
import { GroupClaimApproverDetailsViewComponent } from '../group-claim-approver-details-view/group-claim-approver-details-view.component';
import { GroupClaimApproverDocumentsViewComponent } from '../group-claim-approver-documents-view/group-claim-approver-documents-view.component';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-approver-view-tabs',
  templateUrl: './group-claim-approver-view-tabs.component.html',
  styleUrls: ['./group-claim-approver-view-tabs.component.scss']
})
export class GroupClaimApproverViewTabsComponent implements OnInit {
  groupClaimApproverDetailsViewLazyComp: Promise<Type<GroupClaimApproverDetailsViewComponent>>;
  groupClaimApproverDocumentViewLazyComp: Promise<Type<GroupClaimApproverDocumentsViewComponent>>;
  groupClaimApproverActionHistoryLazyComp: Promise<Type<GroupClaimActionHistoryComponent>>;
  actionList: any;

  constructor(private sharedService: SharedService, 
              private claimsService: ClaimsService, 
              private messageService: MessageService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.sharedService.messageKey = "claimsDashboardMessage";

    setTimeout(() => {
      this.route.queryParams.subscribe((params) => {
        if(params['ppl'] != undefined && params['ppl'] != null && params['ppl'] != "" && params['schemeId'] != undefined && params['schemeId'] != null && params['schemeId'] != "" && params['groupClaimId'] != undefined && params['groupClaimId'] != null && params['groupClaimId'] != ""){
          this.sharedService.messageKey = params["messageKey"] != undefined && params["messageKey"] != null && params["messageKey"] != "" ? params["messageKey"] : "claimsDashboardMessage";
          this.sharedService.changeGroupClaimId(params['groupClaimId']);
          this.sharedService.changeSchemeId(params['schemeId']);
  
          setTimeout(() => {
            this.getGroupBasicClaimsDetails(params['schemeId'], params['ppl']);
          }, 0);
        }
        else{
          this.groupClaimApproverDetailsViewLazyComp = import('../group-claim-approver-details-view/group-claim-approver-details-view.component').then(({ GroupClaimApproverDetailsViewComponent }) => GroupClaimApproverDetailsViewComponent);
          this.groupClaimApproverDocumentViewLazyComp = import('../group-claim-approver-documents-view/group-claim-approver-documents-view.component').then(({ GroupClaimApproverDocumentsViewComponent }) => GroupClaimApproverDocumentsViewComponent);
          this.groupClaimApproverActionHistoryLazyComp = import('../group-claim-action-history/group-claim-action-history.component').then(({ GroupClaimActionHistoryComponent }) => GroupClaimActionHistoryComponent);
        }
      });

      this.resetSteps();
    }, 0);
  }

  getGroupBasicClaimsDetails(schemeId, ppl){
    this.claimsService.getApproverGroupBasicClaimsDetails(schemeId, ppl, '').subscribe((claimsDashboardResponse) => {
      if(claimsDashboardResponse && claimsDashboardResponse.STATUS_OUT === "SUCCESS" && claimsDashboardResponse.RESPONSE_OUT != null && claimsDashboardResponse.RESPONSE_OUT != ""){
        this.sharedService.groupClaimsPreSelectedData = claimsDashboardResponse.RESPONSE_OUT;
        this.getClaimLimitByChassisNoSchemeId('', schemeId, false);
      }
      else{
        this.sharedService.groupClaimsPreSelectedData = {};
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: this.sharedService.messageKey, severity:'info', summary: 'Note', detail:'No Data Available for Claim Details', life: 7000});
      }
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key:this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key:this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: this.sharedService.messageKey, severity:'error', summary: 'Error', detail:'Error Getting Claim Details', life: 7000});
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
          this.groupClaimApproverDetailsViewLazyComp = import('../group-claim-approver-details-view/group-claim-approver-details-view.component').then(({ GroupClaimApproverDetailsViewComponent }) => GroupClaimApproverDetailsViewComponent);
          this.groupClaimApproverDocumentViewLazyComp = import('../group-claim-approver-documents-view/group-claim-approver-documents-view.component').then(({ GroupClaimApproverDocumentsViewComponent }) => GroupClaimApproverDocumentsViewComponent);
          this.groupClaimApproverActionHistoryLazyComp = import('../group-claim-action-history/group-claim-action-history.component').then(({ GroupClaimActionHistoryComponent }) => GroupClaimActionHistoryComponent);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: this.sharedService.messageKey, severity:'info', summary: 'Note', detail:'No Data Available for Claim Limit', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key:this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key:this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: this.sharedService.messageKey, severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: this.sharedService.messageKey, severity:'error', summary: 'Error', detail:'Error Getting Claim Limit', life: 7000});
      }
    });
  }

  resetSteps(): void {
    $('.app-form').hide();
    $('.app-form.first-form').show();
    $('.step').removeClass('active');
    $('#first.step').addClass('active');

    $('.ui.mini.steps .step').click(function () {
      $('.ui.mini.steps .step').removeClass('active');
      $(this).addClass('active');
      var target = '.app-form.' + $(this).attr('id') + '-form';
      $('.app-form').hide();
      $(target).show();
    });
  }

}
