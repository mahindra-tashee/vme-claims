import { Component, OnInit, Type } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimDocs } from '../models/claim-docs.model';
import { fileInfo, claimDocs, DocTypes, docUpload } from '../models/claim-doc-upload.model';
import { ClaimDetails } from '../models/individual-claim.model';
import { SchemeDoc } from '../models/scheme-docs.model';
import { ClaimsService } from '../services/claims.service';
import { NewClaimDetails } from '../models/new-reg-class.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedService } from '../services/shared.service';
import { DatePipe } from '@angular/common';
import { Action } from '../models/action.model';
import { AvailConcessionComponent } from '../avail-concession/avail-concession.component';
import { HttpParams } from '@angular/common/http';
import { AvailableDiscountComponent } from '../available-discount/available-discount.component';
import { CrmCreditAmountComponent } from '../crm-credit-amount/crm-credit-amount.component';
import { ActualConcessionCrmComponent } from '../actual-concession-crm/actual-concession-crm.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-claim-dealer-details',
  templateUrl: './claim-dealer-details.component.html',
  styleUrls: ['./claim-dealer-details.component.scss']
})
export class ClaimDealerDetailsComponent implements OnInit {
  claimDetailsForm: FormGroup;
  isEdit: boolean = false;
  claimDetailsObj: any;
  actionList: Array<Action> = [];
  isToggleDealerDetails: boolean = true;
  isToggleChassisDetails: boolean = true;
  isGenerateIRNInvoiceButton: boolean = false;
  isGenerateInvoiceButton: boolean = false;
  isDownloadInvoiceButton: boolean = false;
  isCancelIRNButton: boolean = false;
  isGenerateCreditNoteButton: boolean = false;
  isFISettlement: boolean = false;
  isTMIValid: boolean = false;
  isFinancier: boolean = false;
  isFinancierAmount:boolean = false;
  isExchange: boolean = false;
  exchangeObj:any = {};
  isStockTransfer: boolean = false;

