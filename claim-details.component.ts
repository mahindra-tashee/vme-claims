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
import { User } from '../models/user.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-claim-details',
  templateUrl: './claim-details.component.html',
  styleUrls: ['./claim-details.component.scss']
})
export class ClaimDetailsComponent implements OnInit {
  claimDetailsForm: FormGroup;
  isEdit: boolean = false;
  businessUnit: string = "";
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
  isGDCFinance: boolean = false;
  isGDCChecker: boolean = false;
  isGDCHold: boolean = false;
  isIndividualUserList: boolean = false;
  isIndividualRemark: boolean = true;
  individualUserList: Array<User> = [];
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
        this.businessUnit = response;

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
                  this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.setValue(this.claimDetailsObj.claim_AMT_GDC);
                  this.claimDetailsForm.controls.FINAL_CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT);
                  this.claimDetailsForm.controls.GST_INVOICE_NO.setValue(this.claimDetailsObj.gst_INV_NO);
                  this.claimDetailsForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.gst_INV_DT, 'dd-MMM-yyyy'));
                  this.claimDetailsForm.controls.IRN.setValue(this.claimDetailsObj.irn_NUMBER);
                  this.claimDetailsForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.claimDetailsObj.acknowledgement_NO);
                  this.claimDetailsForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.acknowledgement_DATE, 'dd-MMM-yyyy'));

                  setTimeout(() => {
                    this.checkLimit(this.claimDetailsForm.controls.CLAIM_AMOUNT.value, true);
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

    this.sharedService.getRole().subscribe((response) => {
      if(response && response != null && response != "" && response == "MGDC"){
        this.isGDCFinance = true;
        this.isGDCChecker = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && response == "CGDC"){
        this.isGDCChecker = true;
        this.isGDCFinance = false;
        this.isGDCHold = false;
      }
      else if(response && response != null && response != "" && (response == "GDCH" || response == "OLHD" || response == "OPHD")){
        this.isGDCFinance = false;
        this.isGDCChecker = false;
        this.isGDCHold = true;
      }
      else{
        this.isGDCFinance = false;
        this.isGDCChecker = false;
        this.isGDCHold = false;
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

          setTimeout(() => {
            (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_claim_details_action').dropdown('get value') == "APPR" ? this.isIndividualUserList = true : this.isIndividualUserList = false;

            this.isIndividualUserList ? this.getUserList() : '';
          }, 0);
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
      jQuery('#dd_claim_details_user').dropdown();
      jQuery('#dd_claim_details_reason').dropdown();

      $('#dd_claim_details_action').on('change', () => {
        (this.isGDCFinance || this.isGDCHold) && jQuery('#dd_claim_details_action').dropdown('get value') == "APPR" ? this.isIndividualUserList = true : this.isIndividualUserList = false;

        this.isIndividualUserList ? this.getUserList(): '';
      });

      $('#dd_claim_details_reason').on('change', () => {
        if(jQuery('#dd_claim_details_reason').dropdown('get value') == "Your Own Comment"){
          this.isIndividualRemark = true;
          this.claimDetailsForm.controls.REMARK.addValidators(Validators.required);
        }
        else{
          this.isIndividualRemark = false;
          this.claimDetailsForm.controls.REMARK.clearValidators();
        }

        this.claimDetailsForm.controls.REMARK.setValue('');
      });

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
    }, 0);

    this.createOrEditForm();
  }

  createOrEditForm() {
    this.claimDetailsForm = this.formBuilder.group({
      CLAIM_ID: [this.isEdit ? this.claimDetailsObj?.claim_ID : '', this.isEdit ? Validators.required : ''],
      CLAIM_LIMIT: [this.isEdit ? '' : '', Validators.required],
      CLAIM_AMOUNT: [this.isEdit ? this.claimDetailsObj?.claim_AMOUNT_ORG : 0, [Validators.required]],
      GDC_APPROVED_AMOUNT: [this.isEdit ? this.claimDetailsObj?.claim_AMT_GDC : 0, [Validators.required, Validators.min(0), Validators.max(1)]],
      FINAL_CLAIM_AMOUNT: [this.isEdit ? this.claimDetailsObj?.claim_AMOUNT : ''],
      AVAILABLE_DISCOUNT: [this.isEdit ? '' : ''],
      ACTUAL_DISCOUNT_SAP: [this.isEdit ? '' : ''],
      USE_DISCOUNT: [this.isEdit ? '' : ''],
      DEALER_SHARE: [this.isEdit ? '' : ''],
      SCHEME_NAME: [this.isEdit ? '' : '', Validators.required],
      SCHEME_ID: [this.isEdit ? '' : '', Validators.required],
      IS_DOC_BASED: [this.isEdit ? '' : ''],
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
      USER: ['', this.isIndividualUserList ? Validators.required : '']
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
   
    this.sharedService.changeChassisNo(this.claimDetailsForm.controls.CHASSIS_NO.value);
    this.sharedService.changeTMInvNo(this.claimDetailsForm.controls.TM_INVOICE_NO.value);
    this.sharedService.changeDealerInvoiceNo(this.claimDetailsForm.controls.DEALER_INVOICE_NO.value);

    if(this.claimDetailsForm.controls.STOCK_TRANSFER.value == "INTRA" || this.claimDetailsForm.controls.STOCK_TRANSFER.value == "INTER"){
      this.isStockTransfer = true
    }
    else{
      this.isStockTransfer = false;
    }
  }

  getUserList(){
    $('#dd_claim_details_user').parent().addClass('loading');
    $('#dd_claim_details_user').parent().addClass('disabled');

    let approverUserListInputParams: HttpParams = new HttpParams();
    approverUserListInputParams = approverUserListInputParams.set('claim_ID_IN', this.claimDetailsForm.controls.CLAIM_ID.value);
    approverUserListInputParams = approverUserListInputParams.set('action_IN', this.claimDetailsForm.controls.ACTION.value);
    approverUserListInputParams = approverUserListInputParams.set('claim_TYPE', 'IND');
    approverUserListInputParams = approverUserListInputParams.set('BU_ID', this.businessUnit);

    this.claimsService.getApproverUserList(approverUserListInputParams).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.COUNT && claimDetailsResponse.COUNT != null && claimDetailsResponse.COUNT != "" && claimDetailsResponse.COUNT > 0){
        this.individualUserList = claimDetailsResponse.RESPONSE_OUT;
      }
      else if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.COUNT && claimDetailsResponse.COUNT != null && claimDetailsResponse.COUNT != "" && claimDetailsResponse.COUNT <= 0){
        this.individualUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail: 'No Data Available for User Names', life: 7000});
      }
      else{
        this.individualUserList = [];
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names: ' + claimDetailsResponse.RESPONSE_OUT, life: 7000});
      }
      
      $('#dd_claim_details_user').parent().removeClass('loading');
      $('#dd_claim_details_user').parent().removeClass('disabled');
    }, (error) => {
      $('#dd_claim_details_user').parent().removeClass('loading');
      $('#dd_claim_details_user').parent().removeClass('disabled');

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
        this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail: 'Error Getting User Names', life: 7000});
      }
    });
  }

  checkSaveIndividual(){
    this.claimDetailsForm.markAllAsTouched();
    
    if(this.claimDetailsForm.invalid){
      return;
    }
    
    if(Number(this.claimDetailsForm.controls.CLAIM_AMOUNT.value) < Number(this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.value)){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'TMLBSL Approved Amount Should Not Exceed Claim Amount', life: 7000});
    }
    else if(this.sharedService.userRole == "MGDC" && this.sharedService.status == "ESND" && (this.claimDetailsForm.controls.ACTION.value == "HOLD" || this.claimDetailsForm.controls.ACTION.value == "REJT" || this.claimDetailsForm.controls.ACTION.value == "RECO")){
      $('html,body,div').animate({ scrollTop: 0 }, 'slow');
      this.messageService.add({key: 'claimDetailsMessage', severity:'info', summary: 'Note', detail:'This Action is Not Allowed', life: 7000});
    }
    else{
      this.confirmationService.confirm({
        message: this.sharedService.getMessageBasedOnAction(this.claimDetailsForm.controls.ACTION.value),
        header: 'Save Claim',
        accept: () => {
          if(this.sharedService.userRole == "MGDC"){
            this.saveIndividualClaim(false);
          }
          else{
            this.updateCustody();
          }
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
    individualClaimDetailsInputObj.claimType = 'IND';
    individualClaimDetailsInputObj.action = this.claimDetailsForm.controls.ACTION.value;

    if(jQuery('#dd_claim_details_reason').dropdown('get value') == "Your Own Comment"){
      individualClaimDetailsInputObj.remark = this.claimDetailsForm.controls.REMARK.value;
    }
    else{
      individualClaimDetailsInputObj.remark = jQuery('#dd_claim_details_reason').dropdown('get value');
    }

    individualClaimDetailsInputObj.role = this.sharedService.userRole;
    individualClaimDetailsInputObj.reqType = this.sharedService.userRole;
    individualClaimDetailsInputObj.gdcAmt = this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.value;
    individualClaimDetailsInputObj.finalClaimAmt = this.claimDetailsForm.controls.FINAL_CLAIM_AMOUNT.value;
    individualClaimDetailsInputObj.toUser = this.claimDetailsForm.controls.USER.value;

    this.claimsService.putApproverIndividualClaim(individualClaimDetailsInputObj).subscribe((claimDetailsResponse) => {
      if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS"){
        if((individualClaimDetailsInputObj.claimId == undefined || individualClaimDetailsInputObj.claimId == null || individualClaimDetailsInputObj.claimId == "") && (claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT?.length > 0)){
          this.claimDetailsForm.controls.CLAIM_ID.setValue(claimDetailsResponse.CLAIM_ID);
          this.sharedService.changeClaimId(claimDetailsResponse.CLAIM_ID);
          
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

  updateCustody(){
    this.claimDetailsForm.markAllAsTouched();
    
    if(this.claimDetailsForm.invalid){
      return;
    }
    else{
      $('.loader').show();

      let individualClaimApproverInputObj: any = {};
      individualClaimApproverInputObj.pCLAIM_ID = this.claimDetailsForm.controls.CLAIM_ID.value;
      individualClaimApproverInputObj.pAction = this.claimDetailsForm.controls.ACTION.value;

      if(jQuery('#dd_claim_details_reason').dropdown('get value') == "Your Own Comment"){
        individualClaimApproverInputObj.pRemark = this.claimDetailsForm.controls.REMARK.value;
      }
      else{
        individualClaimApproverInputObj.pRemark = jQuery('#dd_claim_details_reason').dropdown('get value');
      }

      individualClaimApproverInputObj.pFromRole = this.sharedService.userRole;
      individualClaimApproverInputObj.pToRole = this.claimDetailsForm.controls.USER.value;

      this.claimsService.updateApproverIndividualClaimCustody(individualClaimApproverInputObj).subscribe((claimDetailsResponse) => {
        if(claimDetailsResponse && claimDetailsResponse != null && claimDetailsResponse != "" && claimDetailsResponse.STATUS_OUT && claimDetailsResponse.STATUS_OUT != null && claimDetailsResponse.STATUS_OUT != "" && claimDetailsResponse.STATUS_OUT == "SUCCESS" && claimDetailsResponse.RESPONSE_OUT && claimDetailsResponse.RESPONSE_OUT != null && claimDetailsResponse.RESPONSE_OUT != "" && claimDetailsResponse.RESPONSE_OUT.length > 0){
          if(claimDetailsResponse.RESPONSE_OUT[0].successOut == "TRUE"){
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: this.sharedService.messageKey, severity:'success', summary: 'Success', detail:'Individual Claim Custody Updated Successfully', life: 7000});

            this.getClaimDataById(this.claimDetailsForm.controls.CLAIM_ID.value);
            this.getIndividualBasicClaimsDetails();
            this.sharedService.changeModifiedAction(this.claimDetailsForm.controls.ACTION.value);
          }
          else{
            $('html,body,div').animate({ scrollTop: 0 }, 'slow');
            this.messageService.add({key: 'claimDetailsMessage', severity:'error', summary: 'Error', detail:'Error Updating Individual Claim Custody: ' + claimDetailsResponse.RESPONSE_OUT[0].successMsgOut, life: 7000});
          }
        }
        else{
          $('html,body,div').animate({ scrollTop: 0 }, 'slow');
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
        }

          $('.loader').hide();
      }, (error) => {
        $('.loader').hide();
        $('html,body,div').animate({ scrollTop: 0 }, 'slow');
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
          this.messageService.add({ key: 'claimDetailsMessage', severity: 'error', summary: 'Error', detail: 'Error Updating Individual Claim Custody', life: 7000 });
        }
      });
    }
  }

  checkLimit(event, flag){
    this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.clearValidators();
    this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.updateValueAndValidity();

    if(flag){
      this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.addValidators([Validators.required, Validators.min(0), Validators.max(event)]);
    }
    else{
      this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.addValidators([Validators.required, Validators.min(0), Validators.max(event.target.valueAsNumber)]);
    }

    this.claimDetailsForm.controls.GDC_APPROVED_AMOUNT.updateValueAndValidity();
  }

  getClaimDataById(claimId){
    let claimObjById: any;

    this.claimsService.getApproverClaimDetailsById(claimId).subscribe((claimDetailsResponse) => {
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
    this.claimsService.getApproverIndividualBasicClaimsDetails(this.claimDetailsForm.controls.CHASSIS_NO.value, this.claimDetailsForm.controls.SCHEME_ID.value, this.sharedService.position, this.claimDetailsForm.controls.CLAIM_ID.value).subscribe((claimDetailsResponse) => {
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

  openAvailConcession(){
    setTimeout(() => {
      jQuery('#model_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availConcessionLazyComp = import('../avail-concession/avail-concession.component').then(({AvailConcessionComponent}) => AvailConcessionComponent);
    }, 0);
  }

  closeAvailConcession(){
    jQuery('#model_avail_concession').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availConcessionLazyComp = null;
  }

  openAvailableDiscount(){
    setTimeout(() => {
      jQuery('#model_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.availableDiscountLazyComp = import('../available-discount/available-discount.component').then(({AvailableDiscountComponent}) => AvailableDiscountComponent);
    }, 0);
  }

  closeAvailableDiscount(){
    this.sharedService.changeTMInvNo("");
    
    jQuery('#model_available_discount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.availableDiscountLazyComp = null;
  }

  openCRMCreditAmount(){
    setTimeout(() => {
      jQuery('#model_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.crmCreditAmountLazyComp = import('../crm-credit-amount/crm-credit-amount.component').then(({CrmCreditAmountComponent}) => CrmCreditAmountComponent);
    }, 0);
  }

  closeCRMCreditAmount(){
    jQuery('#model_crm_credit_amount').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.crmCreditAmountLazyComp = null;
  }

  openActualConcessionCRM(){
    setTimeout(() => {
      jQuery('#model_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('show');

      this.sharedService.actualConcessionCRMLazyComp = import('../actual-concession-crm/actual-concession-crm.component').then(({ActualConcessionCrmComponent}) => ActualConcessionCrmComponent);
    }, 0);
  }

  closeActualConcessionCRM(){
    jQuery('#model_actual_concession_crm').modal('setting', 'closable', false).modal('setting', 'autofocus', false).modal('hide');

    this.sharedService.actualConcessionCRMLazyComp = null;
  }

  toggleDealerDetails(){
    this.isToggleDealerDetails = !this.isToggleDealerDetails;
  }

  toggleChassisDetails(){
    this.isToggleChassisDetails = !this.isToggleChassisDetails;
  }
}






