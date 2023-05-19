import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { MutualExcAmcANDEW } from '../models/mutual-exc-amc.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-amc-details-view',
  templateUrl: './amc-details-view.component.html',
  styleUrls: ['./amc-details-view.component.scss']
})
export class AmcDetailsViewComponent implements OnInit {
  amcContractDetailsForm: FormGroup;
  amcDetailsObj: any = {};
  amcDetailsLoading: boolean;
  mutualAmcObj: Array<MutualExcAmcANDEW> = [];
  isMutualAmcObj: boolean = false;
  claimId: string;

  constructor(private messageService: MessageService,
              private claimsService: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService,
              private confirmationService: ConfirmationService,
              private http: HttpClient,
              private datePipe:DatePipe) { }

  ngOnInit(): void {
    this.initializeComponent();

    this.sharedService.getClaimId().pipe(first()).subscribe((response) => {
      if (response && response != null && response != "") {
        this.claimId = response;

        this.getAmcDetailsDataByClaimId(this.claimId);
        this.mutualExcAmcDetails(this.claimId);
      }
    });

    this.resetSteps();
  }

  initializeComponent(): void {
    this.createOrEditForm();
  }

  createOrEditForm(){
    this.amcContractDetailsForm = this.formBuilder.group({
      Chassis_No: [''],
      Contract_No: [''],
      AMC_order_Type: [''],
      AMC_Product_Type: [''],
      AMC_Campaign_ID: [''],
      AMC_Campaign_Code: [''],
      AMC_Campaign_Name: [''],
      Campaign_Start_Date: [''],
      Campaign_End_Date: [''],
      CRM_AMC_Order_No: [''],
      Contract_K_H: [''],
      AMC_Contract_Period: [''],
      AMC_Product_Code: [''],
      AMC_Product_Discription: [''],
      AMC_Start_Date: [''],
      AMC_End_Date: [''],
      AMC_Start_KMs: [''],
      AMC_End_KMs: [''],
      AMC_Offer_Price: [''],
      TML_Contribution: [''],
      Contract_Status: [''],
    });
  }

  getAmcDetailsDataByClaimId(claimId){
    this.claimsService.getAmcDetailsDataByClaimid(claimId).subscribe((amcDetailsResponse) => {
      if(amcDetailsResponse && amcDetailsResponse != null){ 
       this.amcDetailsObj = amcDetailsResponse.RESPONSE_OUT;
      
        this.sharedService.ewclaimObjByChassis = this.amcDetailsObj;
        this.amcContractDetailsForm.controls.Chassis_No.setValue(this.amcDetailsObj[0].chassisNo);
        this.amcContractDetailsForm.controls.Contract_No.setValue(this.amcDetailsObj[0].sapAmcContractNo);
        this.amcContractDetailsForm.controls.AMC_order_Type.setValue(this.amcDetailsObj[0].amcOrderType);
        this.amcContractDetailsForm.controls.AMC_Product_Type.setValue(this.amcDetailsObj[0].amcProductType);
        this.amcContractDetailsForm.controls.AMC_Campaign_ID.setValue(this.amcDetailsObj[0].crmCampaignId);
        this.amcContractDetailsForm.controls.AMC_Campaign_Code.setValue(this.amcDetailsObj[0].crmCampaignCode);
        this.amcContractDetailsForm.controls.AMC_Campaign_Name.setValue(this.amcDetailsObj[0].crmCampaignName);
        this.amcContractDetailsForm.controls.Campaign_Start_Date.setValue(this.datePipe.transform(this.amcDetailsObj[0].campaignStartDate, 'dd-MMM-yyyy' ));
        this.amcContractDetailsForm.controls.Campaign_End_Date.setValue(this.datePipe.transform(this.amcDetailsObj[0].campaignEndDate, 'dd-MMM-yyyy' ));
        this.amcContractDetailsForm.controls.CRM_AMC_Order_No.setValue(this.amcDetailsObj[0].crmAmcOrderNo);
        this.amcContractDetailsForm.controls.Contract_K_H.setValue(this.amcDetailsObj[0].amcContractKmsHours);
        this.amcContractDetailsForm.controls.AMC_Contract_Period.setValue(this.amcDetailsObj[0].amcContractPeriod);
        this.amcContractDetailsForm.controls.AMC_Product_Code.setValue(this.amcDetailsObj[0].amcProductCode);
        this.amcContractDetailsForm.controls.AMC_Product_Discription.setValue(this.amcDetailsObj[0].amcProductDesciption);
        this.amcContractDetailsForm.controls.AMC_Start_Date.setValue(this.datePipe.transform(this.amcDetailsObj[0].amcStartDate, 'dd-MMM-yyyy' ));
        this.amcContractDetailsForm.controls.AMC_End_Date.setValue(this.datePipe.transform(this.amcDetailsObj[0].amcEndDate, 'dd-MMM-yyyy' ));
        this.amcContractDetailsForm.controls.AMC_Start_KMs.setValue(this.amcDetailsObj[0].amcStartKms);
        this.amcContractDetailsForm.controls.AMC_End_KMs.setValue(this.amcDetailsObj[0].amcEndKms);
        this.amcContractDetailsForm.controls.AMC_Offer_Price.setValue(this.amcDetailsObj[0].amcPriceOfferPrice);
        this.amcContractDetailsForm.controls.TML_Contribution.setValue(this.amcDetailsObj[0].tmlShareContrribution);
        this.amcContractDetailsForm.controls.Contract_Status.setValue(this.amcDetailsObj[0].contractStatus);
      }
      else {
        this.amcDetailsObj = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for AMC Details', life: 10000 });
      }
  
      this.amcDetailsLoading = false
    }, (error) => {
      this.amcDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting AMC Details', life: 10000 });
      }
    })
  }

  mutualExcAmcDetails(claimId) {
    this.amcDetailsLoading = true;
    
    this.claimsService.mutualExcAmcDetails(claimId).subscribe((amcDetailsResponse) => {
      if(amcDetailsResponse && amcDetailsResponse != null && amcDetailsResponse != "" && amcDetailsResponse.STATUS_OUT != "" && amcDetailsResponse.STATUS_OUT == "SUCCESS" && amcDetailsResponse.STATUS_OUT != null && amcDetailsResponse.RESPONSE_OUT != "" && amcDetailsResponse.RESPONSE_OUT != null && amcDetailsResponse.RESPONSE_OUT.length > 0){
        this.mutualAmcObj = amcDetailsResponse.RESPONSE_OUT;
        this.isMutualAmcObj = true;
      }
      else {
        this.mutualAmcObj = [];
        this.isMutualAmcObj = false;

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'info', summary: 'Note', detail: 'No Data Available for Mutual Exclusive', life: 7000 });
      }
      this.amcDetailsLoading = false;
    }, (error) => {
      this.amcDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({ key: 'amcDetailsViewMessage', severity: 'error', summary: 'Error', detail: 'Error Getting Mutual Exclusive Data', life: 7000 });
      }
    })
  }

  amcDetails() {
    $('#amcMutualExcl').removeClass('active');
    $('#amcMutualExclTab').removeClass('active');
    $('#amcContractDetails').addClass('active');
    $('#amcContractDetailsTab').addClass('active');
  }

  mutualexclDetails() {
    $('#amcContractDetails').removeClass('active');
    $('#amcContractDetailsTab').removeClass('active');
    $('#amcMutualExcl').addClass('active');
    $('#amcMutualExclTab').addClass('active');
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
