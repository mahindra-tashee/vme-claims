import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';

import { KeycloakService } from './core/auth/keycloak.service';
import { AuthGuardService } from './core/guard/auth-guard.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SecuredHttpInterceptor } from './core/interceptor/secured-http.interceptor';

import { ToastModule } from "primeng/toast";
import { TableModule } from "primeng/table";
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SafePipe } from './pipes/safe.pipe';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClaimsDashboardComponent } from './claims-dashboard/claims-dashboard.component';
import { ClaimTabsComponent } from './claim-tabs/claim-tabs.component';
import { ClaimDetailsComponent } from './claim-details/claim-details.component';
import { DocumentsComponent } from './documents/documents.component';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { ClaimDetailsViewComponent } from './claim-details-view/claim-details-view.component';
import { ClaimTabsViewComponent } from './claim-tabs-view/claim-tabs-view.component';
import { DocumentViewComponent } from './document-view/document-view.component';
import { OfflineClaimsComponent } from './offline-claims/offline-claims.component';
import { ClaimsHistoryComponent } from './claims-history/claims-history.component';
import { RetailHistoryComponent } from './retail-history/retail-history.component';
import { OfftakeCancellationHistoryComponent } from './offtake-cancellation-history/offtake-cancellation-history.component';
import { ChassisDetailsTabsViewComponent } from './chassis-details-tabs-view/chassis-details-tabs-view.component';
import { CreditNoteBreakupComponent } from './credit-note-breakup/credit-note-breakup.component';
import { ConcessionTrackingComponent } from './concession-tracking/concession-tracking.component';
import { ConcessionBreakupComponent } from './concession-breakup/concession-breakup.component';
import { GroupClaimViewTabComponent } from './group-claim-view-tab/group-claim-view-tab.component';
import { GroupClaimDetailsViewComponent } from './group-claim-details-view/group-claim-details-view.component';
import { GroupClaimDocumentsViewComponent } from './group-claim-documents-view/group-claim-documents-view.component';
import { GroupClaimActionHistoryComponent } from './group-claim-action-history/group-claim-action-history.component';
import { GroupClaimTabComponent } from './group-claim-tab/group-claim-tab.component';
import { GroupClaimDetailsComponent } from './group-claim-details/group-claim-details.component';
import { GroupClaimDocumentsComponent } from './group-claim-documents/group-claim-documents.component';
import { ActualConcessionCrmComponent } from './actual-concession-crm/actual-concession-crm.component';
import { AvailConcessionComponent } from './avail-concession/avail-concession.component';
import { AvailableDiscountComponent } from './available-discount/available-discount.component';
import { CrmCreditAmountComponent } from './crm-credit-amount/crm-credit-amount.component';
import { BeneIndividualClaimsDashboardComponent } from './bene-individual-claims-dashboard/bene-individual-claims-dashboard.component';
import { BeneGroupClaimsDashboardComponent } from './bene-group-claims-dashboard/bene-group-claims-dashboard.component';
import { ClaimsDealerDashboardComponent } from './claims-dealer-dashboard/claims-dealer-dashboard.component';
import { ClaimDealerDetailsComponent } from './claim-dealer-details/claim-dealer-details.component';
import { ClaimDealerTabsComponent } from './claim-dealer-tabs/claim-dealer-tabs.component';
import { DealerDocumentsComponent } from './dealer-documents/dealer-documents.component';
import { GroupClaimApproverDetailsViewComponent } from './group-claim-approver-details-view/group-claim-approver-details-view.component';
import { GroupClaimApproverDocumentsViewComponent } from './group-claim-approver-documents-view/group-claim-approver-documents-view.component';
import { GroupClaimApproverViewTabsComponent } from './group-claim-approver-view-tabs/group-claim-approver-view-tabs.component';
import { ClaimDealerTabsViewComponent } from './claim-dealer-tabs-view/claim-dealer-tabs-view.component';
import { ClaimDealerDetailsViewComponent } from './claim-dealer-details-view/claim-dealer-details-view.component';
import { DealerDocumentsViewComponent } from './dealer-documents-view/dealer-documents-view.component';
import { GroupClaimApproverDetailsComponent } from './group-claim-approver-details/group-claim-approver-details.component';
import { GroupClaimApproverDocumentsComponent } from './group-claim-approver-documents/group-claim-approver-documents.component';
import { GroupClaimApproverTabsComponent } from './group-claim-approver-tabs/group-claim-approver-tabs.component';
import { AmcDetailsViewComponent } from './amc-details-view/amc-details-view.component';
import { EwDetailsViewComponent } from './ew-details-view/ew-details-view.component';
import { InsurancePolicyDetailsComponent } from './insurance-policy-details/insurance-policy-details.component';
import { NFADetailsViewComponent } from './nfadetails-view/nfadetails-view.component';
import { ClaimsBlockingComponent } from './claims-blocking/claims-blocking.component';
import { DealerConfirmationAuditComponent } from './dealer-confirmation-audit/dealer-confirmation-audit.component';
import { AmcEwDashboardComponent } from './amc-ew-dashboard/amc-ew-dashboard.component';
import { FinancierDetailsComponent } from './financier-details/financier-details.component';
import { FinancierChassisDetailsUploadComponent } from './financier-chassis-details-upload/financier-chassis-details-upload.component';
import { ClaimValidityExpiryComponent } from './claim-validity-expiry/claim-validity-expiry.component';
import { LoyaltyDetailsComponent } from './loyalty-details/loyalty-details.component';
import { ExchangeDetailsComponent } from './exchange-details/exchange-details.component';
import { RejectHoldComponent } from './reject-hold/reject-hold.component';

