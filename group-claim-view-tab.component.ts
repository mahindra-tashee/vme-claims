import { Component, OnInit, Type } from '@angular/core';
import { GroupClaimActionHistoryComponent } from '../group-claim-action-history/group-claim-action-history.component';
import { GroupClaimDetailsViewComponent } from '../group-claim-details-view/group-claim-details-view.component';
import { GroupClaimDocumentsViewComponent } from '../group-claim-documents-view/group-claim-documents-view.component';
import { GroupClaimDetails } from '../models/group-claim.model';

@Component({
  selector: 'app-group-claim-view-tab',
  templateUrl: './group-claim-view-tab.component.html',
  styleUrls: ['./group-claim-view-tab.component.scss']
})
export class GroupClaimViewTabComponent implements OnInit {
  groupClaimsDetailsViewLazyComp: Promise<Type<GroupClaimDetailsViewComponent>>;
  groupClaimsDocumentViewLazyComp: Promise<Type<GroupClaimDocumentsViewComponent>>;
  groupClaimActionHistoryLazyComp: Promise<Type<GroupClaimActionHistoryComponent>>;
  actionList: any;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.groupClaimsDetailsViewLazyComp = import('../group-claim-details-view/group-claim-details-view.component').then(({ GroupClaimDetailsViewComponent }) => GroupClaimDetailsViewComponent);
      this.groupClaimsDocumentViewLazyComp = import('../group-claim-documents-view/group-claim-documents-view.component').then(({ GroupClaimDocumentsViewComponent }) => GroupClaimDocumentsViewComponent);
      this.groupClaimActionHistoryLazyComp = import('../group-claim-action-history/group-claim-action-history.component').then(({ GroupClaimActionHistoryComponent }) => GroupClaimActionHistoryComponent);

      this.resetSteps();
    }, 0);
  }

  resetSteps(): void {
    $('.app-form').hide();
    $('.app-form.first-form').show();
    $('.step').removeClass('active');
    $('#first.step').addClass('active');

    $('.ui.mini.steps .step').click(function () {
      $('.ui.mini.steps .step').removeClass('active');
      $(this).addClass('active');
      var target = '.app-form.' + $(this).attr('id') + '-form';
      $('.app-form').hide();
      $(target).show();
    });
  }


}
