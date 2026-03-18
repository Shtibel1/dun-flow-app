export interface FormField {
  key: string;
  label: string;
  controlType: 'text' | 'number' | 'textarea' | 'url';
  isRequired: boolean;
  value?: any;
}