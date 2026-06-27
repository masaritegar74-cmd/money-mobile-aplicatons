import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Transaction, Note } from './types';

interface AppStateContextType {
	tasks: Task[];
	transactions: Transaction[];
	notes: Note[];
	addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'> & { note?: string }) => void;
	toggleTask: (id: string) => void;
	deleteTask: (id: string) => void;
	addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
	deleteTransaction: (id: string) => void;
	addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
	updateNote: (id: string, updates: Partial<Note>) => void;
	deleteNote: (id: string) => void;
	clearAllData: () => Promise<void>;
	seedDemoData: () => void;
	isLoading: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEYS = {
	TASKS: 'OMNIHUB_TASKS_DATA',
	TRANSACTIONS: 'OMNIHUB_TX_DATA',
	NOTES: 'OMNIHUB_NOTES_DATA',
};

// Colors for notes
export const NOTE_COLORS = [
	{ name: 'Amber Glow', hex: '#fef3c7' },
	{ name: 'Mint Fresh', hex: '#ecfdf5' },
	{ name: 'Sky Breeze', hex: '#e0f2fe' },
	{ name: 'Lavender Mist', hex: '#f3e8ff' },
	{ name: 'Rose Petal', hex: '#ffe4e6' },
	{ name: 'Classic Slate', hex: '#f1f5f9' },
];

const DEFAULT_TASKS: Task[] = [
	{
		id: 'task-1',
		title: 'Launch Expo application preview',
		note: 'Check performance on web and test tilt game physics',
		category: 'Work',
		priority: 'high',
		completed: false,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'task-2',
		title: 'Organic groceries pickup',
		note: 'Spinach, almond milk, avocados, free-range eggs, dark roast coffee beans',
		category: 'Shopping',
		priority: 'medium',
		completed: false,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'task-3',
		title: 'Morning mindfulness & run',
		note: '30-minute steady-state run followed by 10 minutes of box breathing',
		category: 'Health',
		priority: 'low',
		completed: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'task-4',
		title: 'Resolve React Native warning',
		note: 'Review dynamic style allocation and test layout shifts on smaller layouts',
		category: 'Urgent',
		priority: 'high',
		completed: false,
		createdAt: new Date().toISOString(),
	},
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
	{
		id: 'tx-1',
		title: 'Freelance UI/UX Payment',
		amount: 2850.0,
		type: 'income',
		category: 'Salary',
		date: new Date(Date.now() - 3600000 * 24).toISOString(),
	},
	{
		id: 'tx-2',
		title: 'Whole Foods Groceries',
		amount: 142.3,
		type: 'expense',
		category: 'Food',
		date: new Date(Date.now() - 3600000 * 12).toISOString(),
	},
	{
		id: 'tx-3',
		title: 'Rideshare Uber to Downtown',
		amount: 24.5,
		type: 'expense',
		category: 'Transport',
		date: new Date(Date.now() - 3600000 * 8).toISOString(),
	},
	{
		id: 'tx-4',
		title: 'GitHub Copilot Subscription',
		amount: 10.0,
		type: 'expense',
		category: 'Utilities',
		date: new Date(Date.now() - 3600000 * 6).toISOString(),
	},
	{
		id: 'tx-5',
		title: 'Vercel Pro Plan Team Fee',
		amount: 20.0,
		type: 'expense',
		category: 'Utilities',
		date: new Date(Date.now() - 3600000 * 2).toISOString(),
	},
];

const DEFAULT_NOTES: Note[] = [
	{
		id: 'note-1',
		title: '💡 App Showcase Architecture',
		content: 'We are building a highly-responsive React Native + Expo App showcase, featuring direct style layout hooks, custom touch simulations, persistent key-value store, and dynamic visual presets.',
		color: '#fef3c7',
		favorite: true,
		updatedAt: new Date().toISOString(),
	},
	{
		id: 'note-2',
		title: '🎯 Life Philosophy',
		content: '1. Keep things simple, fast, and responsive.\n2. Continuous iteration yields perfection.\n3. Make beautiful and elegant user-facing indicators.',
		color: '#ecfdf5',
		favorite: false,
		updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
	},
	{
		id: 'note-3',
		title: '🛍️ Gadget Wishlist',
		content: '- Apple Watch Ultra 2\n- Keychron Q1 Max mechanical keyboard\n- Sony WH-1000XM5 headphones\n- Herman Miller Embody chair',
		color: '#e0f2fe',
		favorite: false,
		updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
	},
];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const loadData = async () => {
			try {
				const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
				const storedTxs = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
				const storedNotes = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);

				if (storedTasks) {
					setTasks(JSON.parse(storedTasks));
				} else {
					setTasks(DEFAULT_TASKS);
					await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
				}

				if (storedTxs) {
					setTransactions(JSON.parse(storedTxs));
				} else {
					setTransactions(DEFAULT_TRANSACTIONS);
					await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
				}

				if (storedNotes) {
					setNotes(JSON.parse(storedNotes));
				} else {
					setNotes(DEFAULT_NOTES);
					await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
				}
			} catch (e) {
				console.error('Failed to load application data', e);
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, []);

