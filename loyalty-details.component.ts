import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoyaltyDetails } from '../models/loyalty-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-loyalty-details',
  templateUrl: './loyalty-details.component.html',
  styleUrls: ['./loyalty-details.component.scss']
})
export class LoyaltyDetailsComponent implements OnInit {

  loyalthyDetailsForm:FormGroup;
  chassisNo: string;
  loyalthyDetailsLoading: boolean = false;
  loyalthyDetailsdataObj:Array<LoyaltyDetails>;
  loyaltyInputParams:HttpParams;
  schemeName: string;
  loyaltyObj: any = {};

  constructor(private messageService: MessageService,
    private claimsservice: ClaimsService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.sharedService.getChassisNo().subscribe((response) => {
      if (response && response != null && response != "") {
        this.chassisNo=response;
      }
    });
    this.sharedService.getSchemeName().subscribe((response) => {
      if (response && response != null && response != "") {
        this.schemeName=response;
      }
    });
 this.getLoyaltyDetails();
  }

  initializeComponent(): void {
      this.createOrEditForm();
  }

  createOrEditForm(){
    this.loyalthyDetailsForm = this.formBuilder.group({
      REFERRAL_ACCOUNT_TYPE:[''],
      REFERRAL_ACCOUNT_STATUS:[''],
      REFERRAL_ACCOUNT:[''],
      REFERRAL_TYPE:[''],
      REFERRAL_CUSTOMER:[''],
      CHASSIS_NO:[''],
    });
  }

  getLoyaltyDetails(){
    this.loyalthyDetailsLoading = true;

    this.loyaltyObj.chassisNo =this.chassisNo;
    this.loyaltyObj.schemeName = this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME;

    this.claimsservice.getLoyaltyDetails(this.loyaltyObj).subscribe((loyaltyDetailsResponse) => {
      if (loyaltyDetailsResponse[0] && loyaltyDetailsResponse[0] != null && loyaltyDetailsResponse[0].STATUS_OUT =="SUCCESS" ) {  

        this.loyalthyDetailsdataObj= loyaltyDetailsResponse[0].RESPONSE_OUT;
        this.loyalthyDetailsForm.controls.CHASSIS_NO.setValue(this.loyalthyDetailsdataObj[0].ASSET_NUM);
        this.loyalthyDetailsForm.controls.REFERRAL_CUSTOMER.setValue(this.loyalthyDetailsdataObj[0].REFERRAL_CUSTOMER);
        this.loyalthyDetailsForm.controls.REFERRAL_TYPE.setValue(this.loyalthyDetailsdataObj[0].REFERRAL_TYPE);
        this.loyalthyDetailsForm.controls.REFERRAL_ACCOUNT.setValue(this.loyalthyDetailsdataObj[0].REFERRAL_ACCOUNT);
        this.loyalthyDetailsForm.controls.REFERRAL_ACCOUNT_STATUS.setValue(this.loyalthyDetailsdataObj[0].REFERRAL_ACCOUNT_STATUS);
        this.loyalthyDetailsForm.controls.REFERRAL_ACCOUNT_TYPE.setValue(this.loyalthyDetailsdataObj[0].REFERRAL_ACCOUNT_TYPE);
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        console.log(loyaltyDetailsResponse[0].RESPONSE_OUT)
          this.messageService.add({key: 'loyalthyDetailsMessage', severity:'info', summary: 'Note',sticky:true, detail: loyaltyDetailsResponse[0].RESPONSE_OUT, life: 7000});
        }
        this.loyalthyDetailsLoading = false;
      }, (error) => {
        this.loyalthyDetailsLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'loyalthyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'loyalthyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'loyalthyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'loyalthyDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'loyalthyDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting loyalty Details', life: 7000});
        }
      });
    }
  }

