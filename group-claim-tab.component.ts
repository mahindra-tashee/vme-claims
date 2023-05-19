import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { GroupClaimActionHistoryComponent } from '../group-claim-action-history/group-claim-action-history.component';
import { GroupClaimDetailsComponent } from '../group-claim-details/group-claim-details.component';
import { GroupClaimDocumentsComponent } from '../group-claim-documents/group-claim-documents.component';
import { Action } from '../models/action.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-group-claim-tab',
  templateUrl: './group-claim-tab.component.html',
  styleUrls: ['./group-claim-tab.component.scss']
})
export class GroupClaimTabComponent implements OnInit {
  actionList: Array<Action> = [];
  groupClaimsDetailsLazyComp:Promise<Type<GroupClaimDetailsComponent>>
  groupDocumentsLazyComp: Promise<Type<GroupClaimDocumentsComponent>>;
  groupActionHistoryLazyComp:Promise<Type<GroupClaimActionHistoryComponent>>
  isEdit: boolean = false;

  constructor(private sharedService: SharedService, 
              private claimsService: ClaimsService, 
              private messageService: MessageService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.resetSteps();

    this.route.queryParams.subscribe((params) => {
      if(params['gClaimId'] != undefined && params['gClaimId'] != null && params['gClaimId'] != ""){
        this.sharedService.messageKey = "claimsDealerDashboardMessage";
        this.sharedService.isGroupClaimEdit = true;
        this.sharedService.changeGroupClaimId(params['gClaimId']);

        setTimeout(() => {
          this.isEdit = true;
          this.getGroupClaimDataById(params['claimId'], true);
        }, 0);
      }
      else{
        this.sharedService.messageKey = "claimsDealerDashboardMessage";
        if(this.sharedService.isGroupClaimEdit){
          this.isEdit = true;
          this.sharedService.getGroupClaimId().subscribe((response) => {
            if(response && response != null && response != ""){
              this.getGroupClaimDataById(response, true);
            }
          });
        }
        else{
          this.isEdit = false;

          this.sharedService.changeSchemeId(this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.scheme_ID);

          this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, '');

          this.groupClaimsDetailsLazyComp = import('../group-claim-details/group-claim-details.component').then(({GroupClaimDetailsComponent}) => GroupClaimDetailsComponent);
          this.groupDocumentsLazyComp = import('../group-claim-documents/group-claim-documents.component').then(({GroupClaimDocumentsComponent}) => GroupClaimDocumentsComponent);

          this.resetSteps();
        }
      }
    });

    this.sharedService.getGroupClaimIdNotAvailable().subscribe((response) => {
      if(response && response == true){
        $('html,body,div').animate({ scrollTop: 0 }, 'fast');

        this.resetSteps();

        setTimeout(() => {
          this.messageService.add({key: 'groupClaimTabsMessage', severity:'info', summary: 'Note', detail: 'Please Create Claim', life: 7000});
        }, 0);

        this.sharedService.changeGroupClaimIdNotAvailable(false);
      }
    });
  }

  getGroupClaimDataById(gClaimId, flag){
    let groupClaimObjById: any;

    this.claimsService.getGroupClaimDetailsById(gClaimId).subscribe((groupClaimTabsResponse) => {
      if(groupClaimTabsResponse && groupClaimTabsResponse != null && groupClaimTabsResponse.STATUS_OUT != null && groupClaimTabsResponse.STATUS_OUT != "" && groupClaimTabsResponse.RESPONSE_OUT != null && groupClaimTabsResponse.RESPONSE_OUT != "" && groupClaimTabsResponse.RESPONSE_OUT.length > 0){
        groupClaimObjById = groupClaimTabsResponse.RESPONSE_OUT[0];

        if(flag){
          this.sharedService.changeBusinessUnit(groupClaimObjById.bu_ID);
        }
        
        this.sharedService.groupClaimObjById = groupClaimObjById;

        this.sharedService.changeSchemeId(groupClaimObjById.scheme_ID);
        this.sharedService.changePPL(groupClaimObjById.ppl);
        
        this.getAction(this.sharedService.userRole, this.sharedService.groupClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, this.sharedService.status);

        setTimeout(() => {
          this.groupClaimsDetailsLazyComp = import('../group-claim-details/group-claim-details.component').then(({GroupClaimDetailsComponent}) => GroupClaimDetailsComponent);
          this.groupDocumentsLazyComp = import('../group-claim-documents/group-claim-documents.component').then(({GroupClaimDocumentsComponent}) => GroupClaimDocumentsComponent);
          
          if(this.isEdit){
            this.groupActionHistoryLazyComp = import('../group-claim-action-history/group-claim-action-history.component').then(({GroupClaimActionHistoryComponent}) => GroupClaimActionHistoryComponent);
          }

          this.resetSteps();
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Group Claim Data', life: 7000});
      }
    });
  }

  getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((claimTabsResponse) => {
      if(claimTabsResponse && claimTabsResponse.STATUS_OUT == "SUCCESS" && claimTabsResponse.RESPONSE_OUT != null && claimTabsResponse.RESPONSE_OUT.length > 0){
        this.actionList = claimTabsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'groupClaimTabsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key:  'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key:  'groupClaimTabsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'groupClaimTabsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
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