	// Save triggers
	const saveTasks = async (newTasks: Task[]) => {
		setTasks(newTasks);
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
		} catch (e) {
			console.error(e);
		}
	};

	const saveTransactions = async (newTxs: Transaction[]) => {
		setTransactions(newTxs);
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTxs));
		} catch (e) {
			console.error(e);
		}
	};

	const saveNotes = async (newNotes: Note[]) => {
		setNotes(newNotes);
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
		} catch (e) {
			console.error(e);
		}
	};

	// CRUD - Tasks
	const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'> & { note?: string }) => {
		const newTask: Task = {
			...task,
			id: `task-${Date.now()}`,
			completed: false,
			createdAt: new Date().toISOString(),
		};
		saveTasks([newTask, ...tasks]);
	};

	const toggleTask = (id: string) => {
		const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
		saveTasks(updated);
	};

	const deleteTask = (id: string) => {
		const updated = tasks.filter((t) => t.id !== id);
		saveTasks(updated);
	};

	// CRUD - Transactions
	const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
		const newTx: Transaction = {
			...tx,
			id: `tx-${Date.now()}`,
			date: new Date().toISOString(),
		};
		saveTransactions([newTx, ...transactions]);
	};

	const deleteTransaction = (id: string) => {
		const updated = transactions.filter((t) => t.id !== id);
		saveTransactions(updated);
	};

	// CRUD - Notes
	const addNote = (note: Omit<Note, 'id' | 'updatedAt'>) => {
		const newNote: Note = {
			...note,
			id: `note-${Date.now()}`,
			updatedAt: new Date().toISOString(),
		};
		saveNotes([newNote, ...notes]);
	};

	const updateNote = (id: string, updates: Partial<Note>) => {
		const updated = notes.map((n) =>
			n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
		);
		saveNotes(updated);
	};

	const deleteNote = (id: string) => {
		const updated = notes.filter((n) => n.id !== id);
		saveNotes(updated);
	};

	// Utility operations
	const clearAllData = async () => {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.TASKS);
			await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
			await AsyncStorage.removeItem(STORAGE_KEYS.NOTES);
			setTasks([]);
			setTransactions([]);
			setNotes([]);
		} catch (e) {
			console.error(e);
		}
	};

	const seedDemoData = () => {
		saveTasks(DEFAULT_TASKS);
		saveTransactions(DEFAULT_TRANSACTIONS);
		saveNotes(DEFAULT_NOTES);
	};

	return (
		<AppStateContext.Provider
			value={{
				tasks,
				transactions,
				notes,
				addTask,
				toggleTask,
				deleteTask,
				addTransaction,
				deleteTransaction,
				addNote,
				updateNote,
				deleteNote,
				clearAllData,
				seedDemoData,
				isLoading,
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => {
	const context = useContext(AppStateContext);
	if (!context) {
		throw new Error('useAppState must be used within an AppStateProvider');
	}
	return context;
};
