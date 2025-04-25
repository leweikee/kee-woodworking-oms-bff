import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-listing',
  standalone: true,
  imports: [NzTableModule, NzIconModule, NzGridModule, NzSpaceModule, CommonModule],
  templateUrl: './user-listing.component.html',
  styleUrl: './user-listing.component.scss'
})
export class UserListingComponent implements OnInit, OnDestroy {
  public columns: { field: string; header: string }[] = [];
  public userList: any = [];

  public totalCount = 20; //public totalCount: number;
  public count = 10;
  private skip = 0;

  private destroy$ = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
    this.columns = this.getColumns();
  }

  getColumns() {
    return [
      { field: 'EMPLOYEE_NAME', header: 'Full Name' },
      { field: 'USER_NAME', header: 'Username' },
      { field: 'EMAIL_ADDRESS', header: 'Email' },
      { field: 'PHONE_NO', header: 'Phone No' },
      { field: 'ROLE_DESC', header: 'Role' },
      { field: 'EMPLOYEE_NO', header: 'Staff Id' },
      { field: 'EMPLOYEE_NO', header: 'Admin Id' },
    ]
  }

  // confirmDelete(selectedItem: any) {
  //   if (selectedItem) {
  //     this.selectedItem = selectedItem;
  //     this.confirmToastService.showConfirm(this.configService.configs.toast.confirmComplete);
  //     this.confirmSubscription = this.confirmToastService
  //       .getMessageObs().subscribe(resp => {
  //         if (resp) {
  //           this.delete();
  //         }
  //         setTimeout(() => {
  //           if (this.confirmSubscription) {
  //             this.confirmSubscription.unsubscribe();
  //           }
  //         });
  //       }, err => {
  //         this.logger.logError(err);
  //       });
  //   }
  // }

  // delete() {
  //   this.spinnerService.toggle(true);
  //   const obj = {
  //     ...this.selectedItem,
  //     IS_DELETED: true,
  //     LAST_UPDATED_BY: this.loggedInUser.EMPLOYEE_ID
  //   };
  //   this.sustainabilityService.deleteSustainability({ SUSTAINABILITY: obj })
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe((resp: any) => {
  //       if (this.utility.validateReturnResult(resp)) {
  //         this.spinnerService.toggle(false);
  //         this.messageService.add(this.config.toast.invalidRequest);
  //       } else {
  //         this.fetchData();
  //         this.messageService.add(this.config.toast.update);
  //       }
  //     }, () => {
  //       this.spinnerService.toggle(false);
  //       this.messageService.add(this.config.toast.exception);
  //     });
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
