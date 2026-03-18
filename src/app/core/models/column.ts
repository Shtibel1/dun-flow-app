export interface Column {
  ref: string;
  label: string;
  value?: (element: any) => string;
}