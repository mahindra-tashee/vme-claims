import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GroupClaimActionHistoryComponent } from '../group-claim-action-history/group-claim-action-history.component';
import { GroupClaimApproverDetailsComponent } from '../group-claim-approver-details/group-claim-approver-details.component';
import { GroupClaimApproverDocumentsComponent } from '../group-claim-approver-documents/group-claim-approver-documents.component';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-approver-tabs',
  templateUrl: './group-claim-approver-tabs.component.html',
  styleUrls: ['./group-claim-approver-tabs.component.scss']
})
export class GroupClaimApproverTabsComponent implements OnInit {
  groupClaimApproverDetailsLazyComp: Promise<Type<GroupClaimApproverDetailsComponent>>;
  groupClaimApproverDocumentLazyComp: Promise<Type<GroupClaimApproverDocumentsComponent>>;
  groupClaimApproverActionHistoryLazyComp: Promise<Type<GroupClaimActionHistoryComponent>>;
  actionList: any;

  constructor(private sharedService: SharedService, 
              private claimsService: ClaimsService, 
              private messageService: MessageService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, this.sharedService.status);

    setTimeout(() => {
      this.sharedService.messageKey = "claimsDashboardMessage";

      this.groupClaimApproverDetailsLazyComp = import('../group-claim-approver-details/group-claim-approver-details.component').then(({ GroupClaimApproverDetailsComponent }) => GroupClaimApproverDetailsComponent);
      this.groupClaimApproverDocumentLazyComp = import('../group-claim-approver-documents/group-claim-approver-documents.component').then(({ GroupClaimApproverDocumentsComponent }) => GroupClaimApproverDocumentsComponent);
      this.groupClaimApproverActionHistoryLazyComp = import('../group-claim-action-history/group-claim-action-history.component').then(({ GroupClaimActionHistoryComponent }) => GroupClaimActionHistoryComponent);

      this.resetSteps();
    }, 0);
  }

  getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((groupClaimApproverViewTabsResponse) => {
      if(groupClaimApproverViewTabsResponse && groupClaimApproverViewTabsResponse.STATUS_OUT == "SUCCESS" && groupClaimApproverViewTabsResponse.RESPONSE_OUT != null && groupClaimApproverViewTabsResponse.RESPONSE_OUT.length > 0){
        this.actionList = groupClaimApproverViewTabsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimApproverTabsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'groupClaimApproverTabsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverTabsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimApproverTabsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'groupClaimApproverTabsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimApproverTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
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
