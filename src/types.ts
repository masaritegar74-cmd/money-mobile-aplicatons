export interface Task {
	id: string;
	title: string;
	note?: string;
	category: 'Work' | 'Personal' | 'Health' | 'Urgent' | 'Shopping' | 'Other';
	priority: 'low' | 'medium' | 'high';
	completed: boolean;
	createdAt: string;
}

export interface Transaction {
	id: string;
	title: string;
	amount: number;
	type: 'income' | 'expense';
	category: 'Food' | 'Transport' | 'Salary' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Other';
	date: string;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	color: string; // Background tint class/hex
	favorite: boolean;
	updatedAt: string;
}

export type ActiveTab = 'dashboard' | 'tasks' | 'expenses' | 'notes' | 'playground' | 'settings';
