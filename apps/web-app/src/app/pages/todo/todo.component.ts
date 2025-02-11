import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Domain } from '@product-domain/task';

import {
  TaskComponent,
  FormTaskComponent,
  EditModalComponent,
} from './components';
import { CONSTANTS } from '../../shared/constants';
import { TaskService } from '../../core/services/task.service';

type Task = Domain.Task;
type TaskCreateInput = Domain.TaskCreateInput;

const Components = [FormTaskComponent, TaskComponent, EditModalComponent];
@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, ...Components],
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
})
export class AppToDoComponent implements OnInit {
  tasks: Task[] = [];
  taskEditMode = false;
  taskToEdit = {} as Task;

  constructor(
    private readonly taskService: TaskService,
    private readonly router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const setTasks = ({ tasks }: { tasks: Task[] }) => {
      this.tasks = tasks;
    };

    firstValueFrom(this.taskService.getAllTask())
      .then(setTasks)
      .catch(this.showToastError);
  }

  showToastError(error: Error) {
    this.toastr.error(error.message);
  }

  addTask(task: TaskCreateInput) {
    firstValueFrom(this.taskService.createTask(task))
      .then((response) => {
        return this.tasks.unshift(response.task);
      })
      .catch(this.showToastError);
  }

  editTask(task: Task) {
    firstValueFrom(this.taskService.updateTask(task.id, task))
      .then(() => {
        const index = this.tasks.findIndex((t) => t.id === task.id);
        this.tasks = this.tasks
          .slice(0, index)
          .concat([task])
          .concat(this.tasks.slice(index + 1));
      })
      .catch(this.showToastError);

    this.taskEditMode = false;
  }

  toggleChecked({ id, checked }: { id: string; checked: boolean }) {
    firstValueFrom(this.taskService.updateTask(id, { checked }))
      .then(() => {
        const index = this.tasks.findIndex((task) => task.id === id);
        const taskToggle = { ...this.tasks[index], checked };
        this.tasks = this.tasks
          .slice(0, index)
          .concat([taskToggle])
          .concat(this.tasks.slice(index + 1));
      })
      .catch(this.showToastError);
  }

  deleteTask(id: string) {
    firstValueFrom(this.taskService.deleteTask(id))
      .then(() => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
      })
      .catch(console.error);
  }

  onHandleTaskEdit(task: Task) {
    this.taskToEdit = task;
    this.taskEditMode = true;
  }

  onHandleEndTaskEdit(val: boolean) {
    this.taskEditMode = val;
  }

  onHandleLogout() {
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE.TOKEN);
    this.router.navigate([CONSTANTS.ROUTES.AUTH]);
  }
}