@NgModule({
  declarations: [
    AppComponent,
    ClaimsDashboardComponent,
    ClaimTabsComponent,
    ClaimDetailsComponent,
    DocumentsComponent,
    ActionHistoryComponent,
    ClaimDetailsViewComponent,
    ClaimTabsViewComponent,
    DocumentViewComponent,
    OfflineClaimsComponent,
    ClaimsHistoryComponent,
    RetailHistoryComponent,
    OfftakeCancellationHistoryComponent,
    ConcessionBreakupComponent,
    CreditNoteBreakupComponent,
    ConcessionTrackingComponent,
    ChassisDetailsTabsViewComponent,
    GroupClaimViewTabComponent,
    GroupClaimDetailsViewComponent,
    GroupClaimDocumentsViewComponent,
    GroupClaimActionHistoryComponent,
    GroupClaimTabComponent,
    GroupClaimDetailsComponent,
    GroupClaimDocumentsComponent,
    GroupClaimActionHistoryComponent,
    SafePipe,
    ActualConcessionCrmComponent,
    AvailConcessionComponent,
    AvailableDiscountComponent,
    CrmCreditAmountComponent,
    BeneIndividualClaimsDashboardComponent,
    BeneGroupClaimsDashboardComponent,
    ClaimsDealerDashboardComponent,
    ClaimDealerDetailsComponent,
    ClaimDealerTabsComponent,
    DealerDocumentsComponent,
    GroupClaimApproverDetailsViewComponent,
    GroupClaimApproverDocumentsViewComponent,
    GroupClaimApproverViewTabsComponent,
    ClaimDealerTabsViewComponent,
    ClaimDealerDetailsViewComponent,
    DealerDocumentsViewComponent,
    GroupClaimApproverDetailsComponent,
    GroupClaimApproverDocumentsComponent,
    GroupClaimApproverTabsComponent,
    AmcDetailsViewComponent,
    EwDetailsViewComponent,
    InsurancePolicyDetailsComponent,
    NFADetailsViewComponent,
    ClaimsBlockingComponent,
    DealerConfirmationAuditComponent,
    AmcEwDashboardComponent,
    FinancierDetailsComponent,
    FinancierChassisDetailsUploadComponent,
    ClaimValidityExpiryComponent,
    LoyaltyDetailsComponent,
    ExchangeDetailsComponent,
    RejectHoldComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastModule,
    TableModule,
    HttpClientModule,
    ConfirmDialogModule,
    DialogModule,
    ConfirmPopupModule,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
    TooltipModule
  ],
  providers: [
    DatePipe,
    MessageService,
    ConfirmationService,
    KeycloakService,
    AuthGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecuredHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
