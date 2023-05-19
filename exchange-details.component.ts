import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ExchangeDetails } from '../models/exchange-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-exchange-details',
  templateUrl: './exchange-details.component.html',
  styleUrls: ['./exchange-details.component.scss']
})
export class ExchangeDetailsComponent implements OnInit {
  exchangeDetailsForm:FormGroup;
  chassisNo: string;
  schemeName : string;
  exchangeInputObj : any = {};
  exchangeDetailsLoading: boolean = false;
  exchangeDetailsdataObj:Array<ExchangeDetails> ;

  constructor(private messageService: MessageService,
              private claimsservice: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService,) { }
    
  ngOnInit(): void {
  
    this.sharedService.getChassisNo().subscribe((response) => {
      if (response && response != null && response != "") {
        this.chassisNo=response;
      }
    });
    this.initializeComponent();
    this.getExchangeDetails();
  }

  initializeComponent(): void {
    this.createOrEditForm();
  }

  createOrEditForm(){
    this.exchangeDetailsForm = this.formBuilder.group({
      EXCHANGE_APPROVAL_BY:[''],
      EXCHANGE_APPROVAL_DATE:[''],
      EXCHANGE_APPROVED:[''],
      NEW_CONTACT_LAST_NAME:[''],
      SOURCING_CONTACT_LAST_NAME:[''],
      NEW_VECHICLE_MANF_DATE:[''],
      SOURCING_VECHICLE_MANF_DATE:[''],
      NEW_CONTACT_FST_NAME:[''],
      SOURCING_CONTACT_FST_NAME:[''],
      SOURCING_VECHICLE_OPTY_ID:[''],
      NEW_VECHICLE_OPTY_ID:[''],
      SOURCING_LOB:[''],
      NEW_LOB:[''],
      NEW_ACCOUNT_NAME:[''],
      SOURCING_ACCOUNT_NAME:[''],
      NEW_PPL:[''],
      SOURCING_PPL:[''],
      NEW_PL:[''],
      SOURCING_PL:[''],
      EXCHANGE_CERTIFY:[''],
      NEW_ASSET:[''],
      SOURCING_ASSET:[''],
    });
  }

  getExchangeDetails(){
    this.exchangeDetailsLoading = true;

    this.exchangeInputObj.chassisNo =this.chassisNo;
    this.exchangeInputObj.schemeName = this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME;
    this.claimsservice.getExchangeDetails(this.exchangeInputObj).subscribe((exchangeDetailsResponse) => {
      if (exchangeDetailsResponse[0]&& exchangeDetailsResponse[0] != null && exchangeDetailsResponse[0].STATUS_OUT =="SUCCESS" ) {  
        this.exchangeDetailsdataObj= exchangeDetailsResponse[0].RESPONSE_OUT;
      
        this.exchangeDetailsForm.controls.SOURCING_ASSET.setValue(this.exchangeDetailsdataObj[0].SOURCING_ASSET);
        this.exchangeDetailsForm.controls.EXCHANGE_CERTIFY.setValue(this.exchangeDetailsdataObj[0].SOURCING_ASSET_TYPE);
        this.exchangeDetailsForm.controls.NEW_ASSET.setValue(this.exchangeDetailsdataObj[0].NEW_ASSET);
        this.exchangeDetailsForm.controls.SOURCING_PL.setValue(this.exchangeDetailsdataObj[0].SOURCING_PL);
        this.exchangeDetailsForm.controls.NEW_PL.setValue(this.exchangeDetailsdataObj[0].NEW_PL);
        this.exchangeDetailsForm.controls.SOURCING_PPL.setValue(this.exchangeDetailsdataObj[0].SOURCING_PPL);
        this.exchangeDetailsForm.controls.NEW_PPL.setValue(this.exchangeDetailsdataObj[0].NEW_PPL);
        this.exchangeDetailsForm.controls.SOURCING_ACCOUNT_NAME.setValue(this.exchangeDetailsdataObj[0].SOURCING_ACCOUNT_NAME);
        this.exchangeDetailsForm.controls.NEW_ACCOUNT_NAME.setValue(this.exchangeDetailsdataObj[0].NEW_ACCOUNT_NAME);
        this.exchangeDetailsForm.controls.NEW_LOB.setValue(this.exchangeDetailsdataObj[0].NEW_LOB);
        this.exchangeDetailsForm.controls.SOURCING_LOB.setValue(this.exchangeDetailsdataObj[0].SOURCING_LOB);
        this.exchangeDetailsForm.controls.NEW_VECHICLE_OPTY_ID.setValue(this.exchangeDetailsdataObj[0].NEW_VEHICLE_OPTY_ID);
        this.exchangeDetailsForm.controls.SOURCING_VECHICLE_OPTY_ID.setValue(this.exchangeDetailsdataObj[0].SOURCING_OPTY_ID);
        this.exchangeDetailsForm.controls.SOURCING_CONTACT_FST_NAME.setValue(this.exchangeDetailsdataObj[0].SOURCING_CONTACT_FST_NAME);
        this.exchangeDetailsForm.controls.NEW_CONTACT_FST_NAME.setValue(this.exchangeDetailsdataObj[0].NEW_CONTACT_FST_NAME)
        this.exchangeDetailsForm.controls.SOURCING_VECHICLE_MANF_DATE.setValue(this.exchangeDetailsdataObj[0].SOURCING_VEHICLE_MFG_DATE);
        this.exchangeDetailsForm.controls.NEW_VECHICLE_MANF_DATE.setValue(this.exchangeDetailsdataObj[0].NEW_VEHICLE_MFG_DATE);
        this.exchangeDetailsForm.controls.SOURCING_CONTACT_LAST_NAME.setValue(this.exchangeDetailsdataObj[0].SOURCING_CONTACT_LAST_NAME);
        this.exchangeDetailsForm.controls.NEW_CONTACT_LAST_NAME.setValue(this.exchangeDetailsdataObj[0].NEW_CONTACT_LAST_NAME);
        this.exchangeDetailsForm.controls.EXCHANGE_APPROVED.setValue(this.exchangeDetailsdataObj[0].DOC_STATUS);
        this.exchangeDetailsForm.controls.EXCHANGE_APPROVAL_DATE.setValue(this.exchangeDetailsdataObj[0].DOC_STATUS_UPODATED_DT);
        this.exchangeDetailsForm.controls.EXCHANGE_APPROVAL_BY.setValue(this.exchangeDetailsdataObj[0].DOC_STATUS_UPDATED_BY);
  }
    else {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'exchangeDetailsMessage', severity:'info', summary: 'Note', detail: 'No Exchange Details available for Chassis No', life: 7000});
      }
      this.exchangeDetailsLoading = false;
    }, (error) => {
      this.exchangeDetailsLoading = false;
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'exchangeDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'exchangeDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'exchangeDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'exchangeDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{
      this.messageService.add({key: 'exchangeDetailsMessage', severity:'error', summary: 'Error', sticky:true, detail: 'Error Getting Exchange Details', life: 7000});
      }
    });
  }   
}
