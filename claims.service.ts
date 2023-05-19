import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Myclaims } from '../models/myclaims.model';
import { NewClaimDetails, NFA } from '../models/new-reg-class.model';
import _ from 'underscore';
import { Status } from '../models/status.model';
import { SchemeDoc } from '../models/scheme-docs.model';
import { fileInfo, claimDocs } from '../models/claim-doc-upload.model';
import { ClaimDocs } from '../models/claim-docs.model';
import { GClaimDocs } from '../models/group-claim-docs.model';
import { GFileInfo } from '../models/group-claim-docs.model';
import { DatePipe } from '@angular/common';
import { GrpClaimDetails } from '../models/grp-claim-details.model';
import { GroupClaimDocs, ChassisWiseDocs } from '../models/group-claim-docs.model';
import { BudgetConsumption } from '../models/individual-claim.model';
import { DealerCommission } from '../models/dealer-commission.model';
import { SchemeDetailsView } from "../models/scheme-details-view.model";
import { SchemeCategoryType } from '../models/scheme.model';
import { SAPSchemeType } from '../models/sapscheme-type.model';
import { APIConstants } from '../models/apiconstants.model';
import { Observable } from 'rxjs';
import { FinancierNameDetails } from '../models/financier-name-details.model';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  constructor(private http: HttpClient) { }

  getTaggedIndividualGroupClaims(gClaimId): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'gClaimId': gClaimId }
    };

    return this.http.get<any>(APIConstants.taggedIndividualGroupClaimUrl, httpOptions);
  }

  getActualConcessionCRM(actualInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.actualConcessionCRMUrl, {params:actualInputParams});
  }
  
  getAvailConcession(availInputParams:HttpParams):Observable<any>{
    return this.http.get<any>(APIConstants.availConcessionUrl, {params:availInputParams});
  }

  getAvailableDiscount(availDiscInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.availableDiscountUrl, {params:availDiscInputParams});
  }

  getCRMCreditAmount(crmCreditAmountInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.crmCreditAmountUrl, {params:crmCreditAmountInputParams});
  }

  getIndividualClaims(individualClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.individualClaimsDashboardUrl, individualClaimInputObj);
  }
  
  exportIndividualClaims(individualClaimInputObj): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.individualClaimsDashboardExportUrl, individualClaimInputObj, {responseType: 'blob' as 'json'});
  }

  getApproverIndividualClaims(individualClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.approverIndividualClaimsDashboardUrl, individualClaimInputObj);
  }

  exportApproverIndividualClaims(individualClaimInputObj): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.approverIndividualClaimsDashboardExportUrl, individualClaimInputObj, {responseType: 'blob' as 'json'});
  }

  getExistingIndividualClaims(individualClaimInputParams): Observable<any>{
    return this.http.get<string>(APIConstants.individualClaimUrl, { params: individualClaimInputParams });
  }

  getGroupClaims(groupClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.groupClaimsDashboardUrl, groupClaimInputObj);
  }

  exportGroupClaims(groupClaimInputObj): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.groupClaimsDashboardExportUrl, groupClaimInputObj, {responseType: 'blob' as 'json'});
  }

  getApproverGroupClaims(groupClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.approverGroupClaimsDashboardUrl, groupClaimInputObj);
  }

  exportApproverGroupClaims(groupClaimInputObj): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.approverGroupClaimsDashboardExportUrl, groupClaimInputObj, {responseType: 'blob' as 'json'});
  }

  bulkClaimUpload(bulkClaimFile: File): Observable<any> {
    var formData = new FormData();
    formData.append('file', bulkClaimFile, bulkClaimFile.name);

    return this.http.post<any>(APIConstants.bulkClaimUploadUrl, formData);
  }

  // financierChassisUpload(FinancierChassisFile: File): Observable<any> {
  //   var formData = new FormData();
  //   formData.append('file', FinancierChassisFile, FinancierChassisFile.name);

  //   return this.http.post<[FinancierNameDetails]>(APIConstants.financierChassisUploadUrl, formData);
  // }

  irnDurationCheck(irnDurationInputParam: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.irnDurationCheckUrl, { params: irnDurationInputParam });
  }

  generateIRNAndInvoice(irnAndInvoiceInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.irnAndInvoiceGenerateUrl, { params: irnAndInvoiceInputParams });
  }

  downloadInvoice(downloadInvoiceInputParams: HttpParams): Observable<Blob>{
    return this.http.get<Blob>(APIConstants.invoiceDownloadUrl, { params: downloadInvoiceInputParams, responseType: 'blob' as 'json' });
  }

  cancelIRN(cancelIRNInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.canceIRNUrl, { params: cancelIRNInputParams });
  }

  generateCreditNote(creditNoteInputParams: HttpParams): Observable<Blob>{
    return this.http.get<Blob>(APIConstants.creditNoteUrl, { params: creditNoteInputParams, responseType: 'blob' as 'json' });
  }

  postIndividualClaim(individualClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postIndividualClaimDetailsUrl, individualClaimDetailsInputObj);
  }

  putApproverIndividualClaim(individualClaimDetailsInputObj): Observable<any>{
    return this.http.put<any>(APIConstants.postApproverIndividualClaimDetailsUrl, individualClaimDetailsInputObj);
  }
  
  updateApproverIndividualClaimCustody(individualClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postApproverIndividualClaimCustodyUrl, individualClaimDetailsInputObj);
  }
  
  updateIndividualClaimCustody(inputObj): Observable<any>{
    return this.http.post<any>(APIConstants.updateIndividualClaimCustody, inputObj);
  }

  updateIndClaimCustody(inputObj): Observable<any>{
    return this.http.post<any>(APIConstants.updateIndClaimCustody, inputObj);
  }

  postGroupClaim(groupClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postGroupClaimDetailsUrl, groupClaimDetailsInputObj);
  }

  postApproverGroupClaim(groupClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postApproverGroupClaimDetailsUrl, groupClaimDetailsInputObj);
  }

  updateGroupClaim(groupClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postGroupClaimDetailsUrl + '/update', groupClaimDetailsInputObj);
  }

  updateGroupClaimCustody(inputObj): Observable<any>{
    return this.http.post<any>(APIConstants.updateGroupClaimCustody, inputObj);
  }

  getChassisDetails(chassisNo) {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '' }
    };
  
    httpOptions.params.chassisNo = chassisNo;
  
    return this.http.get<any>(APIConstants.chassisDetailsUrl, httpOptions);
  }

  getChassisDataByNum(chassisNo) {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '', 'pageNumber': '', 'pageSize': ''}
    };
  
    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.pageNumber = '1';
    httpOptions.params.pageSize = '1';
  
    return this.http.get<any>(APIConstants.claimsHistoryUrl, httpOptions);
  }

  getClaimsHistory(claimsHistoryInputParams: HttpParams): Observable<any> {
    return this.http.get<any>(APIConstants.claimsHistoryUrl, { params: claimsHistoryInputParams });
  }

  getRetailHistory(retailHistoryInputParams: HttpParams):Observable<any> {
    return this.http.get<any>(APIConstants.retailHistoryUrl, { params: retailHistoryInputParams})
  }

  getCreditBreakup(creditInputParams: HttpParams): Observable<any> {
    return this.http.get<any>(APIConstants.creditBreakupUrl, { params: creditInputParams });
  }

  getOfftakeCancellationHistory(offtakeCancellationHistoryInputParams) :Observable<any>{
    return this.http.get<any>(APIConstants.offtakeCancellationHistoryUrl, {params:offtakeCancellationHistoryInputParams});
  }

  getConcessionBreakup(concBreakupinputParams: HttpParams): Observable<any> {
    return this.http.get<any>(APIConstants.concessionBreakupUrl, { params: concBreakupinputParams });
  }

  getConcessionTracking(conctrackinputParams: HttpParams): Observable<any> {
    return this.http.get<any>(APIConstants.concessionTrackingUrl, { params: conctrackinputParams });
  }

  getUserDetailsById(role: string, position: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pROLE_ID': role, 'pPOSITION': position }
    };

    return this.http.get<any>(APIConstants.userDetailsUrl, httpOptions);
  }
  
  getRole(): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'RoleType': 'NON_SAP', 'AppId': 'RVME' }
    };

    return this.http.get<any>(APIConstants.roleUrl, httpOptions);
  }

  getPosition(role: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pRole': role }
    };

    return this.http.get<any>(APIConstants.positionUrl, httpOptions);
  }

  getGeoMapping(position: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params:{ 'position':'', 'AppId':''}
    };

    httpOptions.params.position = position;
    httpOptions.params.AppId = 'RVME';

    return this.http.get<any>(APIConstants.geoMappingUrl, httpOptions);
  }

  getBusinessUnit(): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pAppId': '' }
    }

    httpOptions.params.pAppId = 'RVME';

    return this.http.get<any>(APIConstants.businessUnitGetUrl, httpOptions);
  }

  getUserPositions(role:string){
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params:{'pRole':role}
    }; 

    return this.http.get<any> (APIConstants.positionUrl, httpOptions);
  }

  async getProdDetailsForPositions(position: string) {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'position': position, 'AppId': 'RVME' }
    };

    return await this.http.get<any>(APIConstants.mappingpositionurl, httpOptions).toPromise()
  }

  getGeoDetailsForPositions(position: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'position': position, 'AppId': 'RVME' }
    };

    return  this.http.get<any>(APIConstants.geoMappingUrl, httpOptions);
  }

  getSchemeTypeList(buId: string, schemeCategoryType: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'BU_ID': '', 'SCHM_CAT_ID': '' }
    }

    httpOptions.params.BU_ID = buId;
    httpOptions.params.SCHM_CAT_ID = schemeCategoryType;

    return this.http.get<any>(APIConstants.schemeTypeUrl, httpOptions);
  }

  getGroupClaimDetailsById(gclaimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
     
    return this.http.get<any>(APIConstants.groupClaimUrl + gclaimId, httpOptions);
  }

  scheduledOfflineUpload(file: FormData): Observable<any> {
    var payload = new FormData();
    payload.append('claimType', file.get('settlement'));
    payload.append('file', file.get('file'));

    return this.http.post<any>(APIConstants.claimuploadUrl, payload);
  }

  offlineBatchUploadReject(file: FormData): Observable<any> {
    var payload = new FormData();
    payload.append('settlement', file.get('settlement'));
    payload.append('file', file.get('file'));

    return this.http.post<any>(APIConstants.claimuploadforrejectUrl, payload);
  }

  offlineBatchUploadHold(file: FormData): Observable<any> {
    var payload = new FormData();
    payload.append('settlement', file.get('settlement'));
    payload.append('file', file.get('file'));

    return this.http.post<any>(APIConstants. claimuploadforholdUrl, payload);
  }

  offlineClaimUploader(File:File,scope:string): Observable<any>{          
    const formData: FormData = new FormData();
    formData.append('file', File);
    formData.append("scope",scope);
   
    return this.http.post<any>( APIConstants.offlineClaimUploaderUrl, formData).pipe(timeout(600000));    //.pipe(timeout(6000000))
  }

  individualClaimInitialValidation(schemeId: string, chassisNo: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '', 'schemeId': ''}
    };

    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.schemeId = schemeId;

    return this.http.get<any>(APIConstants.individualClaimsValidationUrl, httpOptions);
  }

  groupClaimChassisValidation(chassisNo: string, schemeId: string, ppl: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '', 'schemeId': '', 'ppl': '' }
    };

    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.schemeId = schemeId;
    httpOptions.params.ppl = ppl;

    return this.http.get<any>(APIConstants.groupClaimsChassisValidationUrl, httpOptions);
  }

  groupClaimClaimValidation(claimId: string, chassisNo: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'claimId': '', 'chassisNo': '' }
    };

    httpOptions.params.claimId = claimId;
    httpOptions.params.chassisNo = chassisNo;
    
    return this.http.get<any>(APIConstants.groupClaimClaimValidationUrl, httpOptions);
  }

  getCustodyRole(workflowCode): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'WF_CODE': '', 'APPL_ID': 'RVME' }
    };
    
    httpOptions.params.WF_CODE = workflowCode;

    return this.http.get<any>(APIConstants.custodyRoleUrl, httpOptions);
  }

  getClaimLimit(chassisNo: string, schemeId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'schemeId': '', 'chassisNo': '' }
    };
    
    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.schemeId = schemeId;

    return this.http.get<any>(APIConstants.claimLimitUrl, httpOptions);
  }

  getApproverClaimLimit(chassisNo: string, schemeId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'schemeId': '', 'chassisNo': '' }
    };
    
    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.schemeId = schemeId;

    return this.http.get<any>(APIConstants.approverClaimLimitUrl, httpOptions);
  }

  getStatus(): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: {'pAPPL_ID': 'RVME'}
    };
    return this.http.get<any>(APIConstants.statusUrl, httpOptions);
  }

  getApproverStatus(roleId): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'ROLE_ID': '', 'APPL_ID': '', 'IS_VISIBLE': '', 'IS_ACTIVE': '' }
    };

    httpOptions.params.ROLE_ID = roleId;
    httpOptions.params.APPL_ID = 'RVME';
    httpOptions.params.IS_ACTIVE = 'Y';
    httpOptions.params.IS_VISIBLE = 'Y';

    return this.http.get<any>(APIConstants.approverStatusUrl, httpOptions);
  }

  getPPLList(schemeId: string, buId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'buId': buId, 'schemeId': schemeId }
    };
    
    return this.http.get<any>(APIConstants.grppllistUrl, httpOptions);
  }

  getIndividualActionHistory(claimId: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };

    return this.http.get<any>(APIConstants.individualActionHistoryUrl  + claimId, httpOptions)
  }

  getGroupActionHistory(gClaimId: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };

    return this.http.get<any>(APIConstants.groupActionHistoryUrl + gClaimId, httpOptions)
  }

  discardClaims(seqid: string): Observable<any>{
    var payload = new FormData();
    payload.append('SEQ_ID', seqid)

    return this.http.post<any>(APIConstants. discardclaimUrl, payload);
  }

  getAllBatchUploadedClaims(scheduledClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.offlineclaimschUrl, scheduledClaimInputObj);
  }

  exportScheduleClaims(scheduledClaimInputParams): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.scheduleClaimsDashboardExportUrl, scheduledClaimInputParams, {responseType: 'blob' as 'json'}).pipe(timeout(600000));
  }

  getAllActiveSchemes(schemeType: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'STM_ID': '' }
    };

    httpOptions.params.STM_ID = schemeType;

    return this.http.get<any>(APIConstants.schemeMasterUrl, httpOptions);
  }

  getActiveSchemes(monthYear: string): Observable<any>{ 
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'period': monthYear }
    };

    return this.http.get<any>(APIConstants.individualActiveSchemes, httpOptions);
  }

  getGroupActiveSchemes(monthYear: string): Observable<any>{ 
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'period': monthYear }
    };

    return this.http.get<any>(APIConstants.groupActiveSchemes, httpOptions);
  }

  getClaimType(): Observable<any>{
    return this.http.get<any>(APIConstants.claimTypeUrl);
  }

  getIndividualClaimsDocumentType(schemeId: string, claimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pSCHEME_ID': '', 'pCLAIM_ID': '' }
    };

    httpOptions.params.pCLAIM_ID = claimId;
    httpOptions.params.pSCHEME_ID = schemeId;

    return this.http.get<any>(APIConstants.individualClaimsDocumentTypeUrl, httpOptions);
  }

  getIndividualClaimsDocument(claimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };
    
    return this.http.get<any>(APIConstants.individualClaimsDocumentUrl + claimId, httpOptions);
  }

  uploadIndividualClaimsDocument(file: File, claimDocs: any, fileInfo: any): Observable<any>{
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('claimDocs', JSON.stringify(claimDocs));
    formData.append('fileInfo', JSON.stringify(fileInfo));

    return this.http.post<any>(APIConstants.individualClaimsDocumentUploadUrl, formData);
  }

  downloadIndividualClaimsDocument(docId: string, individualClaimDocumentInputParams: HttpParams): Observable<Blob>{
    return this.http.get<Blob>(APIConstants.individualClaimsDocumentDownloadUrl + docId, { params: individualClaimDocumentInputParams, responseType: 'blob' as 'json' });
  }

  deleteIndividualClaimsDocument(docId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };

    return this.http.put<any>(APIConstants.individualClaimsDocumentDeleteUrl + docId, httpOptions);
  }

  verifyIndividualClaimsDocument(docId, isVerified, inputObj): Observable<any>{
    return this.http.post<any>(APIConstants.approverIndividualVerifyDocument + docId + '?isVerified=' + isVerified, inputObj);
  }

  getGroupClaimsDocumentType(schemeId: string, claimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pSCHEME_ID': '', 'pCLAIM_ID': '', 'pWF_CODE': '' }
    };

    httpOptions.params.pCLAIM_ID = claimId;
    httpOptions.params.pSCHEME_ID = schemeId;

    return this.http.get<any>(APIConstants.groupClaimsDocumentTypeUrl, httpOptions);
  }

  downloadGroupClaimsDocument(docId: string, groupClaimDocumentInputParams: HttpParams): Observable<Blob>{
    return this.http.get<Blob>(APIConstants.groupClaimsDocumentDownloadUrl + docId, { params: groupClaimDocumentInputParams, responseType: 'blob' as 'json' });
  }

  deleteGroupClaimsDocument(docId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };

    return this.http.post<any>(APIConstants.groupClaimsDocumentDeleteUrl + docId, httpOptions);
  }

  verifyGroupClaimsDocument(docId, isVerified, inputObj): Observable<any>{
    return this.http.post<any>(APIConstants.approverGroupVerifyDocument + docId + '?isVerified=' + isVerified, inputObj);
  }

  getGroupClaimDocuments(gClaimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };
    
    return this.http.get<any>(APIConstants.groupClaimDocumentUrl + gClaimId, httpOptions);
  }

  getChassisWiseDocuments(gClaimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' }
    };

    return this.http.get<any>(APIConstants.groupChassisWiseDocumentUrl + gClaimId, httpOptions);
  }

  uploadGroupClaimsDocument(file: File, claimDocs: any, fileInfo: any): Observable<any>{
    const formData: FormData = new FormData();
    formData.append('pFILE', file, file.name);
    formData.append('claimDocs', JSON.stringify(claimDocs));
    formData.append('fileInfo', JSON.stringify(fileInfo));

    return this.http.post<any>(APIConstants.groupClaimsDocumentUploadUrl, formData);
  }

  getIndividualBasicClaimsDetails(chassisNo: string, schemeId: string, position: string, claimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '', 'scheme_id': '', 'pPosition': '', 'claim_id': '' }
    };

    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.scheme_id = schemeId;
    httpOptions.params.pPosition = position;
    httpOptions.params.claim_id = claimId;

    return this.http.get<any>(APIConstants.individualBasicClaimDetailsUrl, httpOptions);
  }

  getApproverIndividualBasicClaimsDetails(chassisNo: string, schemeId: string, position: string, claimId: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo': '', 'scheme_id': '', 'pPosition': '', 'claim_id': '' }
    };

    httpOptions.params.chassisNo = chassisNo;
    httpOptions.params.scheme_id = schemeId;
    httpOptions.params.pPosition = position;
    httpOptions.params.claim_id = claimId;

    return this.http.get<any>(APIConstants.approverIndividualBasicClaimDetailsUrl, httpOptions);
  }

  getGroupBasicClaimsDetails(schemeId: string, ppl: string, position: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'schemeid': '', 'ppl': '', 'pPosition': '' }
    };

    httpOptions.params.schemeid = schemeId;
    httpOptions.params.ppl = ppl;
    httpOptions.params.pPosition = position;

    return this.http.get<any>(APIConstants.groupBasicClaimDetailsUrl, httpOptions);
  }

  getApproverGroupBasicClaimsDetails(schemeId: string, ppl: string, position: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'schemeid': '', 'ppl': '', 'pPosition': '' }
    };

    httpOptions.params.schemeid = schemeId;
    httpOptions.params.ppl = ppl;
    httpOptions.params.pPosition = position;

    return this.http.get<any>(APIConstants.approverGroupBasicClaimDetailsUrl, httpOptions);
  }

  getAction(role: string, schemeTypeId: string, status: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'fromRole': '', 'schemeType': '', 'fromStatus': '' }
    }

    httpOptions.params.fromRole = role;
    httpOptions.params.schemeType = schemeTypeId;
    httpOptions.params.fromStatus = status;

    return this.http.get<any>(APIConstants.actionUrl, httpOptions);
  }

  getApproverAction(role: string, schemeTypeId: string, status: string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'fromRole': '', 'schemeType': '', 'fromStatus': '' }
    }

    httpOptions.params.fromRole = role;
    httpOptions.params.schemeType = schemeTypeId;
    httpOptions.params.fromStatus = status;

    return this.http.get<any>(APIConstants.actionUrl, httpOptions);
  }

  getApproverUserList(approverUserListInputParams: HttpParams): Observable<any>{
    return this.http.get<any>(APIConstants.approverUserListUrl, { params:  approverUserListInputParams});
  }


  getClaimDetailsById(claimId): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    }

    return this.http.get<any>(APIConstants.getClaimDetailsByIdUrl + '/' + claimId, httpOptions);
  }

  getApproverClaimDetailsById(claimId): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
    }

    return this.http.get<any>(APIConstants.getApproverClaimDetailsByIdUrl + '/' + claimId, httpOptions);
  }

  getWorkflowCode(schemeType): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'STM_ID': '', 'APPL_ID': '' }
    }

    httpOptions.params.STM_ID = schemeType;
    httpOptions.params.APPL_ID = 'RVME';

    return this.http.get<any>(APIConstants.workflowCodeUrl, httpOptions);
  }

  getNFADetails(nfaDetailsInputParam): Observable<any>{
    return this.http.get<any>(APIConstants.nfaDetailsGetUrl, { params: nfaDetailsInputParam });
  }

  getNFADetailsByChassis(nfaDetailsInputParam): Observable<any>{
    return this.http.get<any>(APIConstants.nfaDetailsByChassisGetUrl, { params: nfaDetailsInputParam });
  }

  getNFADetailsCalculation(nfaDetailsCalculationInputParam): Observable<any>{
    return this.http.get<any>(APIConstants.nfaDetailsCalculationGetUrl, { params: nfaDetailsCalculationInputParam });
  }

  getSAPFlatDetailsCalculation(sapFlatDetailsCalculationInputParam): Observable<any>{
    return this.http.get<any>(APIConstants.nfaSAPFlatDetailsCalculationGetUrl, { params: sapFlatDetailsCalculationInputParam });
  }

  getNFAConcessionDetailsCalculation(concessionDetailsCalculationInputParam): Observable<any>{
    return this.http.get<any>(APIConstants.nfaConcessionCalculationGetUrl, { params: concessionDetailsCalculationInputParam });
  }

  getAmcEwClaims(amcAndEwClaimInputParams): Observable<any>{
    return this.http.get<string>(APIConstants.amcEwClaimsDashboardUrl, { params: amcAndEwClaimInputParams });
  }

  getAmcDetailsDataByClaimid(claimid:string):Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pCLAIM_ID':'' }       //'DEALERCODE': this.dealercode ,
    };
   
    httpOptions.params.pCLAIM_ID = claimid;
 
    return this.http.get<any>(APIConstants.amcClaimDetailsUrl,httpOptions);

  }

  mutualExcAmcDetails(claimID: string):Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pCLAIM_ID': '' }
    };
   
    httpOptions.params.pCLAIM_ID = claimID;

    return this.http.get<any>(APIConstants.mutualExcAmcDetailsUrl, httpOptions);
  }

  getEWDetailsDataByClaimID(claimID: string):Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pCLAIM_ID': ''}
    };
   
    httpOptions.params.pCLAIM_ID = claimID;

    return this.http.get<any>(APIConstants.ewClaimDetailsUrl,httpOptions);

  }
  
  mutualExcEwDetails(claimID: string):Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pCLAIM_ID': ''}
    };
   
    httpOptions.params.pCLAIM_ID = claimID;

    return this.http.get<any>(APIConstants.ewExclClaimDetailsUrl,httpOptions);

  }

  getIncPolDetails(insurancePolicyDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.incPolDetailsUrl, insurancePolicyDetailsInputObj);
  }

  getFinancierNames(){
    return this.http.get<any>(APIConstants.financierNamesUrl);
  }
  
  getBeneficiaryName(beneficiaryNameInputParams:HttpParams):Observable<any>{
    return this.http.get<string>(APIConstants.beneficiaryNamesUrl, {params:beneficiaryNameInputParams});
  }

  financierChassisUpload(financierChassisFile: File): Observable<any> {
    var formData = new FormData();
    formData.append('file', financierChassisFile);

    return this.http.post<any>(APIConstants.financierChassisUploadUrl, formData);
  }

  getFinancierDetails(chassisNo): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'chassisNo':chassisNo }      
    };
    
    httpOptions.params.chassisNo = chassisNo;
    
    return this.http.get<string>(APIConstants.financierDetailsUrl, httpOptions);
  }  

  getAMCAmdEWStatus(type:string): Observable<any>{
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'pCLAIM_TYPE' :type}
    };

    httpOptions.params.pCLAIM_TYPE = type;

    return this.http.get<any>(APIConstants.amcewstatusUrl, httpOptions);
  }

  validateTMIClaim(individualClaimDetailsInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.postTmiClaimDetailsUrl, individualClaimDetailsInputObj);
  }

  validateAndSubmitFinancierChassisData(financierChassisDetailsObj):Observable<any>{
    return this.http.post<any>(APIConstants.financierValidateUploadUrl, {validateUpload:financierChassisDetailsObj});
  }  

  exportAmcEwClaims(amcAndEwClaimInputObj): Observable<Blob>{
    return this.http.post<Blob>(APIConstants.amcEwClaimsDashboardExportUrl, amcAndEwClaimInputObj, {responseType: 'blob' as 'json'});
  }

  getAmcEwClaimsDashboard(amcAndEwClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.amcEwClaimsDashboardUrl, amcAndEwClaimInputObj);
  }

  getDealerConfirmationAudit(claim_Id: string): Observable<any> {
    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      params: { 'claimId': '' }
    };
    
    httpOptions.params.claimId = claim_Id;
    
    return this.http.get<any>(APIConstants.dealerConfirmationAuditUrl, httpOptions)
  }

  getFinancierAmount(financierInputObj):Observable<any>{
    return this.http.get<string>(APIConstants.financierAmountUrl, {params:financierInputObj});
  } 
 
  getZone(zoneInputObj: any): Observable<any>{
    return this.http.post<any>(APIConstants.zoneGetUrl, zoneInputObj);
  }

  getRegion(regionInputObj: any): Observable<any>{
    return this.http.post<any>(APIConstants.regionGetUrl, regionInputObj);
  }

  getArea(areaInputObj: any): Observable<any>{
    return this.http.post<any>(APIConstants.areaGetUrl, areaInputObj);
  }

  getState(stateInputObj: any): Observable<any>{
    return this.http.post<any>(APIConstants.stateGetUrl, stateInputObj);
  }

  getDealer(dealerInputObj: any): Observable<any>{
    return this.http.post<any>(APIConstants.dealerGetUrl, dealerInputObj);
  }

  getLOB(lobInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.lobGetUrl, lobInputObj);
  }

  getPPL(lobArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.pplGetUrl, lobArray);
  }

  getPL(pplArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.plGetUrl, pplArray);
  }

  getVC(plArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.vcGetUrl, plArray);
  }

  getAmcLOB(lobInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.lobAmcGetUrl, lobInputObj);
  }

  getAmcPPL(lobArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.pplAmcGetUrl, lobArray);
  }

  getAmcPL(pplArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.plAmcGetUrl, pplArray);
  }

  getAmcVC(plArray: Array<string>): Observable<any>{
    return this.http.post<any>(APIConstants.vcAmcGetUrl, plArray);
  }

  getClaimValidityExpiryIndividualClaims(individualClaimInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.claimValidityExpiryIndividualGetUrl, individualClaimInputObj);
  }

  getClaimValidityExpiryGroupClaims(groupClaimInputObj): Observable<any>{
    return this.http.post<any>(APIConstants.claimValidityExpiryGroupGetUrl, groupClaimInputObj);
  }
  
  putClaimValidityExpiryIndividualClaims(individualClaimInputObj): Observable<any>{
    return this.http.put<any>(APIConstants.claimValidityExpiryIndividualPutUrl, individualClaimInputObj);
  }

  putClaimValidityExpiryGroupClaims(groupClaimInputObj): Observable<any>{
    return this.http.put<any>(APIConstants.claimValidityExpiryGroupPutUrl, groupClaimInputObj);
  }

  getLoyaltyDetails(loyaltyObj):Observable<any>{
    return this.http.get<any>(APIConstants.loyaltyDetailsUrl,{params:loyaltyObj})
  }

  // getIndividualClaim(beneIndividualClaimInputObj):Observable<any>{
  //   return this.http.get<any>(APIConstants.individualClaimURL,{params:beneIndividualClaimInputObj})
  // }

  // getGroupClaim(beneGroupClaimInputObj):Observable<any>{
  //   return this.http.get<any>(APIConstants.groupClaimURL,{params:beneGroupClaimInputObj})
  // }

  getExchangeVerification(exchangeInputObj):Observable<any>{
    return this.http.get<string>(APIConstants.exchangeVerificationUrl,{params:exchangeInputObj})
  }

  getExchangeDetails(exchangeInputObj):Observable<any>{
    return this.http.get<string>(APIConstants.exchangeDetailsUrl,{params:exchangeInputObj});
  } 


  getIndividualBlockingClaims(individualClaimInputObj): Observable<any>{
    return this.http.post<string>(APIConstants.individualBlockingClaimsDashboardUrl, individualClaimInputObj);
  }

 getGroupBlockingClaims(groupClaimInputObj): Observable<any>{
  return this.http.post<string>(APIConstants.groupBlockingClaimsDashboardUrl, groupClaimInputObj);
 }

 getCriteriaBlockingClaims(criteriaClaimInputObj): Observable<any>{
  return this.http.post<string>(APIConstants.criteriaBlockingClaimsDashboardUrl,criteriaClaimInputObj);
 }

 postIndividualClaims(individualClaimInputObject): Observable<any>{
  return this.http.post<any>(APIConstants.individualBlockClaimPostUrl, individualClaimInputObject);
 }

 postGroupClaims(groupClaimInputObject): Observable<any>{
  return this.http.post<any>(APIConstants.groupBlockClaimPostUrl, groupClaimInputObject);
 }

 putCriteriaClaims(criteriaInputObj): Observable<any>{
  return this.http.put<any>(APIConstants.blockCriteriaPutUrl, criteriaInputObj);
 }

 updateBlockCriteriaData(blockCriteriaObj): Observable<any>{
  return this.http.post<any>(APIConstants.blockCriteriaPostUrl, blockCriteriaObj );
 }

 rejectHoldloadData(rejectHoldFile: File,claimType:string): Observable<any> { //,claimType:string
  var formData = new FormData();
  formData.append('file', rejectHoldFile);
  formData.append('templateType', claimType);

  return this.http.post<any>(APIConstants.rejectHoldUploadUrl, formData);
}

rejectHoldScheduledUpload(File:File,claimType:string): Observable<any>{          
  const formData: FormData = new FormData();
  formData.append('file', File);
  formData.append('claimType',claimType);
 
  return this.http.post<any>( APIConstants.rejectHoldScheduleUploaderUrl, formData);   
}

getRejectHoldBatchUploadedClaimsSearch(params: any): Observable<any>{
  const httpOptions = {
    headers: { 'Content-Type': 'application/json' },
    params: params
  };

  return this.http.get<any>(APIConstants.rejectholdbatchschUrl, httpOptions);
}

exportHoldUnholdRejectClaims(exportToExcelInputParams: HttpParams): Observable<Blob>{
   return this.http.get<Blob>(APIConstants.holdUnholRejectClaimsDashboardExportUrl, { params: exportToExcelInputParams, responseType: 'blob' as 'json' });
}

updateBeneIndividualClaimCustody(individualClaimDetailsInputObj): Observable<any>{
  return this.http.post<any>(APIConstants.postBeneIndividualClaimCustodyUrl, individualClaimDetailsInputObj);
}

postBeneGroupClaims(groupClaimInputObject): Observable<any>{
  return this.http.post<any>(APIConstants.groupCreationUrl, groupClaimInputObject);
 }
}
