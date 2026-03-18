import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CustomInput } from '../../../../shared/ui/custom-input/custom-input';
import { TextArea } from '../../../../shared/ui/text-area/text-area';
import { FormField } from '../../models/form-field';

@Component({
  selector: 'app-dynamic-task-form',
  imports: [CommonModule, ReactiveFormsModule, CustomInput, TextArea],
  templateUrl: './dynamic-task-form.html',
  styleUrl: './dynamic-task-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicTaskForm implements OnChanges {
  @Input() fields: FormField[] = [];
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() initialValuesJson: string = '{}';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['formGroup'] || changes['initialValuesJson']) {
      this.syncControls();
    }
  }

  getInputType(controlType: FormField['controlType']): 'text' | 'number' | 'url' {
    const types: Record<string, 'number' | 'url'> = { number: 'number', url: 'url' };
    return types[controlType] ?? 'text';
  }

  hasControl(key: string): boolean {
    return this.formGroup.contains(key);
  }

  getCustomFieldControl(key: string): FormControl {
    return this.formGroup.get(key) as FormControl;
  }

  private syncControls(): void {
    let parsedJson: Record<string, any> = {};
    try {
      parsedJson = JSON.parse(this.initialValuesJson || '{}');
    } catch {
      parsedJson = {};
    }

    Object.keys(this.formGroup.controls).forEach((key) => this.formGroup.removeControl(key));

    this.fields.forEach((field) => {
      const value = parsedJson[field.key] ?? field.value ?? null;
      const normalized = typeof value === 'string' || typeof value === 'number' ? value : null;

      this.formGroup.addControl(
        field.key,
        new FormControl(
          normalized,
          field.isRequired ? { validators: [Validators.required] } : undefined,
        ),
      );
    });
  }
}
