import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Column } from '../../../core/models/column';

@Component({
  selector: 'app-table',
  imports: [MatPaginator, MatTableModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
  @Input({required: true}) dataSource!: MatTableDataSource<any>;
  @Input() displayedColumns: string[] = [];
  @Input() columns: Column[] = [];
  @Output() rowClick = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnInit(): void {
    this.initializeDisplayedColumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.initializeDataSource();
    }
  }

  ngAfterViewInit(): void {
    this.initializeDataSource();
  }

  onRow(row: any): void {
    this.rowClick.emit(row);
  }

  private initializeDisplayedColumns(): void {
    if (this.columns) {
      this.displayedColumns = this.columns.map((column) => column.ref);
    }
  }

  private initializeDataSource(): void {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
