import React, { useState, useMemo } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	TextInput, 
	Pressable, 
	FlatList,
	KeyboardAvoidingView,
	Platform
} from 'react-native';
import { useAppState } from '../appStateContext';
import { useAppTheme } from '../themeContext';
import { Task } from '../types';
import { Search, Plus, Trash2, CheckCircle2, Circle, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';

interface TaskManagerProps {
	forceShowAddForm?: boolean;
	onFormHandled?: () => void;
}

const CATEGORIES: Task['category'][] = ['Work', 'Personal', 'Health', 'Urgent', 'Shopping', 'Other'];
const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high'];

export const TaskManager: React.FC<TaskManagerProps> = ({ forceShowAddForm = false, onFormHandled }) => {
	const { tasks, addTask, toggleTask, deleteTask } = useAppState();
	const { colors } = useAppTheme();

	// UI Controls
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
	const [activePriorityFilter, setActivePriorityFilter] = useState<string>('All');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
	
	const [showAddForm, setShowAddForm] = useState(forceShowAddForm);

	// Form State
	const [newTitle, setNewTitle] = useState('');
	const [newNote, setNewNote] = useState('');
	const [newCategory, setNewCategory] = useState<Task['category']>('Work');
	const [newPriority, setNewPriority] = useState<Task['priority']>('medium');

	// Reset form when prop forces change
	React.useEffect(() => {
		if (forceShowAddForm) {
			setShowAddForm(true);
		}
	}, [forceShowAddForm]);

	const handleAddTask = () => {
		if (!newTitle.trim()) return;
		addTask({
			title: newTitle.trim(),
			note: newNote.trim() || undefined,
			category: newCategory,
			priority: newPriority,
		});
		setNewTitle('');
		setNewNote('');
		setNewCategory('Work');
		setNewPriority('medium');
		setShowAddForm(false);
		if (onFormHandled) onFormHandled();
	};

	// Filters
	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
				(task.note && task.note.toLowerCase().includes(searchQuery.toLowerCase()));
			
			const matchesCategory = activeCategoryFilter === 'All' || task.category === activeCategoryFilter;
			
			const matchesPriority = activePriorityFilter === 'All' || task.priority === activePriorityFilter;
			
			const matchesStatus = statusFilter === 'all' || 
				(statusFilter === 'active' && !task.completed) || 
				(statusFilter === 'completed' && task.completed);

			return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
		});
	}, [tasks, searchQuery, activeCategoryFilter, activePriorityFilter, statusFilter]);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Task Manager</Text>
				<Pressable 
					style={[styles.addToggleBtn, { backgroundColor: colors.primary }]}
					onPress={() => setShowAddForm(!showAddForm)}
				>
					{showAddForm ? <X size={16} color="#ffffff" /> : <Plus size={16} color="#ffffff" />}
					<Text style={styles.addToggleText}>{showAddForm ? 'Close' : 'New Task'}</Text>
				</Pressable>
			</View>

			{/* Expandable Form */}
			{showAddForm && (
				<View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<Text style={[styles.formLabel, { color: colors.text }]}>TASK DETAILS</Text>
					<TextInput
						placeholder="What needs to be done?"
						placeholderTextColor={colors.textMuted}
						style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
						value={newTitle}
						onChangeText={setNewTitle}
					/>
					
					<TextInput
						placeholder="Add additional notes... (optional)"
						placeholderTextColor={colors.textMuted}
						multiline
						numberOfLines={2}
						style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
						value={newNote}
						onChangeText={setNewNote}
					/>

					{/* Category Selector */}
					<Text style={[styles.subLabel, { color: colors.text }]}>CATEGORY</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow}>
						{CATEGORIES.map((cat) => (
							<Pressable
								key={cat}
								style={[
									styles.selectorPill,
									{ borderColor: colors.border },
									newCategory === cat && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
								]}
								onPress={() => setNewCategory(cat)}
							>
								<Text 
									style={[
										styles.selectorText, 
										{ color: colors.textMuted },
										newCategory === cat && { color: colors.primary, fontWeight: '700' }
									]}
								>
									{cat}
								</Text>
							</Pressable>
						))}
					</ScrollView>

					{/* Priority Selector */}
					<Text style={[styles.subLabel, { color: colors.text }]}>PRIORITY</Text>
					<View style={styles.prioritySelectorRow}>
						{PRIORITIES.map((pri) => {
							const isActive = newPriority === pri;
							let activeStyle = {};
							if (isActive) {
								if (pri === 'high') activeStyle = { backgroundColor: '#fee2e2', borderColor: '#ef4444' };
								else if (pri === 'medium') activeStyle = { backgroundColor: '#fef3c7', borderColor: '#d97706' };
								else activeStyle = { backgroundColor: '#f0fdf4', borderColor: '#16a34a' };
							}
							return (
								<Pressable
									key={pri}
									style={[
										styles.priorityPill,
										{ borderColor: colors.border },
										activeStyle
									]}
									onPress={() => setNewPriority(pri)}
								>
									<Text 
										style={[
											styles.selectorText, 
											{ color: colors.textMuted },
											isActive && { 
												color: pri === 'high' ? '#dc2626' : pri === 'medium' ? '#b45309' : '#15803d',
												fontWeight: '700'
											}
										]}
									>
										{pri.toUpperCase()}
									</Text>
								</Pressable>
							);
						})}
					</View>

					<Pressable 
						style={[styles.submitBtn, { backgroundColor: colors.primary }, !newTitle.trim() && { opacity: 0.5 }]}
						onPress={handleAddTask}
						disabled={!newTitle.trim()}
					>
						<Text style={styles.submitBtnText}>Add to Calendar</Text>
					</Pressable>
				</View>
			)}

			{/* Search and Filter Panel */}
			<View style={styles.filterSection}>
				<View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<Search size={18} color={colors.textMuted} style={styles.searchIcon} />
					<TextInput
						placeholder="Search tasks..."
						placeholderTextColor={colors.textMuted}
						value={searchQuery}
						onChangeText={setSearchQuery}
						style={[styles.searchInput, { color: colors.text }]}
					/>
					{searchQuery.length > 0 && (
						<Pressable onPress={() => setSearchQuery('')}>
							<X size={16} color={colors.textMuted} />
						</Pressable>
					)}
				</View>

				{/* Horizontal Category Filters */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
					<Pressable
						style={[
							styles.filterBadge,
							{ backgroundColor: colors.surface, borderColor: colors.border },
							activeCategoryFilter === 'All' && { backgroundColor: colors.primary, borderColor: colors.primary }
						]}
						onPress={() => setActiveCategoryFilter('All')}
					>
						<Text 
							style={[
								styles.filterBadgeText, 
								{ color: colors.textMuted },
								activeCategoryFilter === 'All' && { color: '#ffffff' }
							]}
						>
							All Cats
						</Text>
					</Pressable>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat}
							style={[
								styles.filterBadge,
								{ backgroundColor: colors.surface, borderColor: colors.border },
								activeCategoryFilter === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
							]}
							onPress={() => setActiveCategoryFilter(cat)}
						>
							<Text 
								style={[
									styles.filterBadgeText, 
									{ color: colors.textMuted },
									activeCategoryFilter === cat && { color: '#ffffff' }
								]}
							>
								{cat}
							</Text>
						</Pressable>
					))}
				</ScrollView>

				{/* Priority & Completion Filter row */}
				<View style={styles.metaFilterRow}>
					{/* Priority Filter */}
					<View style={styles.buttonSegment}>
						{['All', 'high', 'medium', 'low'].map((pFilter) => (
							<Pressable
								key={pFilter}
								style={[
									styles.segmentBtn,
									{ borderColor: colors.border, backgroundColor: colors.surface },
									activePriorityFilter === pFilter && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
								]}
								onPress={() => setActivePriorityFilter(pFilter)}
							>
								<Text 
									style={[
										styles.segmentText,
										{ color: colors.textMuted },
										activePriorityFilter === pFilter && { color: colors.primary, fontWeight: '700' }
									]}
								>
									{pFilter === 'All' ? 'Any' : pFilter[0].toUpperCase()}
								</Text>
							</Pressable>
						))}
					</View>

					{/* Completion status */}
					<View style={styles.buttonSegment}>
						{(['all', 'active', 'completed'] as const).map((stat) => (
							<Pressable
								key={stat}
								style={[
									styles.segmentBtn,
									{ borderColor: colors.border, backgroundColor: colors.surface },
									statusFilter === stat && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
								]}
								onPress={() => setStatusFilter(stat)}
							>
								<Text 
									style={[
										styles.segmentText,
										{ color: colors.textMuted },
										statusFilter === stat && { color: colors.primary, fontWeight: '700' }
									]}
								>
									{stat === 'all' ? 'All' : stat === 'active' ? 'Active' : 'Done'}
								</Text>
							</Pressable>
						))}
					</View>
				</View>
			</View>

			{/* Task List */}
			{filteredTasks.length === 0 ? (
				<ScrollView 
					contentContainerStyle={styles.emptyContainer}
					showsVerticalScrollIndicator={false}
				>
					<AlertCircle size={48} color={colors.textMuted} style={styles.emptyIcon} />
					<Text style={[styles.emptyText, { color: colors.text }]}>No matching tasks found</Text>
					<Text style={[styles.emptySub, { color: colors.textMuted }]}>
						{tasks.length === 0 ? 'Create a task above to begin!' : 'Try widening your filter presets.'}
					</Text>
				</ScrollView>
			) : (
				<FlatList
					data={filteredTasks}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => {
						const isHigh = item.priority === 'high';
						const isMed = item.priority === 'medium';
						const priorityColor = isHigh ? colors.error : isMed ? colors.warning : '#10b981';

						return (
							<View style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
								<Pressable 
									style={styles.checkArea}
									onPress={() => toggleTask(item.id)}
								>
									{item.completed ? (
										<CheckCircle2 size={22} color={colors.primary} />
									) : (
										<Circle size={22} color={colors.textMuted} />
									)}
								</Pressable>

								<View style={styles.taskDetails}>
									<Text 
										style={[
											styles.taskTitle, 
											{ color: colors.text },
											item.completed && { textDecorationLine: 'line-through', color: colors.textMuted }
										]}
									>
										{item.title}
									</Text>
									{item.note && (
										<Text 
											style={[
												styles.taskNote, 
												{ color: colors.textMuted },
												item.completed && { textDecorationLine: 'line-through' }
											]}
										>
											{item.note}
										</Text>
									)}
									<View style={styles.metaRow}>
										<View style={[styles.categoryBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
											<Text style={[styles.categoryText, { color: colors.text }]}>{item.category}</Text>
										</View>
										<View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15' }]}>
											<Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
												{item.priority.toUpperCase()}
											</Text>
										</View>
									</View>
								</View>

								<Pressable 
									style={styles.deleteBtn}
									onPress={() => deleteTask(item.id)}
								>
									<Trash2 size={18} color={colors.error} />
								</Pressable>
							</View>
						);
					}}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 12,
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
	},
	addToggleBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 12,
	},
	addToggleText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '700',
	},
	formContainer: {
		margin: 16,
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		gap: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 3,
	},
	formLabel: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.8,
	},
	input: {
		height: 44,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	textArea: {
		height: 60,
		paddingTop: 10,
		textAlignVertical: 'top',
	},
	subLabel: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
		marginTop: 4,
	},
	selectorRow: {
		flexDirection: 'row',
		marginBottom: 4,
	},
	selectorPill: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		marginRight: 8,
	},
	selectorText: {
		fontSize: 12,
		fontWeight: '600',
	},
	prioritySelectorRow: {
		flexDirection: 'row',
		gap: 8,
	},
	priorityPill: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	submitBtn: {
		height: 44,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
	},
	submitBtnText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '700',
	},
	filterSection: {
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 12,
		height: 44,
		marginBottom: 10,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		height: '100%',
	},
	horizontalFilters: {
		flexDirection: 'row',
		marginBottom: 10,
	},
	filterBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		borderWidth: 1,
		marginRight: 6,
	},
	filterBadgeText: {
		fontSize: 11,
		fontWeight: '600',
	},
	metaFilterRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	buttonSegment: {
		flexDirection: 'row',
		flex: 1,
		borderWidth: 1,
		borderColor: 'transparent',
	},
	segmentBtn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		height: 32,
		borderWidth: 1,
		marginRight: -1, // Collapse borders
	},
	segmentText: {
		fontSize: 10,
		fontWeight: '600',
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		gap: 10,
	},
	taskCard: {
		flexDirection: 'row',
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.02,
		shadowRadius: 3,
		elevation: 1,
	},
	checkArea: {
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	taskDetails: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 2,
	},
	taskNote: {
		fontSize: 12,
		marginBottom: 6,
	},
	metaRow: {
		flexDirection: 'row',
		gap: 6,
		alignItems: 'center',
	},
	categoryBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		borderWidth: 1,
	},
	categoryText: {
		fontSize: 9,
		fontWeight: '600',
	},
	priorityBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	priorityBadgeText: {
		fontSize: 9,
		fontWeight: '700',
	},
	deleteBtn: {
		padding: 8,
		marginLeft: 8,
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 32,
	},
	emptyIcon: {
		marginBottom: 12,
		opacity: 0.5,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 4,
	},
	emptySub: {
		fontSize: 12,
		textAlign: 'center',
	},
});
