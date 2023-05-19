import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from 'src/app/core/guard/auth-guard.service';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { ClaimDetailsComponent } from './claim-details/claim-details.component';
import { ClaimTabsComponent } from './claim-tabs/claim-tabs.component';
import { ClaimsDashboardComponent } from './claims-dashboard/claims-dashboard.component';
import { DocumentViewComponent } from './document-view/document-view.component';
import { DocumentsComponent } from './documents/documents.component';
import { OfflineClaimsComponent } from './offline-claims/offline-claims.component';
import { ChassisDetailsTabsViewComponent } from './chassis-details-tabs-view/chassis-details-tabs-view.component';
import { ClaimsHistoryComponent } from './claims-history/claims-history.component';
import { ConcessionBreakupComponent } from './concession-breakup/concession-breakup.component';
import { ConcessionTrackingComponent } from './concession-tracking/concession-tracking.component';
import { CreditNoteBreakupComponent } from './credit-note-breakup/credit-note-breakup.component';
import { OfftakeCancellationHistoryComponent } from './offtake-cancellation-history/offtake-cancellation-history.component';
import { RetailHistoryComponent } from './retail-history/retail-history.component';
import { ClaimTabsViewComponent } from './claim-tabs-view/claim-tabs-view.component';
import { GroupClaimViewTabComponent } from './group-claim-view-tab/group-claim-view-tab.component';
import { GroupClaimDetailsViewComponent } from './group-claim-details-view/group-claim-details-view.component';
import { GroupClaimDocumentsViewComponent } from './group-claim-documents-view/group-claim-documents-view.component';
import { GroupClaimActionHistoryComponent } from './group-claim-action-history/group-claim-action-history.component';
import { GroupClaimDetailsComponent } from './group-claim-details/group-claim-details.component';
import { AvailConcessionComponent } from './avail-concession/avail-concession.component';
import { CrmCreditAmountComponent } from './crm-credit-amount/crm-credit-amount.component';
import { ActualConcessionCrm } from './models/actual-concession-crm.model';
import { ActualConcessionCrmComponent } from './actual-concession-crm/actual-concession-crm.component';
import { BeneIndividualClaimsDashboardComponent } from './bene-individual-claims-dashboard/bene-individual-claims-dashboard.component';
import { BeneGroupClaimsDashboardComponent } from './bene-group-claims-dashboard/bene-group-claims-dashboard.component';
import { AvailableDiscountComponent } from './available-discount/available-discount.component';
import { GroupClaimTabComponent } from './group-claim-tab/group-claim-tab.component';
import { ClaimsDealerDashboardComponent } from './claims-dealer-dashboard/claims-dealer-dashboard.component';
import { ClaimDealerTabsComponent } from './claim-dealer-tabs/claim-dealer-tabs.component';
import { ClaimsBlockingComponent } from './claims-blocking/claims-blocking.component';
import { AmcEwDashboardComponent } from './amc-ew-dashboard/amc-ew-dashboard.component';
import { FinancierChassisDetailsUploadComponent } from './financier-chassis-details-upload/financier-chassis-details-upload.component';
import { ClaimValidityExpiryComponent } from './claim-validity-expiry/claim-validity-expiry.component';
import { GroupClaimApproverTabsComponent } from './group-claim-approver-tabs/group-claim-approver-tabs.component';
import { GroupClaimApproverViewTabsComponent } from './group-claim-approver-view-tabs/group-claim-approver-view-tabs.component';
import { RejectHoldComponent } from './reject-hold/reject-hold.component';

