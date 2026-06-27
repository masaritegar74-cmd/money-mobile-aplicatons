import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useAppTheme } from '../src/themeContext';
import { AppStateProvider, useAppState } from '../src/appStateContext';
import { ActiveTab } from '../src/types';

// Components
import { Dashboard } from '../src/components/Dashboard';
import { TaskManager } from '../src/components/TaskManager';
import { ExpenseTracker } from '../src/components/ExpenseTracker';
import { NoteWriter } from '../src/components/NoteWriter';
import { NativePlayground } from '../src/components/NativePlayground';
import { Settings } from '../src/components/Settings';

// Icons
import { 
	LayoutGrid, 
	CheckSquare, 
	DollarSign, 
	FileText, 
	Zap, 
	Settings as SettingsIcon 
} from 'lucide-react-native';

const OmniHubMainContent: React.FC = () => {
	const { colors, themeMode } = useAppTheme();
	const { isLoading } = useAppState();
	const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

	// Sub-form deep linking from dashboard quick actions
	const [forceTaskForm, setForceTaskForm] = useState(false);
	const [forceExpenseForm, setForceExpenseForm] = useState(false);
	const [forceNoteForm, setForceNoteForm] = useState(false);

	const handleQuickAction = (action: 'add-task' | 'add-expense' | 'add-note') => {
		if (action === 'add-task') {
			setForceTaskForm(true);
			setActiveTab('tasks');
		} else if (action === 'add-expense') {
			setForceExpenseForm(true);
			setActiveTab('expenses');
		} else if (action === 'add-note') {
			setForceNoteForm(true);
			setActiveTab('notes');
		}
	};

	if (isLoading) {
		return (
			<View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={[styles.loadingText, { color: colors.textMuted }]}>
					Booting OmniHub Persistent Memory...
				</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
			{/* Hide default stack header to enable our beautiful personalized headers */}
			<Stack.Screen options={{ headerShown: false }} />

			{/* Main active view switcher */}
			<View style={styles.viewContainer}>
				{activeTab === 'dashboard' && (
					<Dashboard 
						setActiveTab={setActiveTab} 
						onQuickAction={handleQuickAction} 
					/>
				)}
				{activeTab === 'tasks' && (
					<TaskManager 
						forceShowAddForm={forceTaskForm} 
						onFormHandled={() => setForceTaskForm(false)} 
					/>
				)}
				{activeTab === 'expenses' && (
					<ExpenseTracker 
						forceShowAddForm={forceExpenseForm} 
						onFormHandled={() => setForceExpenseForm(false)} 
					/>
				)}
				{activeTab === 'notes' && (
					<NoteWriter 
						forceShowAddForm={forceNoteForm} 
						onFormHandled={() => setForceNoteForm(false)} 
					/>
				)}
				{activeTab === 'playground' && <NativePlayground />}
				{activeTab === 'settings' && <Settings />}
			</View>

			{/* BOTTOM TAB DOCK */}
			<View style={[styles.dockContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
				<View style={styles.dockInner}>
					{/* Dashboard Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('dashboard');
							setForceTaskForm(false);
							setForceExpenseForm(false);
							setForceNoteForm(false);
						}}
					>
						<LayoutGrid 
							size={20} 
							color={activeTab === 'dashboard' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'dashboard' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'dashboard' ? colors.primary : colors.textMuted },
							activeTab === 'dashboard' && styles.dockLabelActive
						]}>
							Home
						</Text>
					</Pressable>

					{/* Tasks Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('tasks');
							setForceExpenseForm(false);
							setForceNoteForm(false);
						}}
					>
						<CheckSquare 
							size={20} 
							color={activeTab === 'tasks' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'tasks' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'tasks' ? colors.primary : colors.textMuted },
							activeTab === 'tasks' && styles.dockLabelActive
						]}>
							Tasks
						</Text>
					</Pressable>

					{/* Expenses Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('expenses');
							setForceTaskForm(false);
							setForceNoteForm(false);
						}}
					>
						<DollarSign 
							size={20} 
							color={activeTab === 'expenses' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'expenses' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'expenses' ? colors.primary : colors.textMuted },
							activeTab === 'expenses' && styles.dockLabelActive
						]}>
							Budget
						</Text>
					</Pressable>

					{/* Notes Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('notes');
							setForceTaskForm(false);
							setForceExpenseForm(false);
						}}
					>
						<FileText 
							size={20} 
							color={activeTab === 'notes' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'notes' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'notes' ? colors.primary : colors.textMuted },
							activeTab === 'notes' && styles.dockLabelActive
						]}>
							Notes
						</Text>
					</Pressable>

					{/* Playground Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('playground');
							setForceTaskForm(false);
							setForceExpenseForm(false);
							setForceNoteForm(false);
						}}
					>
						<Zap 
							size={20} 
							color={activeTab === 'playground' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'playground' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'playground' ? colors.primary : colors.textMuted },
							activeTab === 'playground' && styles.dockLabelActive
						]}>
							Devices
						</Text>
					</Pressable>

					{/* Settings Tab */}
					<Pressable 
						style={styles.dockItem} 
						onPress={() => {
							setActiveTab('settings');
							setForceTaskForm(false);
							setForceExpenseForm(false);
							setForceNoteForm(false);
						}}
					>
						<SettingsIcon 
							size={20} 
							color={activeTab === 'settings' ? colors.primary : colors.textMuted} 
							strokeWidth={activeTab === 'settings' ? 2.5 : 2}
						/>
						<Text style={[
							styles.dockLabel, 
							{ color: activeTab === 'settings' ? colors.primary : colors.textMuted },
							activeTab === 'settings' && styles.dockLabelActive
						]}>
							Settings
						</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default function HomeScreen() {
	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<AppStateProvider>
					<OmniHubMainContent />
				</AppStateProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	loadingScreen: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	loadingText: {
		fontSize: 13,
		fontWeight: '600',
	},
	viewContainer: {
		flex: 1,
	},
	dockContainer: {
		height: Platform.OS === 'ios' ? 68 : 60,
		borderTopWidth: 1,
		paddingTop: 8,
		paddingBottom: Platform.OS === 'ios' ? 12 : 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.03,
		shadowRadius: 6,
		elevation: 10,
	},
	dockInner: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		height: '100%',
	},
	dockItem: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	dockLabel: {
		fontSize: 10,
		fontWeight: '500',
		marginTop: 4,
	},
	dockLabelActive: {
		fontWeight: '700',
	},
});
