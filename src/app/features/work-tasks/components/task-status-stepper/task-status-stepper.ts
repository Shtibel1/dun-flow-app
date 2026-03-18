import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';

export interface TaskStatusStep {
  value: number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-task-status-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule],
  templateUrl: './task-status-stepper.html',
  styleUrl: './task-status-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusStepper {
  @Input({ required: true }) steps: ReadonlyArray<TaskStatusStep> = [];
  @Input() selectedStatus: number | null = null;
  @Input() canBeClosed = false;

  get selectedIndex(): number {
    if (this.selectedStatus === null) return 0;
    const idx = this.steps.findIndex((s) => s.value === this.selectedStatus);
    return idx >= 0 ? idx : 0;
  }

  isCompleted(statusValue: number): boolean {
    const lastStepValue = this.steps[this.steps.length - 1]?.value;
    if (this.canBeClosed && lastStepValue === statusValue) {
      return true;
    }

    return this.selectedStatus !== null && statusValue < this.selectedStatus;
  }

  isLocked(step: TaskStatusStep): boolean {
    return !!step.disabled;
  }
}
