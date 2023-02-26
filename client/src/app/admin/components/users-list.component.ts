import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, switchMap } from 'rxjs';

import { User } from '../../authentication/interfaces/user.interface';
import { ConfirmDialogComponent } from '../../shared/components/dialog/dialog.component';
import { UsersService } from '../services/users.service';

@UntilDestroy()
@Component({
  selector: 'mean-users-list',
  templateUrl: 'users-list.component.html',
  styleUrls: ['users-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  isLoading = false;
  displayedColumns: string[] = ['email', 'username', 'isActivated', 'isBanned', 'roles', 'ban', 'delete'];

  constructor(private usersService: UsersService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersService
      .getUsers()
      .pipe(untilDestroyed(this))
      .subscribe(users => (this.dataSource = new MatTableDataSource(users)));
  }

  banUser(user: User): void {
    this.usersService
      .banUser(user.id)
      .pipe(
        switchMap(() => this.usersService.getUsers()),
        untilDestroyed(this)
      )
      .subscribe(() => this.usersService.getUsers());
  }

  openConfirmDialog(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this user?' },
    });

    dialogRef
      .afterClosed()
      .pipe(
        untilDestroyed(this),
        switchMap(result => {
          if (result) {
            return this.usersService.deleteUser(user.id);
          }
          return EMPTY;
        })
      )
      .subscribe(() => this.getUsers());
  }
}
