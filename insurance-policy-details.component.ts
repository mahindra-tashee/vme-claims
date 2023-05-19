import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { InsurancePoyDetails } from '../models/insurance-poy-details.model';
import { ClaimsService } from '../services/claims.service';
import { SharedService } from '../services/shared.service';



declare var jQuery: any;
var limit: number;
@Component({
  selector: 'app-insurance-policy-details',
  templateUrl: './insurance-policy-details.component.html',
  styleUrls: ['./insurance-policy-details.component.scss']
})
export class InsurancePolicyDetailsComponent implements OnInit {

  insurencePolicyDetailsForm:FormGroup;
  chassisNo: string;
  IncPolyDetailsLoading: boolean = false;
  IncPolyDetailsdataObj:Array<InsurancePoyDetails>=[];
  IncPolyObj: any = {}

  constructor(private messageService: MessageService,
    private claimsservice: ClaimsService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,) { }

  ngOnInit(): void {

    this.sharedService.getChassisNo().pipe(first()).subscribe((incPolicyResponse) => {
      if (incPolicyResponse && incPolicyResponse != null && incPolicyResponse != "") {
       this.chassisNo=incPolicyResponse; 
      }
    });
    this.initializeComponent();
  }

  initializeComponent(): void {
    setTimeout(() => {

    }, 0);
    this.createOrEditForm();
    this.getIncPolDetails(this.chassisNo);
  }

  createOrEditForm(){
    this.insurencePolicyDetailsForm = this.formBuilder.group({
      INS_COMPANY_NAME:[''],
      POLICY_NO:[''],
      POLICY_STARTDATE:[''],
      POLICY_ENDDATE:[''],
      OD_PREMIUM:[''],
      TP_PREMIUM:[''],
      CHASSIS_NO:[''],
      TOTAL_PREMIUM:[''],
      STATUS:[''],

    });
  }

  getIncPolDetails(chassisNo){
    this.IncPolyDetailsLoading = true;
   
    this.IncPolyObj.chassisNo =chassisNo;
    this.IncPolyObj.schemeName = this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME;

    this.claimsservice.getIncPolDetails(this.IncPolyObj).subscribe((incPolicyResponse) => {
      if (incPolicyResponse && incPolicyResponse != null && incPolicyResponse != "" && incPolicyResponse.STATUS_OUT != "" && incPolicyResponse.STATUS_OUT == "SUCCESS" && incPolicyResponse.STATUS_OUT != null && incPolicyResponse.RESPONSE_OUT != "" && incPolicyResponse.RESPONSE_OUT != null ) {  
       
        this.IncPolyDetailsdataObj[0]= incPolicyResponse.RESPONSE_OUT;
        console.log(this.IncPolyDetailsdataObj)
      
        this.insurencePolicyDetailsForm.controls.INS_COMPANY_NAME.setValue(this.IncPolyDetailsdataObj[0].ins_COMPANY_NAME);
        this.insurencePolicyDetailsForm.controls.POLICY_NO.setValue(this.IncPolyDetailsdataObj[0].policy_NO);
        this.insurencePolicyDetailsForm.controls.POLICY_STARTDATE.setValue(this.IncPolyDetailsdataObj[0].policy_STARTDATE);
        this.insurencePolicyDetailsForm.controls.POLICY_ENDDATE.setValue(this.IncPolyDetailsdataObj[0].policy_ENDDATE);
        this.insurencePolicyDetailsForm.controls.OD_PREMIUM.setValue(this.IncPolyDetailsdataObj[0].od_PREMIUM);
        this.insurencePolicyDetailsForm.controls.TP_PREMIUM.setValue(this.IncPolyDetailsdataObj[0].tp_PREMIUM);
        this.insurencePolicyDetailsForm.controls.CHASSIS_NO.setValue(this.IncPolyDetailsdataObj[0].chassis_NO);
        this.insurencePolicyDetailsForm.controls.TOTAL_PREMIUM.setValue(this.IncPolyDetailsdataObj[0].total_PREMIUM);
        this.insurencePolicyDetailsForm.controls.STATUS.setValue(this.IncPolyDetailsdataObj[0].status);
      
      }
      else {
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'insurencePolicyDetailsMessage', severity:'info', summary: 'Note', detail: 'Note:' + incPolicyResponse.RESPONSE_OUT, life: 7000});
        }
        this.IncPolyDetailsLoading = false;
      }, (error) => {
        this.IncPolyDetailsLoading = false;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key:  'insurencePolicyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'insurencePolicyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'insurencePolicyDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key:  'insurencePolicyDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{
        this.messageService.add({key: 'insurencePolicyDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting Insurance Policy Details', life: 7000});
        }
      });
  }
      
}