const routes: Routes = [
  {path: 'claimsdashboard', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER", "CLAIM_VIEWER"]}, component: ClaimsDashboardComponent},
  {path: 'claimsdealerdashboard', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "SM_SCHEME_VIEWER", "CLAIM_VIEWER"]}, component: ClaimsDealerDashboardComponent},
  {path: 'chassistabsview', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "CHASSIS_VIEWER"]}, component: ChassisDetailsTabsViewComponent },
  {path: 'claimshistory', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: ClaimsHistoryComponent},
  {path: 'retailhistory', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: RetailHistoryComponent},
  {path: 'offtakecancellationhistory', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: OfftakeCancellationHistoryComponent},
  {path: 'concessionbreakup', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: ConcessionBreakupComponent},
  {path: 'creditnotebreakup', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: CreditNoteBreakupComponent},
  {path: 'concessiontracking', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "SM_SCHEME_VIEWER"]}, component: ConcessionTrackingComponent},
  {path: 'claimdealertabs', canActivate: [AuthGuard], data: { roles: ["DSADMIN"]}, component: ClaimDealerTabsComponent},  
  {path: 'claimstabsview', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "CLAIM_VIEWER"]}, component: ClaimTabsViewComponent},
  {path: 'documentview', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]}, component: DocumentViewComponent},
  {path: 'document', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]}, component: DocumentsComponent},    
  {path: 'groupclaimtab', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "CLAIM_VIEWER"] }, component: GroupClaimTabComponent },
  {path: 'groupclaimviewtab', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "CLAIM_VIEWER"] }, component: GroupClaimViewTabComponent },
  {path: 'groupclaimapprovertab', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "CLAIM_VIEWER"] }, component: GroupClaimApproverTabsComponent },
  {path: 'groupclaimapproverviewtab', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM", "CLAIM_VIEWER"] }, component: GroupClaimApproverViewTabsComponent },
  {path: 'groupclaimdetailsview', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "SM_SCHEME_VIEWER"] }, component:GroupClaimDetailsViewComponent },
  {path: 'groupclaimdocumentsview', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"] }, component:  GroupClaimDocumentsViewComponent },
  {path: 'groupclaimactionhistoryview', canActivate: [AuthGuard], data: { roles: ["DSADMIN"] }, component:  GroupClaimActionHistoryComponent },
  {path: 'groupclaimdetails', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "SM_SCHEME_VIEWER"]},component:GroupClaimDetailsComponent },
  {path: 'offlineclaims', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER","GDC_MAKER","SM_SCHEME_VIEWER"]}, component: OfflineClaimsComponent},
  {path: 'availconcession', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]},component:AvailConcessionComponent},
  {path: 'crmcredit', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]},component:CrmCreditAmountComponent},
  {path: 'actualcrm', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]},component:ActualConcessionCrmComponent},
  {path: 'availabledisc', canActivate: [AuthGuard], data: { roles: ["DSADMIN", "GDC_APPROVER", "GDC_CHECKER", "GDC_FINANCE", "GDC_HOLD", "GDC_MAKER", "COMMERCIAL_CONTROLLER", "RSM", "RM", "TSM"]},component:AvailableDiscountComponent},
  {path: 'beneficiaryindividualdashboard', canActivate: [AuthGuard], data: { roles: ["DSE","DSM","TL","DSM","SM_SCHEME_VIEWER", "CHASSIS_VIEWER", "CLAIM_VIEWER"]}, component:BeneIndividualClaimsDashboardComponent},
  {path: 'beneficiarygroupdashboard', canActivate: [AuthGuard], data: { roles: ["GDC_MAKER","GDC_ADMIN"]}, component:BeneGroupClaimsDashboardComponent},
  {path: 'financierchassisupload', canActivate: [AuthGuard], data: { roles: ["GDC_FINANCE"]}, component: FinancierChassisDetailsUploadComponent},
  {path: 'amcewdashboard', canActivate: [AuthGuard], data: { roles: ["DSADMIN","GDC_Reports"]}, component:AmcEwDashboardComponent},
  {path: 'claimsblocking', canActivate: [AuthGuard], data: { roles: ["GDC_ADMIN"]},component:ClaimsBlockingComponent},
  {path: 'claimvalidityexpiry', canActivate: [AuthGuard], data: { roles: ["GDC_ADMIN", "SM_SCHEME_VIEWER", "CHASSIS_VIEWER", "CLAIM_VIEWER"]}, component: ClaimValidityExpiryComponent},
  {path: 'rejectholdunhold', canActivate: [AuthGuard], data: { roles: ["GDC_APPROVER", "GDC_FINANCE","SM_SCHEME_VIEWER","CHASSIS_VIEWER", "CLAIM_VIEWER"]}, component: RejectHoldComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
