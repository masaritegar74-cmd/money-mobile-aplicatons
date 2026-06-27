import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useAppState } from '../appStateContext';
import { useAppTheme } from '../themeContext';
import { 
	CheckSquare, 
	DollarSign, 
	FileText, 
	Plus, 
	ChevronRight, 
	TrendingUp, 
	TrendingDown, 
	Zap, 
	Sliders 
} from 'lucide-react-native';
import { ActiveTab } from '../types';

interface DashboardProps {
	setActiveTab: (tab: ActiveTab) => void;
	onQuickAction: (action: 'add-task' | 'add-expense' | 'add-note') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onQuickAction }) => {
	const { tasks, transactions, notes, toggleTask } = useAppState();
	const { colors, isDark } = useAppTheme();

	// Calculations
	const pendingTasks = tasks.filter((t) => !t.completed);
	const completedTasksCount = tasks.filter((t) => t.completed).length;
	const totalTasksCount = tasks.length;
	const taskCompletionRate = totalTasksCount > 0 ? completedTasksCount / totalTasksCount : 0;

	const totalIncome = transactions
		.filter((t) => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);
	const totalExpenses = transactions
		.filter((t) => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);
	const netBalance = totalIncome - totalExpenses;

	// Recent notes
	const favoriteNotes = notes.filter((n) => n.favorite);
	const displayNote = favoriteNotes.length > 0 ? favoriteNotes[0] : notes[0];

	// Formatting date
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning';
		if (hour < 18) return 'Good Afternoon';
		return 'Good Evening';
	};

	const formattedDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	});

	return (
		<ScrollView 
			style={[styles.container, { backgroundColor: colors.background }]} 
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}
		>
			{/* Greeting Header */}
			<View style={styles.header}>
				<View>
					<Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()}</Text>
					<Text style={[styles.title, { color: colors.text }]}>OmniHub Dashboard</Text>
				</View>
				<View style={[styles.dateBadge, { backgroundColor: colors.primarySoft }]}>
					<Text style={[styles.dateText, { color: colors.primary }]}>{formattedDate}</Text>
				</View>
			</View>

			{/* Balance & Financial Quick Summary Card */}
			<View style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<Text style={[styles.cardLabel, { color: colors.textMuted }]}>NET WALLET BALANCE</Text>
				<Text style={[styles.balanceText, { color: colors.text }]}>
					${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
				</Text>
				
				<View style={[styles.divider, { backgroundColor: colors.border }]} />

				<View style={styles.cashflowRow}>
					<View style={styles.cashflowCol}>
						<View style={styles.cashflowHeader}>
							<TrendingUp size={16} color={colors.success} style={styles.cashflowIcon} />
							<Text style={[styles.cashflowTitle, { color: colors.textMuted }]}>Income</Text>
						</View>
						<Text style={[styles.cashflowAmount, { color: colors.success }]}>
							+${totalIncome.toLocaleString('en-US', { maximumFractionDigits: 2 })}
						</Text>
					</View>

					<View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

					<View style={styles.cashflowCol}>
						<View style={styles.cashflowHeader}>
							<TrendingDown size={16} color={colors.error} style={styles.cashflowIcon} />
							<Text style={[styles.cashflowTitle, { color: colors.textMuted }]}>Expenses</Text>
						</View>
						<Text style={[styles.cashflowAmount, { color: colors.error }]}>
							-${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 2 })}
						</Text>
					</View>
				</View>
			</View>

			{/* Analytics Grid Row */}
			<View style={styles.gridRow}>
				{/* Task Progress */}
				<Pressable 
					style={[styles.halfCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => setActiveTab('tasks')}
				>
					<View style={styles.cardHeader}>
						<CheckSquare size={18} color={colors.primary} />
						<Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Tasks Done</Text>
					</View>
					<Text style={[styles.cardStat, { color: colors.text }]}>
						{completedTasksCount} / {totalTasksCount}
					</Text>
					{/* Progress bar */}
					<View style={styles.progressBarBg}>
						<View 
							style={[
								styles.progressBarFill, 
								{ backgroundColor: colors.primary, width: `${taskCompletionRate * 100}%` }
							]} 
						/>
					</View>
					<Text style={[styles.cardNote, { color: colors.textMuted }]}>
						{pendingTasks.length} pending items
					</Text>
				</Pressable>

				{/* Note Count & Quick View */}
				<Pressable 
					style={[styles.halfCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => setActiveTab('notes')}
				>
					<View style={styles.cardHeader}>
						<FileText size={18} color="#d97706" />
						<Text style={[styles.cardHeaderTitle, { color: colors.text }]}>Notes Save</Text>
					</View>
					<Text style={[styles.cardStat, { color: colors.text }]}>
						{notes.length} Drafts
					</Text>
					<Text style={[styles.cardSubText, { color: colors.textMuted }]} numberOfLines={2}>
						{displayNote ? `"${displayNote.title}"` : 'No notes written yet.'}
					</Text>
				</Pressable>
			</View>

			{/* Quick Action Suite */}
			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Assistant</Text>
			</View>

			<View style={styles.actionsContainer}>
				<Pressable 
					style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => onQuickAction('add-task')}
				>
					<View style={[styles.actionIconWrapper, { backgroundColor: colors.primarySoft }]}>
						<Plus size={20} color={colors.primary} />
					</View>
					<Text style={[styles.actionLabel, { color: colors.text }]}>New Task</Text>
				</Pressable>

				<Pressable 
					style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => onQuickAction('add-expense')}
				>
					<View style={[styles.actionIconWrapper, { backgroundColor: '#ecfdf5' }]}>
						<DollarSign size={20} color="#10b981" />
					</View>
					<Text style={[styles.actionLabel, { color: colors.text }]}>Add Expense</Text>
				</Pressable>

				<Pressable 
					style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => onQuickAction('add-note')}
				>
					<View style={[styles.actionIconWrapper, { backgroundColor: '#fef3c7' }]}>
						<FileText size={20} color="#d97706" />
					</View>
					<Text style={[styles.actionLabel, { color: colors.text }]}>Create Note</Text>
				</Pressable>

				<Pressable 
					style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					onPress={() => setActiveTab('playground')}
				>
					<View style={[styles.actionIconWrapper, { backgroundColor: '#ede9fe' }]}>
						<Zap size={20} color="#7c3aed" />
					</View>
					<Text style={[styles.actionLabel, { color: colors.text }]}>Tilt Game</Text>
				</Pressable>
			</View>

			{/* Urgent / Priority Tasks Section */}
			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>Priority Agenda</Text>
				<Pressable onPress={() => setActiveTab('tasks')} style={styles.seeAllBtn}>
					<Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
					<ChevronRight size={14} color={colors.primary} />
				</Pressable>
			</View>

			{pendingTasks.length === 0 ? (
				<View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<CheckSquare size={32} color={colors.textMuted} style={styles.emptyIcon} />
					<Text style={[styles.emptyText, { color: colors.text }]}>All clear! No pending priority tasks.</Text>
					<Text style={[styles.emptySubText, { color: colors.textMuted }]}>Create tasks to organize your schedule.</Text>
				</View>
			) : (
				<View style={styles.agendaList}>
					{pendingTasks.slice(0, 3).map((task) => (
						<Pressable
							key={task.id}
							style={[styles.agendaItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
							onPress={() => toggleTask(task.id)}
						>
							<View style={[styles.checkbox, { borderColor: colors.primary }]}>
								<View style={[styles.checkboxDot, { backgroundColor: 'transparent' }]} />
							</View>
							<View style={styles.agendaItemDetails}>
								<Text style={[styles.agendaItemTitle, { color: colors.text }]}>{task.title}</Text>
								<View style={styles.agendaItemMeta}>
									<View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
										<Text style={[styles.badgeText, { color: colors.primary }]}>{task.category}</Text>
									</View>
									<View 
										style={[
											styles.priorityDot, 
											{ 
												backgroundColor: 
													task.priority === 'high' 
														? colors.error 
														: task.priority === 'medium' 
														? colors.warning 
														: colors.textMuted 
											}
										]} 
									/>
									<Text style={[styles.priorityText, { color: colors.textMuted }]}>
										{task.priority.toUpperCase()}
									</Text>
								</View>
							</View>
						</Pressable>
					))}
				</View>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 30,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	greeting: {
		fontSize: 14,
		fontWeight: '500',
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		marginTop: 2,
	},
	dateBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	dateText: {
		fontSize: 12,
		fontWeight: '600',
	},
	mainCard: {
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	cardLabel: {
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 0.8,
		marginBottom: 4,
	},
	balanceText: {
		fontSize: 32,
		fontWeight: '800',
	},
	divider: {
		height: 1,
		marginVertical: 16,
	},
	cashflowRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	cashflowCol: {
		flex: 1,
	},
	cashflowHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	cashflowIcon: {
		marginRight: 4,
	},
	cashflowTitle: {
		fontSize: 12,
		fontWeight: '500',
	},
	cashflowAmount: {
		fontSize: 16,
		fontWeight: '700',
	},
	verticalDivider: {
		width: 1,
		height: 40,
		marginHorizontal: 16,
	},
	gridRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		gap: 12,
	},
	halfCard: {
		flex: 1,
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
		justifyContent: 'space-between',
		height: 125,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		shadowRadius: 4,
		elevation: 1,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	cardHeaderTitle: {
		fontSize: 12,
		fontWeight: '600',
	},
	cardStat: {
		fontSize: 20,
		fontWeight: '700',
		marginVertical: 4,
	},
	cardSubText: {
		fontSize: 11,
		lineHeight: 14,
	},
	progressBarBg: {
		height: 4,
		backgroundColor: '#e2e8f0',
		borderRadius: 2,
		marginVertical: 6,
		overflow: 'hidden',
	},
	progressBarFill: {
		height: '100%',
		borderRadius: 2,
	},
	cardNote: {
		fontSize: 10,
		fontWeight: '500',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	seeAllBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	seeAllText: {
		fontSize: 13,
		fontWeight: '600',
	},
	actionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		gap: 8,
	},
	actionBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 4,
		borderRadius: 12,
		borderWidth: 1,
	},
	actionIconWrapper: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 6,
	},
	actionLabel: {
		fontSize: 11,
		fontWeight: '600',
	},
	emptyCard: {
		padding: 24,
		borderRadius: 16,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyIcon: {
		marginBottom: 12,
		opacity: 0.6,
	},
	emptyText: {
		fontSize: 14,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 4,
	},
	emptySubText: {
		fontSize: 12,
		textAlign: 'center',
	},
	agendaList: {
		gap: 10,
	},
	agendaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	checkboxDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	agendaItemDetails: {
		flex: 1,
	},
	agendaItemTitle: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
	},
	agendaItemMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	badge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	badgeText: {
		fontSize: 9,
		fontWeight: '700',
	},
	priorityDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	priorityText: {
		fontSize: 10,
		fontWeight: '600',
	},
});
