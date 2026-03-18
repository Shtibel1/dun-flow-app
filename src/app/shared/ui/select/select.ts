import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option } from '../../../core/models/option';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-select',
  imports: [MatSelectModule, ReactiveFormsModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  @Input({required: true}) label!: string;
  @Input({required: true}) options!: Option<any>[];
  @Input({required: true}) control!: FormControl<any | null>;
}
