import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';

import { User } from '../../authentication/interfaces/user.interface';
import { UsersService } from '../services/users.service';

@UntilDestroy()
@Component({
  selector: 'mean-users-list',
  templateUrl: 'users-list.component.html',
  styleUrls: ['users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  isLoading = false;
  displayedColumns: string[] = ['email', 'username', 'isActivated', 'isBanned', 'roles', 'ban', 'delete'];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersService
      .getUsers()
      .pipe(untilDestroyed(this))
      .subscribe(users => (console.log(users), (this.dataSource = new MatTableDataSource(users))));
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

  deleteUser(user: User): void {
    this.usersService
      .deleteUser(user.id)
      .pipe(
        switchMap(() => this.usersService.getUsers()),
        untilDestroyed(this)
      )
      .subscribe(() => this.usersService.getUsers());
  }
}