  constructor(private messageService: MessageService,
              private claimsService: ClaimsService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService,
              private confirmationService: ConfirmationService,
              private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initializeComponent();

    this.sharedService.getBusinessUnit().subscribe((response) => {
      if(response && response != undefined && response != null && response != ""){
        this.setClaimDetails();

        setTimeout(() => {
          if(this.sharedService.isClaimEdit){
            this.isEdit = true;

            setTimeout(() => {
              if(this.sharedService.claimObjById && this.sharedService.claimObjById != null && this.sharedService.claimObjById != ""){
                this.claimDetailsObj = this.sharedService.claimObjById;
    
                setTimeout(() => {
                  this.claimDetailsForm.controls.CLAIM_ID.setValue(this.claimDetailsObj.claim_ID);
                  this.claimDetailsForm.controls.CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT_ORG);
                  this.claimDetailsForm.controls.FINAL_CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT);
                  this.claimDetailsForm.controls.GST_INVOICE_NO.setValue(this.claimDetailsObj.gst_INV_NO);
                  this.claimDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.gst_INV_DT, 'dd-MMM-yyyy'));
                  this.claimDetailsForm.controls.IRN.setValue(this.claimDetailsObj.irn_NUMBER);
                  this.claimDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.claimDetailsObj.acknowledgement_NO);
                  this.claimDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.acknowledgement_DATE, 'dd-MMM-yyyy'));

                  setTimeout(() => {
                    this.checkLimit(this.claimDetailsForm.controls.CLAIM_LIMIT.value, true);
                    this.checkButtonVisibility();
                  }, 0);
                }, 0);
              }
            }, 0);
          }
          else{
            this.isEdit = false;
          }
        }, 0);
      }
      else{
        this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });

    this.sharedService.getActionList().subscribe((response) => {
      if(response && response != null && response.length > 0){
        this.actionList = response;

        setTimeout(() => {
          if(this.isEdit){
            this.claimDetailsForm.controls.ACTION.setValue( (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
            jQuery('#dd_claim_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
          }
        }, 0);
      }

      $('#dd_claim_details_action').parent().removeClass('loading');
      $('#dd_claim_details_action').parent().removeClass('disabled');
    });

    this.sharedService.getAction().subscribe((response) => {
      if(response && response != null && response != ""){
        this.claimDetailsForm.controls.ACTION.setValue(response);
        jQuery('#dd_claim_details_action').dropdown('set selected', response);
      }
    });

    this.sharedService.getRemark().subscribe((response) => {
      if(response && response != null && response != ""){
        this.claimDetailsForm.controls.REMARK.setValue(response);
      }
    });
  }

  initializeComponent(): void {
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});
      jQuery('#dd_claim_details_action').dropdown();

      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_claim_details_tm_invoice_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.TM_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.tm_Invoice_Date, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_manufacturing_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.MANUFACTURING_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_dealer_invoice_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.DEALER_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_gst_invoice_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.GST_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : '');

      jQuery("#cal_claim_details_acknowledgement_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : '');

      jQuery("#cal_claim_details_booking_date").calendar({
        type: "date",
        formatter: {
          date: function(date, settings) {
            if (!date) return "";
            var day = date.getDate();
            var month = monthsShort[date.getMonth()];
            var year = date.getFullYear();
            return day + "-" + month + "-" + year;
          }
        },
        popupOptions: {
          observeChanges: false,
          position: "bottom left",
          lastResort: "bottom left",
          prefer: "opposite"
        },
        onChange: (date, text, mode) => {
          this.claimDetailsForm.controls.BOOKING_DATE.setValue(text);
        },
      }).calendar("set date", this.isEdit ? this.datePipe.transform('', 'dd-MMM-yyyy') : this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.booking_DATE, 'dd-MMM-yyyy'));

      $('#txt_claim_details_tm_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_manufacturing_date').parent().addClass('disabled');
      $('#txt_claim_details_dealer_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_gst_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_acknowledgement_date').parent().addClass('disabled');
      $('#txt_claim_details_booking_date').parent().addClass('disabled');

      let type: string = this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.type;

      if(type.includes('FS')){
        this.getFinancierAmount();
        this.isFinancier =true;
      }
      else if(type.includes('EXC')){
        this.getExchangeVerification();
        this.isExchange= true;
      }
      else{
        this.isFinancier = false;
        this.isExchange = false;
      }
    }, 0);

    this.createOrEditForm();
  }

  createOrEditForm() {
    this.claimDetailsForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', this.isEdit ? Validators.required : ''],
      CLAIM_LIMIT: [this.isEdit ? '' : '', Validators.required],
      CLAIM_AMOUNT: [this.isEdit ? this.claimDetailsObj?.claim_AMOUNT_ORG : 0, [Validators.required, Validators.min(0), Validators.max(1)]],
      FINAL_CLAIM_AMOUNT: [this.isEdit ? this.claimDetailsObj?.claim_AMOUNT : ''],
      AVAILABLE_DISCOUNT: [this.isEdit ? '' : ''],
      ACTUAL_DISCOUNT_SAP: [this.isEdit ? '' : ''],
      USE_DISCOUNT: [this.isEdit ? '' : ''],
      DEALER_SHARE: [this.isEdit ? '' : ''],
      SCHEME_NAME: [this.isEdit ? '' : '', Validators.required],
      SCHEME_ID: [this.isEdit ? '' : '', Validators.required],
      DEALER_BUSINESS_UNIT: [this.isEdit ? '' : ''],
      REGION: [this.isEdit ? '' : ''],
      AREA: [this.isEdit ? '' : ''],
      LOCATION: [this.isEdit ? '' : ''],
      CUSTOMER_NAME: [this.isEdit ? '' : ''],
      DEALER_CODE: [this.isEdit ? '' : ''],
      DEALER_NAME: [this.isEdit ? '' : ''],
      CHASSIS_BUSINESS_UNIT: [this.isEdit ? '' : ''],
      CHASSIS_NO: [this.isEdit ? '' : '', Validators.required],
      LOB: [this.isEdit ? '' : ''],
      PPL: [this.isEdit ? '' : ''],
      PL: [this.isEdit ? '' : ''],
      VC: [this.isEdit ? '' : ''],
      TM_INVOICE_NO: [this.isEdit ? '' : ''],
      TM_INVOICE_DATE: [this.isEdit ? '' : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.tm_Invoice_Date, 'dd-MMM-yyyy')],
      MANUFACTURING_DATE: [this.isEdit ? '' : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy')],
      ACCOUNT_TYPE: [this.isEdit ? '' : ''],
      DEALER_INVOICE_NO: [this.isEdit ? '' : ''],
      DEALER_INVOICE_DATE: [this.isEdit ? '' : this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy')],
      TEST_DRIVE_VEHICLE: [this.isEdit ? '' : ''],
      VC_CATEGORY: [this.isEdit ? '' : ''],
      GST_INVOICE_NO: [this.isEdit ? '' : ''],
      GST_INVOICE_DATE: [this.isEdit ? '' : ''],
      IRN: [this.isEdit ? '' : ''],
      ACKNOWLEDGEMENT_NO: [this.isEdit ? '' : ''],
      ACKNOWLEDGEMENT_DATE: [this.isEdit ? '' : ''],
      DELIVERY_STATUS: [this.isEdit ? '' : ''],
      REGISTRATION_TYPE: [this.isEdit ? '' : ''],
      BOOKING_DATE: [this.isEdit ? '' : ''],
      STOCK_TRANSFER: [this.isEdit ? '' : ''],
      AVAIL_CONCESSION: [this.isEdit ? '' : ''],
      ACTUAL_CONCESSION_CRM: [this.isEdit ? '' : ''],
      USED_CONCESSION: [this.isEdit ? '' : ''],
      ACTUAL_AVAILABLE_CONCESSION: [this.isEdit ? '' : ''],
      MANUAL_CREDIT_AMOUNT: [this.isEdit ? '' : ''],
      CRM_CREDIT_AMOUNT: [this.isEdit ? '' : ''],
      IS_TMI_AUTO_VERIFIED: [this.isEdit ? '' : ''],
      IS_LOYALTY_AUTO_VERIFIED: [this.isEdit ? '' : ''],
      IS_EXCHANGE_VERIFIED: [this.isEdit ? '' : ''],
      FUEL_TYPE: [this.isEdit ? '' : ''],
      SETTLEMENT_TYPE: [this.isEdit ? '' : ''],
      IRN_CATEGORY: [this.isEdit ? '' : ''],
      OFFTAKE_DEALER_CODE: [this.isEdit ? '' : ''],
      OFFTAKE_DEALER_NAME: [this.isEdit ? '' : ''],
      OFFTAKE_DEALER_GSTIN: [this.isEdit ? '' : ''],
      RETAIL_DEALER_GSTIN: [this.isEdit ? '' : ''],
      ACTION: [this.isEdit ? '' : '', Validators.required],
      REMARK: [this.isEdit ? '' : '', Validators.required],
    });

    setTimeout(() => {
      if(this.isEdit){
        jQuery('#dd_claim_details_action').dropdown('set selected', (this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));

        this.sharedService.changeAction((this.actionList.map((item) => item.action).includes(this.claimDetailsObj?.action_SEL) ? this.claimDetailsObj?.action_SEL : this.actionList[0]?.action));
        this.sharedService.changeRemark(this.claimDetailsObj?.remarks);
      }
    }, 0);
  }

  setClaimDetails(){
    this.isFISettlement = this.sharedService.individualClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE == "FI" ? true : false;
    this.claimDetailsForm.controls.CLAIM_LIMIT.setValue(Number(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.claim_LIMIT));
    this.claimDetailsForm.controls.AVAILABLE_DISCOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.availableFlatDiscountDetailEntity?.available_DISCOUNT);
    this.claimDetailsForm.controls.ACTUAL_DISCOUNT_SAP.setValue(this.sharedService.individualClaimsPreSelectedData.availableFlatDiscountDetailEntity?.actual_DISCOUNT_SAP);
    this.claimDetailsForm.controls.USE_DISCOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.usedDiscountDetailEntity?.used_DISCOUNT);
    this.claimDetailsForm.controls.DEALER_SHARE.setValue('0.0');
    this.claimDetailsForm.controls.SCHEME_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME);
    this.claimDetailsForm.controls.SCHEME_ID.setValue(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_ID);
    this.claimDetailsForm.controls.DEALER_BUSINESS_UNIT.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_BU);
    this.claimDetailsForm.controls.REGION.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_REGION);
    this.claimDetailsForm.controls.AREA.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_AREA);
    this.claimDetailsForm.controls.LOCATION.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.location);
    this.claimDetailsForm.controls.CUSTOMER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.cust_NAME);
    this.claimDetailsForm.controls.DEALER_CODE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_CODE);
    this.claimDetailsForm.controls.DEALER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_NAME);
    this.claimDetailsForm.controls.CHASSIS_BUSINESS_UNIT.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.bu);
    this.claimDetailsForm.controls.CHASSIS_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.chassis);
    this.claimDetailsForm.controls.LOB.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.lob);
    this.claimDetailsForm.controls.PPL.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.ppl);
    this.claimDetailsForm.controls.PL.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.pl);
    this.claimDetailsForm.controls.VC.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.vc);
    this.claimDetailsForm.controls.TM_INVOICE_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.tm_INV_NO);
    this.claimDetailsForm.controls.TM_INVOICE_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.tm_Invoice_Date, 'dd-MMM-yyyy'));
    this.claimDetailsForm.controls.MANUFACTURING_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsForm.controls.ACCOUNT_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.account_TYPE);
    this.claimDetailsForm.controls.DEALER_INVOICE_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_NUMBER);
    this.claimDetailsForm.controls.DEALER_INVOICE_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsForm.controls.TEST_DRIVE_VEHICLE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.td_FLAG);
    this.claimDetailsForm.controls.VC_CATEGORY.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.vc_CATEGORY);
    this.claimDetailsForm.controls.DELIVERY_STATUS.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.delivery_STATUS);
    this.claimDetailsForm.controls.REGISTRATION_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.reg_TYPE);
    this.claimDetailsForm.controls.BOOKING_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.booking_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsForm.controls.STOCK_TRANSFER.setValue(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.stock_TRANSFER_FLAG);
    this.claimDetailsForm.controls.AVAIL_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.usedConcessionDetailsEntity?.avail_CONCESSION);
    this.claimDetailsForm.controls.ACTUAL_CONCESSION_CRM.setValue(this.sharedService.individualClaimsPreSelectedData?.concessionAmtDetailsEntity?.actual_CONCESSION_CRM);
    this.claimDetailsForm.controls.USED_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.usedConcessionDetailsEntity?.used_CONCESSION);
    this.claimDetailsForm.controls.ACTUAL_AVAILABLE_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.actualAvailableConcessionEntity?.actual_AVAILABLE_CONCESSION);
    this.claimDetailsForm.controls.MANUAL_CREDIT_AMOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.actualAvailableConcessionEntity?.manual_CREDIT_AMT);
    this.claimDetailsForm.controls.CRM_CREDIT_AMOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.cRMCreditAmtDetailsEntity?.crm_CREDIT_AMT);
    this.claimDetailsForm.controls.IS_TMI_AUTO_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.tmi_AUTO_VERIFY);
    this.claimDetailsForm.controls.IS_LOYALTY_AUTO_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.loyalty_AUTO_VERIFY);
    this.claimDetailsForm.controls.IS_EXCHANGE_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.exchange_AUTO_VERIFY);
    this.claimDetailsForm.controls.FUEL_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.fuel_TYPE);
    this.claimDetailsForm.controls.SETTLEMENT_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE);
    this.claimDetailsForm.controls.IRN_CATEGORY.setValue(this.sharedService.individualClaimsPreSelectedData?.iRN_Applicability?.irn_category);
    this.claimDetailsForm.controls.OFFTAKE_DEALER_CODE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.offtake_DEALER_CODE);
    this.claimDetailsForm.controls.OFFTAKE_DEALER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.dealername);
    this.claimDetailsForm.controls.OFFTAKE_DEALER_GSTIN.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.dealer_GSTIN);
    this.claimDetailsForm.controls.RETAIL_DEALER_GSTIN.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.retail_GSTIN);
   
    if(this.claimDetailsForm.controls.STOCK_TRANSFER.value == "INTRA" || this.claimDetailsForm.controls.STOCK_TRANSFER.value == "INTER"){
      this.isStockTransfer = true
    }
    else{
      this.isStockTransfer = false;
    }

    this.sharedService.changeDealerInvoiceNo(this.claimDetailsForm.controls.DEALER_INVOICE_NO.value);
    this.sharedService.changeChassisNo(this.claimDetailsForm.controls.CHASSIS_NO.value);
    this.sharedService.changeSchemeId(this.claimDetailsForm.controls.SCHEME_ID.value);
    this.sharedService.changeSchemeName(this.claimDetailsForm.controls.SCHEME_NAME.value);
  }

  checkSaveIndividual(){
    this.claimDetailsForm.markAllAsTouched();
    
    if(this.claimDetailsForm.invalid){
      return;
    }
    
    if(Number(this.claimDetailsForm.controls.CLAIM_LIMIT.value) < Number(this.claimDetailsForm.controls.CLAIM_AMOUNT.value)){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Claim Amount Should Not Exceed Claim Limit', life: 7000});
    }
    else if(this.claimDetailsForm.controls.ACTION.value == "SBMT" && this.isGenerateIRNInvoiceButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Generate IRN', life: 7000});
    }
    else if(this.isCancelIRNButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Cancel IRN', life: 7000});
    }
    else if(this.isGenerateCreditNoteButton){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Please Generate Credit Note', life: 7000});
    }
    else if(this.isTMIValid){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Invalid Claim Amount. Please Reduce Claim Amount', life: 7000});
    }
    else if(this.isExchange && this.claimDetailsForm.controls.ACTION.value == 'SBMT'){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'Exchange Validation not successful', life: 7000});
    }
    else{
      this.confirmationService.confirm({
        message: !this.isFISettlement && this.claimDetailsForm.controls.ACTION.value == 'SBMT' ? "1) I Confirm that the discount as per scheme/approval is passed on to the end customer. \n 2) I solemnly and sincerely declare that, the Claim is true and correct in every respect." : this.sharedService.getMessageBasedOnAction(this.claimDetailsForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          this.saveIndividualClaim(false);
        },
        key: 'claimDetailsDialog'
      });
    }
  }

  saveIndividualClaim(flag){
    $('.loader').show();

    let individualClaimDetailsInputObj: any = {};
    individualClaimDetailsInputObj.claimId = this.claimDetailsForm.controls.CLAIM_ID.value;
    individualClaimDetailsInputObj.schemeId = this.claimDetailsForm.controls.SCHEME_ID.value;
    individualClaimDetailsInputObj.chassisNo = this.claimDetailsForm.controls.CHASSIS_NO.value;
    individualClaimDetailsInputObj.claimAmtOrg = this.claimDetailsForm.controls.CLAIM_AMOUNT.value;
    individualClaimDetailsInputObj.groupClaimId = null;
    individualClaimDetailsInputObj.isGrouped = 'N';
    individualClaimDetailsInputObj.dealerCode = '';
    individualClaimDetailsInputObj.claimType = 'IND';
    individualClaimDetailsInputObj.action = this.claimDetailsForm.controls.ACTION.value;
    individualClaimDetailsInputObj.remark = this.claimDetailsForm.controls.REMARK.value;
    individualClaimDetailsInputObj.role = this.sharedService.userRole;
    individualClaimDetailsInputObj.status = "";
    individualClaimDetailsInputObj.nfaMaxClmAmt = 0;

    this.claimsService.postIndividualClaim(individualClaimDetailsInputObj).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS"){
        if((individualClaimDetailsInputObj.claimId == undefined || individualClaimDetailsInputObj.claimId == null || individualClaimDetailsInputObj.claimId == "") && (claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT?.length > 0)){
          this.claimDetailsForm.controls.CLAIM_ID.setValue(claimDetailsResponse.RESPONSE_OUT);
          this.sharedService.changeClaimId(claimDetailsResponse.RESPONSE_OUT);
          
          if(this.claimDetailsForm.controls.ACTION.value == 'SVDT'){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'claimDetailsMessage', severity:'success', summary: 'Success', detail:'Claim Id ' + this.claimDetailsForm.controls.CLAIM_ID.value + ' Created Successfully', life: 7000});
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Claim Custody Updated Successfully', life: 7000});
          }

          this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
          this.getIndividualBasicClaimsDetails();
          this.checkButtonVisibility();
          this.sharedService.changeModifiedAction(this.claimDetailsForm.controls.ACTION.value);
        }
        else if((individualClaimDetailsInputObj.claimId != undefined || individualClaimDetailsInputObj.claimId != null || individualClaimDetailsInputObj.claimId != "") && (claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT?.length > 0)){
          if(this.claimDetailsForm.controls.ACTION.value == 'SVDT'){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'claimDetailsMessage', severity:'success', summary: 'Success', detail:'Claim Id ' + this.claimDetailsForm.controls.CLAIM_ID.value + ' Updated Successfully', life: 7000});
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Claim Custody Updated Successfully', life: 7000});
          }

          this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
          this.getIndividualBasicClaimsDetails();
          this.checkButtonVisibility();
          this.sharedService.changeModifiedAction(this.claimDetailsForm.controls.ACTION.value);
        }
        else if(claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT == "ERROR"){
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error in Saving Claim Details: ' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Claim Details', life: 7000});
        }
      }
      else if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "ERROR"){
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Individual Claim Details: ' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Individual Claim Details', life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Saving Individual Claim Details', life: 7000});
      }
    });
  }

  checkTMIAmount(){
    this.isTMIValid = false;  
    
    this.checkIRNCancelButtonVisibility();
    
    let schemeTypeName = this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.type;
    
    if(schemeTypeName.includes('TMI')){
      this.getTMIValidation();
    }
  }

  getTMIValidation(){
    let individualClaimDetailsInputObj: any = {};
    individualClaimDetailsInputObj.schemeId = this.claimDetailsForm.controls.SCHEME_ID.value;
    individualClaimDetailsInputObj.chassisNo = this.claimDetailsForm.controls.CHASSIS_NO.value;
    individualClaimDetailsInputObj.claimAmt = this.claimDetailsForm.controls.CLAIM_AMOUNT.value

    this.claimsService.validateTMIClaim(individualClaimDetailsInputObj).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS"){  
        this.isTMIValid = false;  
      }
      else{
        this.isTMIValid = true;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'info',  summary: 'Note', detail:'Note:' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
      }
    },(error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info',  summary: 'Note', detail: 'Error Validating Claim Amount', life: 7000});
    });    
  }

  checkLimit(event, flag){
    this.claimDetailsForm.controls.CLAIM_AMOUNT.clearValidators();
    this.claimDetailsForm.controls.CLAIM_AMOUNT.updateValueAndValidity();

    if(flag){
      this.claimDetailsForm.controls.CLAIM_AMOUNT.addValidators([Validators.required, Validators.min(0), Validators.max(event)]);
    }
    else{
      this.claimDetailsForm.controls.CLAIM_AMOUNT.addValidators([Validators.required, Validators.min(0), Validators.max(event.target.valueAsNumber)]);
    }

    this.claimDetailsForm.controls.CLAIM_AMOUNT.updateValueAndValidity();
  }

  checkButtonVisibility(){
    if(this.claimDetailsForm.controls.IRN.value == null || this.claimDetailsForm.controls.IRN.value == ""){
      if(this.claimDetailsForm.controls.SETTLEMENT_TYPE.value == "FI" && this.claimDetailsForm.controls.IRN_CATEGORY.value == "Mandate" && this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
        this.isGenerateIRNInvoiceButton = true;
      }
      else if(this.claimDetailsForm.controls.SETTLEMENT_TYPE.value == "FI" && this.claimDetailsForm.controls.IRN_CATEGORY.value != "Mandate" && this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
        this.isGenerateInvoiceButton = true;
      }
      else{
        this.isGenerateIRNInvoiceButton = false;
        this.isGenerateInvoiceButton = false;
      }
    }
    else{
      this.isGenerateIRNInvoiceButton = false;
      this.isDownloadInvoiceButton = true;
    }
  }

  checkIRNCancelButtonVisibility(){
    if(this.claimDetailsForm.controls.IRN.value != null && this.claimDetailsForm.controls.IRN.value != ""){
      $('.loader').show();

      if(this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){  
        let irnAndInvoiceInputParams: HttpParams = new HttpParams();
        irnAndInvoiceInputParams = irnAndInvoiceInputParams.set('pClaim', this.claimDetailsForm.controls.CLAIM_ID.value);

        this.claimsService.irnDurationCheck(irnAndInvoiceInputParams).subscribe((claimDetailsResponse) => {
          if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != ""){
            this.isCancelIRNButton = claimDetailsResponse.RESPONSE_OUT.CancelIRN;

            if(this.isCancelIRNButton){
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Please Cancel IRN', life: 7000});
            }
            else{
              this.isGenerateCreditNoteButton = true;
              $('html,body,div').animate({ scrollTop: 0 }, 'slow');
              this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Please Generate Credit Note', life: 7000});
            }

            $('.loader').hide();
          }
          else{
            this.isCancelIRNButton = false;
            
            $('.loader').hide();
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error Getting IRN Duration', life: 7000});
          }
        }, (error) => {
          this.isCancelIRNButton = false;
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
            this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
            this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
            this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
          }
          else if(error && error.status && error.status == 500 && error.message){
            this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
          }
          else{ 
            this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error Getting IRN Duration', life: 7000});
          }
        });
      }
      else{
        this.isCancelIRNButton = false;
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
      }
    }
  }

  generateIRNAndInvoice(){
    if(this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
      $('.loader').show();

      let irnAndInvoiceInputParams: HttpParams = new HttpParams();
      irnAndInvoiceInputParams = irnAndInvoiceInputParams.set('pClaim', this.claimDetailsForm.controls.CLAIM_ID.value);

      this.claimsService.generateIRNAndInvoice(irnAndInvoiceInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE && claimDetailsResponse.RESPONSE_OUT.RESPONSE != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.status == "700"){
          this.isGenerateIRNInvoiceButton = false;
          this.isDownloadInvoiceButton = true;

          this.claimDetailsForm.controls.GST_INVOICE_NO.setValue(claimDetailsResponse.RESPONSE_OUT.Invoice_Number);
          this.claimDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(new Date(claimDetailsResponse.RESPONSE_OUT.Invoice_Date), 'dd-MMM-yyyy'));
          this.claimDetailsForm.controls.IRN.setValue(claimDetailsResponse.RESPONSE_OUT.RESPONSE.irn_no);
          this.claimDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(claimDetailsResponse.RESPONSE_OUT.RESPONSE.ack_no);
          this.claimDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(new Date(claimDetailsResponse.RESPONSE_OUT.RESPONSE.ack_dt), 'dd-MMM-yyyy'));

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'success',  summary: 'Success', detail: 'IRN and Invoice Generated Successfully', life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != null && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS == "FAIL"){
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation: ' + claimDetailsResponse.RESPONSE_OUT.IRNValidation_PMSG, life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != ""){
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation: ' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
        }
        else{
          this.isDownloadInvoiceButton = false;

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation', life: 7000});
        }
      }, (error) => {
        this.isDownloadInvoiceButton = false;
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in IRN and Invoice Generation', life: 7000});
        }
      }); 
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  donwloadInvoice(){
    if(this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
      $('.loader').show();

      let downloadInvoiceInputParams: HttpParams = new HttpParams();
      downloadInvoiceInputParams = downloadInvoiceInputParams.set('pClaim', this.claimDetailsForm.controls.CLAIM_ID.value);

      this.claimsService.downloadInvoice(downloadInvoiceInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null){
          const blob = claimDetailsResponse;
          const url = window.URL.createObjectURL(blob);
    
          var link = document.createElement('a');
          link.href = url;
          link.download = "GST-Invoice-" + this.claimDetailsForm.controls.CLAIM_ID.value + ".pdf";
          link.click(); 
          $('.loader').hide();

          this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
          this.getIndividualBasicClaimsDetails();
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Downloading Invoice', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Downloading Invoice', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  cancelIRN(){
    if(this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
      $('.loader').show();

      let cancelIRNInputParams: HttpParams = new HttpParams();
      cancelIRNInputParams = cancelIRNInputParams.set('pClaim', this.claimDetailsForm.controls.CLAIM_ID.value);

      this.claimsService.cancelIRN(cancelIRNInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE && claimDetailsResponse.RESPONSE_OUT.RESPONSE != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message != null && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message != "" && claimDetailsResponse.RESPONSE_OUT.RESPONSE.message == "IRN Cancelled"){
          this.isCancelIRNButton = false;
          this.isDownloadInvoiceButton = false;
          this.isGenerateIRNInvoiceButton = true;

          this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
          this.getIndividualBasicClaimsDetails();
          // this.saveIndividualClaim(true);

          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'success',  summary: 'Success', detail: 'IRN Cancelled Successfully', life: 7000});
        }
        else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "ERROR" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != "" && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS != null && claimDetailsResponse.RESPONSE_OUT.IRNValidation_PSTATUS == "FAIL"){
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'IRN Cancellation Failed: ' + claimDetailsResponse.RESPONSE_OUT.IRNValidation_PMSG, life: 7000});
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Cancelling IRN', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Cancelling IRN', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  generateCreditNote(){
    if(this.claimDetailsForm.controls.CLAIM_ID.value != null && this.claimDetailsForm.controls.CLAIM_ID.value != ""){
      $('.loader').show();

      let creditNoteInputParams: HttpParams = new HttpParams();
      creditNoteInputParams = creditNoteInputParams.set('pClaim', this.claimDetailsForm.controls.CLAIM_ID.value);

      this.claimsService.generateCreditNote(creditNoteInputParams).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null){
          this.isGenerateCreditNoteButton = false;
          this.isDownloadInvoiceButton = false;
          this.isGenerateIRNInvoiceButton = true;

          this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
          this.getIndividualBasicClaimsDetails();
          // this.saveIndividualClaim(true);

          const blob = claimDetailsResponse;
          const url = window.URL.createObjectURL(blob);
    
          var link = document.createElement('a');
          link.href = url;
          link.download = "Credit-Note-" + this.claimDetailsForm.controls.CLAIM_ID.value + ".pdf";
          link.click(); 
          $('.loader').hide();
        }
        else{
          $('.loader').hide();
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Generating Credit Note', life: 7000});
        }
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
        }
        else if(error && error.status && error.status == 500 && error.message){
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
        }
        else{ 
          this.messageService.add({key: 'claimDetailsMessage', severity: 'error',  summary: 'Error', detail: 'Error in Generating Credit Note', life: 7000});
        }
      });
    }
    else{
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity: 'info',  summary: 'Note', detail: 'Claim Id Not Available', life: 7000});
    }
  }

  getClaimDataById(claimId){
    let claimObjById: any;

    this.claimsService.getClaimDetailsById(claimId).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "SUCCESS"  && claimDetailsResponse.RESPONSE_OUT != null){
        claimObjById = claimDetailsResponse.RESPONSE_OUT[0];

        this.claimDetailsForm.controls.CLAIM_AMOUNT.setValue(claimObjById.claim_AMOUNT_ORG);
        this.claimDetailsForm.controls.FINAL_CLAIM_AMOUNT.setValue(claimObjById.claim_AMOUNT);
        this.claimDetailsForm.controls.GST_INVOICE_NO.setValue(claimObjById.gst_INV_NO);
        this.claimDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(claimObjById.gst_INV_DT, 'dd-MMM-yyyy'));
        this.claimDetailsForm.controls.IRN.setValue(claimObjById.irn_NUMBER);
        this.claimDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(claimObjById.acknowledgement_NO);
        this.claimDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(claimObjById.acknowledgement_DATE, 'dd-MMM-yyyy'));

        setTimeout(() => {
          this.sharedService.status = claimObjById.status;

          this.getAction(this.sharedService.userRole, this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.stm_ID, this.sharedService.status);
        }, 0);
      }
      else{
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Individual Claim Data', life: 7000});
      }
    });
  }

  getIndividualBasicClaimsDetails(){
    this.claimsService.getIndividualBasicClaimsDetails(this.claimDetailsForm.controls.CHASSIS_NO.value, this.claimDetailsForm.controls.SCHEME_ID.value, this.sharedService.position, this.claimDetailsForm.controls.CLAIM_ID.value).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT === "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != ""){
        this.sharedService.individualClaimsPreSelectedData = claimDetailsResponse.RESPONSE_OUT;
        this.sharedService.individualClaimsPreSelectedData.schemeMasterDetailsEntity.claim_LIMIT = this.claimDetailsForm.controls.CLAIM_LIMIT.value;

        setTimeout(() => {
          this.setClaimDetails();
        }, 0);
      }
      else{
        $('.loader').hide();
        this.sharedService.individualClaimsPreSelectedData = {};
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Claim Details By Chassis', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Claim Details By Chassis', life: 7000});
      }
    });
  }

  getAction(role: string, schemeTypeValue: string, status: string){
    this.claimsService.getAction(role, schemeTypeValue, status).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT.length > 0){
        this.actionList = claimDetailsResponse.RESPONSE_OUT;

        this.sharedService.changeActionList(this.actionList);
      }
      else{
        this.actionList = [];

        this.sharedService.changeActionList(this.actionList);

        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'No Data Available for Action', life: 7000});
      }

      setTimeout(() => {
        this.sharedService.changeAction(this.claimDetailsForm.controls.ACTION.value);
        this.sharedService.changeRemark(this.claimDetailsForm.controls.REMARK.value);
      }, 0);
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Action Data', life: 7000});
      }
    });
  }

  getFinancierAmount(){
    let financierInputObj: any = {};
    financierInputObj.schemeId = this.claimDetailsForm.controls.SCHEME_ID.value;
    financierInputObj.chassisNo = this.claimDetailsForm.controls.CHASSIS_NO.value;
    
    this.claimsService.getFinancierAmount(financierInputObj).subscribe((claimDetailsResponse)=>{
     if(claimDetailsResponse && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null ){
      this.claimDetailsObj = claimDetailsResponse.RESPONSE_OUT;
      this.claimDetailsForm.controls.CLAIM_AMOUNT.setValue(this.claimDetailsObj.CLAIM_AMT);
      this.checkLimit(this.claimDetailsObj.CLAIM_AMT,true);
      this.isFinancierAmount = false;
     }
      else{
        this.isFinancierAmount = true;
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail: claimDetailsResponse.RESPONSE_OUT, life: 7000});
      }

      $('.loader').hide();
    }, (error) => {
      $('.loader').hide();
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error',  summary: 'Error', detail:'Error in Financier Claim Amount', life: 7000});
      }
    });
  }

  getExchangeVerification(){
    this.exchangeObj.chassisNo = this.claimDetailsForm.controls.CHASSIS_NO.value;
    this.exchangeObj.schemeName = this.claimDetailsForm.controls.SCHEME_NAME.value;
    
    this.claimsService.getExchangeVerification(this.exchangeObj).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse&& claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT.length > 0){
         this.isExchange = false;
      }
      else{
        this.isExchange = true;
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'success', summary: 'Success', detail:'No Data Available for  Exchange Verification', life: 7000});
      }
    }, (error) => {
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      if(error && error.status && error.status == 400 && error.error && error.error.errors && error.error.errors[0]){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.errors[0]?.defaultMessage, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error[0] && error.error[0].STATUS_OUT && error.error[0].STATUS_OUT == "ERROR" && error.error[0].RESPONSE_OUT && error.error[0].RESPONSE_OUT != null && error.error[0].RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error[0].RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 400 && error.error && error.error.STATUS_OUT && error.error.STATUS_OUT == "ERROR" && error.error.RESPONSE_OUT && error.error.RESPONSE_OUT != null && error.error.RESPONSE_OUT != ""){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.error.RESPONSE_OUT, life: 7000 });
      }
      else if(error && error.status && error.status == 500 && error.message){
        this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: error.message, life: 7000 });
      }
      else{ 
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Getting Exchange Verification', life: 7000});
      }
    });
  }

  openAvailConcession(){
    setTimeout(() => {
      jQuery('#model_dealer_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availConcessionLazyComp = import('../avail-concession/avail-concession.component').then(({AvailConcessionComponent}) => AvailConcessionComponent);
    }, 0);
  }

  closeAvailConcession(){
    jQuery('#model_dealer_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availConcessionLazyComp = null;
  }

  openAvailableDiscount(){
    this.sharedService.changeTMInvNo(this.claimDetailsForm.controls.TM_INVOICE_NO.value);

    setTimeout(() => {
      jQuery('#model_dealer_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availableDiscountLazyComp = import('../available-discount/available-discount.component').then(({AvailableDiscountComponent}) => AvailableDiscountComponent);
    }, 0);
  }

  closeAvailableDiscount(){
    this.sharedService.changeTMInvNo("");
    
    jQuery('#model_dealer_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availableDiscountLazyComp = null;
  }

  openCRMCreditAmount(){
    setTimeout(() => {
      jQuery('#model_dealer_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.crmCreditAmountLazyComp = import('../crm-credit-amount/crm-credit-amount.component').then(({CrmCreditAmountComponent}) => CrmCreditAmountComponent);
    }, 0);
  }

  closeCRMCreditAmount(){
    jQuery('#model_dealer_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.crmCreditAmountLazyComp = null;
  }

  openActualConcessionCRM(){
    setTimeout(() => {
      jQuery('#model_dealer_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.actualConcessionCRMLazyComp = import('../actual-concession-crm/actual-concession-crm.component').then(({ActualConcessionCrmComponent}) => ActualConcessionCrmComponent);
    }, 0);
  }

  closeActualConcessionCRM(){
    jQuery('#model_dealer_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.actualConcessionCRMLazyComp = null;
  }

  toggleDealerDetails(){
    this.isToggleDealerDetails = !this.isToggleDealerDetails;
  }

  toggleChassisDetails(){
    this.isToggleChassisDetails = !this.isToggleChassisDetails;
  }
}
