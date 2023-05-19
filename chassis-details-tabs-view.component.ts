import { Component, OnInit, Type } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ClaimsService } from '../services/claims.service';
import * as $ from "jquery";
import { Myclaims } from '../models/individual-claim.model';
import { RetailHistoryComponent } from '../retail-history/retail-history.component';
import { CreditNoteBreakupComponent } from '../credit-note-breakup/credit-note-breakup.component';
import { ConcessionBreakupComponent } from '../concession-breakup/concession-breakup.component';
import { OfftakeCancellationHistoryComponent } from '../offtake-cancellation-history/offtake-cancellation-history.component';
import { ClaimsHistoryComponent } from '../claims-history/claims-history.component';
import { SharedService } from '../services/shared.service';
import { ConcessionTrackingComponent } from '../concession-tracking/concession-tracking.component';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { data } from 'jquery';
import { ChassisDetails } from '../models/chassis-details.model';
import { first } from 'rxjs/operators';
declare var jQuery: any;

@Component({
  selector: 'app-chassis-details-tabs-view',
  templateUrl: './chassis-details-tabs-view.component.html',
  styleUrls: ['./chassis-details-tabs-view.component.scss']
})
export class ChassisDetailsTabsViewComponent implements OnInit {
  creditNoteBreakupLazyComp: Promise<Type<CreditNoteBreakupComponent>>;
  concessionBreakupLazyComp: Promise<Type<ConcessionBreakupComponent>>;
  offtakeCancellationHistoryLazyComp: Promise<Type<OfftakeCancellationHistoryComponent>>;
  claimsHistoryLazyComp: Promise<Type<ClaimsHistoryComponent>>;
  retailHistoryLazyComp: Promise<Type<RetailHistoryComponent>>;
  concessionTrackingLazyComp: Promise<Type<ConcessionTrackingComponent>>;
  VCForm: FormGroup;
  chassisDetailsForm: FormGroup;
  chassisDetailsObj: any;
  chassisInputObj: any = {};
  chassisNo: string;

  constructor(private ClaimsService: ClaimsService,
              private messageService: MessageService,
              private sharedService: SharedService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.resetSteps();
    this.createOrViewForm();

    this.route.queryParams.subscribe((params) => {
      $('.loader').show();

      if(params['chassisNo'] != undefined && params['chassisNo'] != null && params['chassisNo'] != ""){
        this.sharedService.messageKey = "oneInboxDashboardMessage";
        this.sharedService.changeChassisNo(params['chassisNo']);

        setTimeout(() => {
          this.chassisNo = params['chassisNo'];
          this.getChassisDataByNumber(params['chassisNo'], true);
        }, 0);
      }
      else{
        this.sharedService.messageKey = "claimsDashboardMessage";
        this.sharedService.getChassisNo().subscribe((response) => {
          if(response && response != null && response != ""){
            this.chassisNo = response;
            this.getChassisDataByNumber(response, false);
          }
        });
      }
    });
  }

  createOrViewForm() {
    this.chassisDetailsForm = this.formBuilder.group({
      BU: [''],
      LOB: [''],
      PPL: [''],
      PL: [''],
      VC: [''],
    });
  }

  getChassisDataByNumber(chassisNo, flag) {
    let chassisDetailsObjByNum: any;

    this.ClaimsService.getChassisDataByNum(chassisNo).subscribe((chassisDetailsResponse) => {
      if(chassisDetailsResponse && chassisDetailsResponse != null && chassisDetailsResponse != "" && chassisDetailsResponse.STATUS_OUT != null && chassisDetailsResponse.STATUS_OUT != "" && chassisDetailsResponse.STATUS_OUT == "SUCCESS" && chassisDetailsResponse.RESPONSE_OUT != null && chassisDetailsResponse.RESPONSE_OUT != "" && chassisDetailsResponse.RESPONSE_OUT.list.length > 0){
        chassisDetailsObjByNum = chassisDetailsResponse.RESPONSE_OUT.list;

        if(flag){
          this.sharedService.changeBusinessUnit(chassisDetailsObjByNum[0].chassi_BU);
        }

        this.sharedService.chassisObjByNum = chassisDetailsObjByNum;

        this.chassisDetailsForm.controls.BU.setValue(chassisDetailsObjByNum[0].chassi_BU);
        this.chassisDetailsForm.controls.LOB.setValue(chassisDetailsObjByNum[0].lob);
        this.chassisDetailsForm.controls.PPL.setValue(chassisDetailsObjByNum[0].ppl);
        this.chassisDetailsForm.controls.PL.setValue(chassisDetailsObjByNum[0].pl);
        this.chassisDetailsForm.controls.VC.setValue(chassisDetailsObjByNum[0].vc);

        setTimeout(() => {
          this.claimsHistoryLazyComp = import('../claims-history/claims-history.component').then(({ ClaimsHistoryComponent }) => ClaimsHistoryComponent);
          this.retailHistoryLazyComp = import('../retail-history/retail-history.component').then(({ RetailHistoryComponent }) => RetailHistoryComponent);
          this.offtakeCancellationHistoryLazyComp = import('../offtake-cancellation-history/offtake-cancellation-history.component').then(({ OfftakeCancellationHistoryComponent }) => OfftakeCancellationHistoryComponent);
          this.creditNoteBreakupLazyComp = import('../credit-note-breakup/credit-note-breakup.component').then(({ CreditNoteBreakupComponent }) => CreditNoteBreakupComponent);
          this.concessionTrackingLazyComp = import('../concession-tracking/concession-tracking.component').then(({ ConcessionTrackingComponent }) => ConcessionTrackingComponent);
          this.concessionBreakupLazyComp = import('../concession-breakup/concession-breakup.component').then(({ ConcessionBreakupComponent }) => ConcessionBreakupComponent);
        }, 0);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Chassis Detail', life: 7000 });
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'chassisDetailsTabsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Chassis Detail', life: 7000 });
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
