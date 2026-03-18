export interface CreateTaskRequest {
	title: string;
	description?: string | null;
	WorkTaskTypeId: number;
	assignedUserId?: number;
}

export interface ChangeStatusRequest {
	targetStatus: number;
	nextAssignedUserId: number;
	customFieldsJson: string;
}
