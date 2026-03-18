export interface TaskType {
	typeValue: number;
	taskType: string;
	finalStatus: number;
	statuses: TaskStatus[];
}

export interface TaskStatus {
	statusValue: number;
	displayName: string;
}
