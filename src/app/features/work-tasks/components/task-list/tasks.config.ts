import { Column } from '../../../../core/models/column';
import { WorkTask } from '../../models/work-task';

export const TasksConfig: Column[] = [
  {
    ref: 'id',
    label: 'id',
    value: (element: WorkTask) => `${element.id}`,
  },
  {
    ref: 'title',
    label: 'title',
    value: (element: WorkTask) => `${element.title}`,
  },
  {
    ref: 'workTaskTypeName',
    label: 'type',
    value: (element: WorkTask) => `${element.workTaskTypeName}`,
  },
];
