import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-custom-input',
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './custom-input.html',
  styleUrl: './custom-input.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInput {
  @Input({required: true}) control!: FormControl;
  @Input({required: true}) label!: string;
  @Input() type: 'text' | 'number' | 'url' = 'text';
}
