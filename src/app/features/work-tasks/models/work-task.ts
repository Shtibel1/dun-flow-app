export interface WorkTask {
	id: number;
	title: string;
	workTaskTypeId: number;
	workTaskTypeName: string;
	currentStatus: number;
	isClosed: boolean;
	assignedUserId: number;
}

export interface WorkTaskDetails extends WorkTask {
	customFieldsJson: string | null;
	createdAt: string;
	canBeClosed: boolean;
}
