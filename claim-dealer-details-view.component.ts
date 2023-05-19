import { Component, OnInit, Type } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as $ from "jquery";
declare var jQuery: any;

import { ClaimDocs } from '../models/claim-docs.model';
import { ClaimsService } from '../services/claims.service';
import { NewClaimDetails } from '../models/new-reg-class.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedService } from '../services/shared.service';
import { Action } from '../models/action.model';
import { AvailConcessionComponent } from '../avail-concession/avail-concession.component';
import { ActualConcessionCrmComponent } from '../actual-concession-crm/actual-concession-crm.component';
import { CrmCreditAmountComponent } from '../crm-credit-amount/crm-credit-amount.component';
import { AvailableDiscountComponent } from '../available-discount/available-discount.component';
import { DatePipe } from '@angular/common';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-claim-dealer-details-view',
  templateUrl: './claim-dealer-details-view.component.html',
  styleUrls: ['./claim-dealer-details-view.component.scss']
})
export class ClaimDealerDetailsViewComponent implements OnInit {
  claimDetailsViewForm: FormGroup;
  actionList: Array<Action> = [];
  claimDetailsObj: any;
  isActionRemarkView: boolean = true;
  isToggleDealerDetails: boolean = true;
  isToggleChassisDetails: boolean = true;
  isFISettlement: boolean = false;
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
          if(this.sharedService.claimObjById && this.sharedService.claimObjById != null && this.sharedService.claimObjById != ""){
            this.claimDetailsObj = this.sharedService.claimObjById;

            setTimeout(() => {
              this.claimDetailsViewForm.controls.CLAIM_ID.setValue(this.claimDetailsObj.claim_ID);
              this.claimDetailsViewForm.controls.CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT_ORG);
              this.claimDetailsViewForm.controls.FINAL_CLAIM_AMOUNT.setValue(this.claimDetailsObj.claim_AMOUNT);
              this.claimDetailsViewForm.controls.GST_INVOICE_NO.setValue(this.claimDetailsObj.gst_INV_NO);
              this.claimDetailsViewForm.controls.GST_INVOICE_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.gst_INV_DT, 'dd-MMM-yyyy'));
              this.claimDetailsViewForm.controls.IRN.setValue(this.claimDetailsObj.irn_NUMBER);
              this.claimDetailsViewForm.controls.ACKNOWLEDGEMENT_NO.setValue(this.claimDetailsObj.acknowledgement_NO);
              this.claimDetailsViewForm.controls.ACKNOWLEDGEMENT_DATE.setValue(this.datePipe.transform(this.claimDetailsObj.acknowledgement_DATE, 'dd-MMM-yyyy'));
            }, 0);
          }
        }, 0);
      }
      else{
        this.messageService.add({key: 'claimDetailsViewMessage', severity:'info', summary: 'Note', detail:'No Data Available for Business Unit', life: 7000});
      }
    });
  }

  initializeComponent(): void {
    setTimeout(() => {
      jQuery('.coupled.modal').modal({allowMultiple: true});
      jQuery('#dd_document_details_view_action').dropdown();
      jQuery('.accordion').accordion({selector: { trigger: '.title'}});

      let monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let d = new Date();
      let cdate = d.getDate() + '-' + monthsShort[d.getMonth()] + '-' + d.getFullYear();
      let isEndDate: boolean = false;

      jQuery("#cal_claim_details_view_tm_invoice_date").calendar({
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
          this.claimDetailsViewForm.controls.TM_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.tm_Invoice_Date, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_view_manufacturing_date").calendar({
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
          this.claimDetailsViewForm.controls.MANUFACTURING_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_view_dealer_invoice_date").calendar({
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
          this.claimDetailsViewForm.controls.DEALER_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_view_gst_invoice_date").calendar({
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
          this.claimDetailsViewForm.controls.GST_INVOICE_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

      jQuery("#cal_claim_details_view_acknowledgement_date").calendar({
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
          this.claimDetailsViewForm.controls.ACKNOWLEDGEMENT_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform('', 'dd-MMM-yyyy'));

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
          this.claimDetailsViewForm.controls.BOOKING_DATE.setValue(text);
        },
      }).calendar("set date", this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.booking_DATE, 'dd-MMM-yyyy'));

      $('#txt_claim_details_view_tm_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_view_manufacturing_date').parent().addClass('disabled');
      $('#txt_claim_details_view_dealer_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_view_gst_invoice_date').parent().addClass('disabled');
      $('#txt_claim_details_view_acknowledgement_date').parent().addClass('disabled');
      $('#txt_claim_details_view_booking_date').parent().addClass('disabled');
    }, 0);

    this.createOrEditForm();
  }

  createOrEditForm() {
    this.claimDetailsViewForm = this.formBuilder.group({
      CLAIM_ID: [this.claimDetailsObj?.claim_ID],
      CLAIM_LIMIT: ['0'],
      CLAIM_AMOUNT: [this.claimDetailsObj?.claim_AMOUNT_ORG],
      FINAL_CLAIM_AMOUNT: [this.claimDetailsObj?.claim_AMOUNT],
      AVAILABLE_DISCOUNT: [''],
      ACTUAL_DISCOUNT_SAP: [''],
      USE_DISCOUNT: [''],
      DEALER_SHARE: [''],
      SCHEME_NAME: [''],
      SCHEME_ID: [''],
      DEALER_BUSINESS_UNIT: [''],
      REGION: [''],
      AREA: [''],
      LOCATION: [''],
      CUSTOMER_NAME: [''],
      DEALER_CODE: [''],
      DEALER_NAME: [''],
      CHASSIS_BUSINESS_UNIT: [''],
      CHASSIS_NO: [''],
      LOB: [''],
      PPL: [''],
      PL: [''],
      VC: [''],
      TM_INVOICE_NO: [''],
      TM_INVOICE_DATE: [this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.tm_Invoice_Date, 'dd-MMM-yyyy')],
      MANUFACTURING_DATE: [this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy')],
      ACCOUNT_TYPE: [''],
      DEALER_INVOICE_NO: [''],
      DEALER_INVOICE_DATE: [this.datePipe.transform(this.sharedService?.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy')],
      TEST_DRIVE_VEHICLE: [''],
      VC_CATEGORY: [''],
      GST_INVOICE_NO: [''],
      GST_INVOICE_DATE: [''],
      IRN: [''],
      ACKNOWLEDGEMENT_NO: [''],
      ACKNOWLEDGEMENT_DATE: [''],
      DELIVERY_STATUS: [''],
      REGISTRATION_TYPE: [''],
      BOOKING_DATE: [''],
      STOCK_TRANSFER: [''],
      AVAIL_CONCESSION: [''],
      ACTUAL_CONCESSION_CRM: [''],
      USED_CONCESSION: [''],
      ACTUAL_AVAILABLE_CONCESSION: [''],
      MANUAL_CREDIT_AMOUNT: [''],
      CRM_CREDIT_AMOUNT: [''],
      IS_TMI_AUTO_VERIFIED: [''],
      IS_LOYALTY_AUTO_VERIFIED: [''],
      IS_EXCHANGE_VERIFIED: [''],
      FUEL_TYPE: [''],
      SETTLEMENT_TYPE: [''],
      IRN_CATEGORY: [''],
      OFFTAKE_DEALER_CODE: [''],
      OFFTAKE_DEALER_NAME: [''],
      OFFTAKE_DEALER_GSTIN: [''],
      RETAIL_DEALER_GSTIN: [''],
      ACTION: [''],
      REMARK: [''],
      GST_AMOUNT: [''],
      DEALER_CLAIMED_AMOUNT: [''],
      GDC_USED_DISCOUNT: ['']
    });
  }

  setClaimDetails(){
    this.isFISettlement = this.sharedService.individualClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE == "FI" ? true : false;
    this.claimDetailsViewForm.controls.CLAIM_LIMIT.setValue(Number(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.claim_LIMIT));
    this.claimDetailsViewForm.controls.AVAILABLE_DISCOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.availableFlatDiscountDetailEntity?.available_DISCOUNT);
    this.claimDetailsViewForm.controls.ACTUAL_DISCOUNT_SAP.setValue(this.sharedService.individualClaimsPreSelectedData.availableFlatDiscountDetailEntity?.actual_DISCOUNT_SAP);
    this.claimDetailsViewForm.controls.USE_DISCOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.usedDiscountDetailEntity?.used_DISCOUNT);
    this.claimDetailsViewForm.controls.DEALER_SHARE.setValue('0.0');
    this.claimDetailsViewForm.controls.SCHEME_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_NAME);
    this.claimDetailsViewForm.controls.SCHEME_ID.setValue(this.sharedService.individualClaimsPreSelectedData?.schemeMasterDetailsEntity?.scheme_ID);
    this.claimDetailsViewForm.controls.DEALER_BUSINESS_UNIT.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_BU);
    this.claimDetailsViewForm.controls.REGION.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_REGION);
    this.claimDetailsViewForm.controls.AREA.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_AREA);
    this.claimDetailsViewForm.controls.LOCATION.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.location);
    this.claimDetailsViewForm.controls.CUSTOMER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.cust_NAME);
    this.claimDetailsViewForm.controls.DEALER_CODE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_CODE);
    this.claimDetailsViewForm.controls.DEALER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_NAME);
    this.claimDetailsViewForm.controls.CHASSIS_BUSINESS_UNIT.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.bu);
    this.claimDetailsViewForm.controls.CHASSIS_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.chassis);
    this.claimDetailsViewForm.controls.LOB.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.lob);
    this.claimDetailsViewForm.controls.PPL.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.ppl);
    this.claimDetailsViewForm.controls.PL.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.pl);
    this.claimDetailsViewForm.controls.VC.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.vc);
    this.claimDetailsViewForm.controls.TM_INVOICE_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.tm_INV_NO);
    this.claimDetailsViewForm.controls.TM_INVOICE_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.tm_Invoice_Date, 'dd-MMM-yyyy'));
    this.claimDetailsViewForm.controls.MANUFACTURING_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.manf_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsViewForm.controls.ACCOUNT_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.account_TYPE);
    this.claimDetailsViewForm.controls.DEALER_INVOICE_NO.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_NUMBER);
    this.claimDetailsViewForm.controls.DEALER_INVOICE_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.dealer_INVOICE_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsViewForm.controls.TEST_DRIVE_VEHICLE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.td_FLAG);
    this.claimDetailsViewForm.controls.VC_CATEGORY.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.vc_CATEGORY);
    this.claimDetailsViewForm.controls.GST_INVOICE_NO.setValue('');
    this.claimDetailsViewForm.controls.GST_INVOICE_DATE.setValue('');
    this.claimDetailsViewForm.controls.IRN.setValue('');
    this.claimDetailsViewForm.controls.ACKNOWLEDGEMENT_NO.setValue('');
    this.claimDetailsViewForm.controls.ACKNOWLEDGEMENT_DATE.setValue('');
    this.claimDetailsViewForm.controls.DELIVERY_STATUS.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.delivery_STATUS);
    this.claimDetailsViewForm.controls.REGISTRATION_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.reg_TYPE);
    this.claimDetailsViewForm.controls.BOOKING_DATE.setValue(this.datePipe.transform(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.booking_DATE, 'dd-MMM-yyyy'));
    this.claimDetailsViewForm.controls.STOCK_TRANSFER.setValue(this.sharedService.individualClaimsPreSelectedData?.vmeViewChassisDetailsEntity?.stock_TRANSFER_FLAG);
    this.claimDetailsViewForm.controls.AVAIL_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.usedConcessionDetailsEntity?.avail_CONCESSION);
    this.claimDetailsViewForm.controls.ACTUAL_CONCESSION_CRM.setValue(this.sharedService.individualClaimsPreSelectedData?.concessionAmtDetailsEntity?.actual_CONCESSION_CRM);
    this.claimDetailsViewForm.controls.USED_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.usedConcessionDetailsEntity?.used_CONCESSION);
    this.claimDetailsViewForm.controls.ACTUAL_AVAILABLE_CONCESSION.setValue(this.sharedService.individualClaimsPreSelectedData?.actualAvailableConcessionEntity?.actual_AVAILABLE_CONCESSION);
    this.claimDetailsViewForm.controls.MANUAL_CREDIT_AMOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.actualAvailableConcessionEntity?.manual_CREDIT_AMT);
    this.claimDetailsViewForm.controls.CRM_CREDIT_AMOUNT.setValue(this.sharedService.individualClaimsPreSelectedData?.cRMCreditAmtDetailsEntity?.crm_CREDIT_AMT);
    this.claimDetailsViewForm.controls.IS_TMI_AUTO_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.tmi_AUTO_VERIFY);
    this.claimDetailsViewForm.controls.IS_LOYALTY_AUTO_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.loyalty_AUTO_VERIFY);
    this.claimDetailsViewForm.controls.IS_EXCHANGE_VERIFIED.setValue(this.sharedService.individualClaimsPreSelectedData?.claimCommonIndClaimEntity?.exchange_AUTO_VERIFY);
    this.claimDetailsViewForm.controls.FUEL_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.fuel_TYPE);
    this.claimDetailsViewForm.controls.SETTLEMENT_TYPE.setValue(this.sharedService.individualClaimsPreSelectedData?.settlementTypeDetailEntity?.settlement_TYPE);
    this.claimDetailsViewForm.controls.IRN_CATEGORY.setValue(this.sharedService.individualClaimsPreSelectedData?.iRN_Applicability?.irn_category);
    this.claimDetailsViewForm.controls.OFFTAKE_DEALER_CODE.setValue(this.sharedService.individualClaimsPreSelectedData?.rvmeChassisDetailsByChassisEntity?.offtake_DEALER_CODE);
    this.claimDetailsViewForm.controls.OFFTAKE_DEALER_NAME.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.dealername);
    this.claimDetailsViewForm.controls.OFFTAKE_DEALER_GSTIN.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.dealer_GSTIN);
    this.claimDetailsViewForm.controls.RETAIL_DEALER_GSTIN.setValue(this.sharedService.individualClaimsPreSelectedData?.mviewVmeDealersEntity?.retail_GSTIN);
   
    if(this.claimDetailsViewForm.controls.STOCK_TRANSFER.value == "INTRA" || this.claimDetailsViewForm.controls.STOCK_TRANSFER.value == "INTER"){
      this.isStockTransfer = true
    }
    else{
      this.isStockTransfer = false;
    }

    this.sharedService.changeDealerInvoiceNo(this.claimDetailsViewForm.controls.DEALER_INVOICE_NO.value);
  }

  updateIndividualClaimCustody(){

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
    this.sharedService.changeTMInvNo(this.claimDetailsViewForm.controls.TM_INVOICE_NO.value);

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
