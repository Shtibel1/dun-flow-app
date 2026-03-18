import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-area',
  imports: [MatInputModule, ReactiveFormsModule, CommonModule],
  templateUrl: './text-area.html',
  styleUrl: './text-area.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextArea {
  @Input({required: true}) control!: FormControl;
  @Input({required: true}) label!: string;
}
