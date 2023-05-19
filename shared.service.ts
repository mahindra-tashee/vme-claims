import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable, observable } from 'rxjs';
import _ from 'underscore';
import { ActualConcessionCrmComponent } from '../actual-concession-crm/actual-concession-crm.component';
import { AvailConcessionComponent } from '../avail-concession/avail-concession.component';
import { AvailableDiscountComponent } from '../available-discount/available-discount.component';
import { CrmCreditAmountComponent } from '../crm-credit-amount/crm-credit-amount.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public status: string;
  public isClaimEdit : boolean = false;
  public isGroupClaimEdit : boolean = false;
  public isClaimCopy : boolean = false;
  public taggedIndividualGroupClaimById: any = {};
  public individualClaimsPreSelectedData: any = {};
  public groupClaimsPreSelectedData: any = {};
  public ewclaimObjByChassis: any = {};
  public messageKey: string = "";
  public userRole: string = "";
  public claimObjById: any = {};
  public chassisObjByNum: any = {};
  public groupClaimObjById: any = {};
  public businessUnit: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public actionList: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public role: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public chassisNoNotAvailable: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public chassisNo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public nfaNo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public scheme_NAME: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public dealerInvoiceNo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public schemeId: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public schemeType: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public action: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public modifiedAction: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public remark: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public claimId: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public claimIdNotAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public groupClaimId: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public groupClaimIdNotAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public ppl: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public groupClaimStatus: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public dealerCode: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public TMInvNo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public position: string = "";
  public schemeViewUrl: any;
  public individualClaimViewUrl: any;
  public groupClaimViewUrl: any;
  public chassisViewUrl: any;
  public availConcessionLazyComp: Promise<Type<AvailConcessionComponent>>;
  public availableDiscountLazyComp: Promise<Type<AvailableDiscountComponent>>;
  public actualConcessionCRMLazyComp: Promise<Type<ActualConcessionCrmComponent>>;
  public crmCreditAmountLazyComp: Promise<Type<CrmCreditAmountComponent>>;

  constructor() { }

  setClaimId(value){
    this.claimId.next(value);
  }

  getRole(){
    return this.role.asObservable();
  }

  changeRole(value){
    this.role.next(value);
  }

  getAction(){
    return this.action.asObservable();
  }
  
  changeAction(value){
    this.action.next(value);
  }

  setGroupClaimId(value){
    this.groupClaimId.next(value);
  } 
  
  setTMInvNo(value) {
    this.TMInvNo.next(value);
  }

  getModifiedAction(){
    return this.modifiedAction.asObservable();
  }

  changeModifiedAction(value){
    this.modifiedAction.next(value);
  }

  getRemark(){
    return this.remark.asObservable();
  }

  changeRemark(value){
    this.remark.next(value);
  }
  getClaimId(){
    return this.claimId.asObservable();
  }

  changeClaimId(value){
    this.claimId.next(value);
  }

  getGroupClaimId(){
    return this.groupClaimId.asObservable();
  }
  
  getGroupClaimViewId(){
    return this.claimId.asObservable();
  }

  changeGroupClaimId(value){
    this.groupClaimId.next(value);
  }

  getChassisNo(){
    return this.chassisNo.asObservable();
  }

  changeChassisNo(value) {
    this.chassisNo.next(value);
  }

  getNFANo(){
    return this.nfaNo.asObservable();
  }

  changeNFANo(value) {
    this.nfaNo.next(value);
  }

  getTMInvNo(){
    return this.TMInvNo.asObservable();
  }
  
  changeTMInvNo(value){
    this.TMInvNo.next(value);
  }

  
  getSchemeName(){
    return this.scheme_NAME.asObservable();
  }

  changeSchemeName(value){
    this.scheme_NAME.next(value);
  }

  changeDealerInvoiceNo(value){
    this.dealerInvoiceNo.next(value);
  }

  getDealerInvoiceNo(){
    return this.dealerInvoiceNo.asObservable();
  }
  
  changeSchemeId(value){
    this.schemeId.next(value);
  }

  getSchemeId(){
    return this.schemeId.asObservable();
  }

  changeSchemeType(value){
    this.schemeType.next(value);
  }

  getSchemeType(){
    return this.schemeType.asObservable();
  }

  getActionList(){
    return this.actionList.asObservable();
  }

  changeActionList(value){
    this.actionList.next(value);
  }

  getBusinessUnit(){
    return this.businessUnit.asObservable();
  }

  changeBusinessUnit(value){
    this.businessUnit.next(value);
  }

  getClaimIdNotAvailable(){
    return this.claimIdNotAvailable.asObservable();
  }

  changeClaimIdNotAvailable(value){
    this.claimIdNotAvailable.next(value);
  }

  getGroupClaimIdNotAvailable(){
    return this.groupClaimIdNotAvailable.asObservable();
  }

  changeGroupClaimIdNotAvailable(value){
    this.groupClaimIdNotAvailable.next(value);
  }

  getPPL(){
    return this.ppl.asObservable();
  }

  changePPL(value){
    this.ppl.next(value);
  }

  getGroupClaimStatus(){
    return this.groupClaimStatus.asObservable();
  }

  changeGroupClaimStatus(value){
    this.groupClaimStatus.next(value);
  }

  getDealerCode(){
    return this.dealerCode.asObservable();
  }

  changeDealerCode(value){
    this.dealerCode.next(value);
  }

  getMessageBasedOnAction(action): string{
    let confirmMessage: string = "";

    if(action == 'ACKN'){
      confirmMessage = 'Do you want to Acknowledge?';
    }
    else if(action == 'AMCC'){
      confirmMessage = 'Do you want to Cancel AMC Contract?';
    }
    else if(action == 'AMNC'){
      confirmMessage = 'Do you want to Create New AMC Contract?';
    }
    else if(action == 'APPR'){
      confirmMessage = 'Do you want to Approve Claim?';
    }
    else if(action == 'BLCK'){
      confirmMessage = 'Dealer Blocked for Settlement';
    }
    else if(action == 'BNEW'){
      confirmMessage = 'Do you want to Create New Beneficiary Claim?';
    }
    else if(action == 'CINV'){
      confirmMessage = 'Do you want to Create Invoice?';
    }
    else if(action == 'CLBL'){
      confirmMessage = 'Do you want to Block Claim?';
    }
    else if(action == 'CNCR'){
      confirmMessage = 'Credit Not Canceleed';
    }
    else if(action == 'CONF'){
      confirmMessage = 'Do you want to Confirm Beneficiary?';
    }
    else if(action == 'CORD'){
      confirmMessage = 'Do you want to Create Order?';
    }
    else if(action == 'DREC'){
      confirmMessage = 'Do you want to Send Claim for Reconsideration?';
    }
    else if(action == 'DSCD'){
      confirmMessage = 'Do you want to Discard Claim?';
    }
    else if(action == 'EREV'){
      confirmMessage = 'Do you want to Reverse EW Mutual Exclusive Claim?';
    }
    else if(action == 'ESCL'){
      confirmMessage = 'Do you want to Escalate Claim?';
    }
    else if(action == 'EWCC'){
      confirmMessage = 'Do you want to Cancel EW Contract?';
    }
    else if(action == 'EWNC'){
      confirmMessage = 'Do you want to Create New EW Contract?';
    }
    else if(action == 'EWRC'){
      confirmMessage = 'Do you want to Reverse EW Contract?';
    }
    else if(action == 'FREV'){
      confirmMessage = 'Do you want to Reverse Externally?';
    }
    else if(action == 'HOLD'){
      confirmMessage = 'Do you want to Hold Claim?';
    }
    else if(action == 'INVC'){
      confirmMessage = 'Do you want to Cancel Invoice?';
    }
    else if(action == 'OFCPS'){
      confirmMessage = 'Do you want to PreSetup Offline Claim?';
    }
    else if(action == 'OFFCS'){
      confirmMessage = 'Do you want to Setup Offline Claim?';
    }
    else if(action == 'OFRV'){
      confirmMessage = 'Do you want to Reverse Claim Offline?';
    }
    else if(action == 'ORDS'){
      confirmMessage = 'Do you want to Create Scheduled Order?';
    }
    else if(action == 'ORES'){
      confirmMessage = 'Do you want to Reverse Scheduled Order?';
    }
    else if(action == 'OREV'){
      confirmMessage = 'Do you want to Reverse Order?';
    }
    else if(action == 'PRCO'){
      confirmMessage = 'Do you want to Paid-Send for Reconsideration?';
    }
    else if(action == 'PROC'){
      confirmMessage = 'Do you want to Process Beneficiary Claim?';
    }
    else if(action == 'RASS'){
      confirmMessage = 'Do you want to Reassign?';
    }
    else if(action == 'RECO'){
      confirmMessage = 'Do you want to Send for Reconsideration?';
    }
    else if(action == 'REJT'){
      confirmMessage = 'Do you want to Reject Claim?';
    }
    else if(action == 'REVS'){
      confirmMessage = 'Do you want to Reverse AMC Mutual Exclusive Claim?';
    }
    else if(action == 'RLBK'){
      confirmMessage = 'Do you want to Rollback Claim?';
    }
    else if(action == 'ROUA'){
      confirmMessage = 'Do you want to Route Claim Autonomously?';
    }
    else if(action == 'ROUM'){
      confirmMessage = 'Do you want to Route Claim Manually?';
    }
    else if(action == 'RSVL'){
      confirmMessage = 'Do you want to Reverse Claim for NonSubmission of Flow?';
    }
    else if(action == 'RVDS'){
      confirmMessage = 'Do you want to Cancel Scheduled Reversal?';
    }
    else if(action == 'RVSD'){
      confirmMessage = 'Do you want to Cancel Reversal?';
    }
    else if(action == 'SAVE'){
      confirmMessage = 'Do you want to Save Claim?';
    }
    else if(action == 'SBMT'){
      confirmMessage = 'Do you want to Submit Claim?';
    }
    else if(action == 'SCHR'){
      confirmMessage = 'Scheme Rejected';
    }
    else if(action == 'SDBK'){
      confirmMessage = 'Do you want to Send Back Claim?';
    }
    else if(action == 'SETL'){
      confirmMessage = 'Do you want to Settle Claim?';
    }
    else if(action == 'SORD'){
      confirmMessage = 'Do you want to Schedule Create Order?';
    }
    else if(action == 'SREV'){
      confirmMessage = 'Do you want to Schedule Reverse?';
    }
    else if(action == 'SROU'){
      confirmMessage = 'Do you want to Send for Routing?';
    }
    else if(action == 'SSBK'){
      confirmMessage = 'Do you want to Schedule Send Back?';
    }
    else if(action == 'SSVE'){
      confirmMessage = 'Do you want to Schedule Save?';
    }
    else if(action == 'STPS'){
      confirmMessage = 'Do you want to Sent to Post Settlement?';
    }
    else if(action == 'SVDT'){
      confirmMessage = 'Do you want to Save Draft?';
    }
    else if(action == 'SVES'){
      confirmMessage = 'Do you want to Schedule Settled?';
    }
    else if(action == 'SYFW'){
      confirmMessage = 'Do you want to System Forward?';
    }
    else if(action == 'VRFD'){
      confirmMessage = 'Do you want to Verify Document?';
    }
    else{
      confirmMessage = 'Do you want to Save Claim?';
    }

    return confirmMessage;
  }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10) {
    let totalPages = Math.ceil(totalItems / pageSize);
    let startPage: number, endPage: number;

    if(totalPages <= 5){
      startPage = 1;
      endPage = totalPages;
    }
    else{
      if(currentPage <= 3){
        startPage = 1;
        endPage = 5;
      }
      else if(currentPage + 1 >= totalPages){
        startPage = totalPages - 4;
        endPage = totalPages;
      }
      else{
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    let pages = _.range(startPage, endPage + 1);

    return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
        pages: pages
    };
  }
}
