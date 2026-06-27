import React, { useState, useMemo } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	TextInput, 
	Pressable, 
	FlatList,
	Keyboard
} from 'react-native';
import { useAppState } from '../appStateContext';
import { useAppTheme } from '../themeContext';
import { Transaction } from '../types';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, X, Filter, DollarSign, AlertTriangle } from 'lucide-react-native';

interface ExpenseTrackerProps {
	forceShowAddForm?: boolean;
	onFormHandled?: () => void;
}

const CATEGORIES: Transaction['category'][] = ['Food', 'Transport', 'Salary', 'Entertainment', 'Shopping', 'Utilities', 'Other'];
const BUDGETS = [500, 1000, 2000, 3000, 5000];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ forceShowAddForm = false, onFormHandled }) => {
	const { transactions, addTransaction, deleteTransaction } = useAppState();
	const { colors } = useAppTheme();

	// Config state
	const [selectedBudget, setSelectedBudget] = useState(2000);
	const [showAddForm, setShowAddForm] = useState(forceShowAddForm);
	const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
	const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

	// Form states
	const [title, setTitle] = useState('');
	const [amount, setAmount] = useState('');
	const [type, setType] = useState<'income' | 'expense'>('expense');
	const [category, setCategory] = useState<Transaction['category']>('Food');

	React.useEffect(() => {
		if (forceShowAddForm) {
			setShowAddForm(true);
		}
	}, [forceShowAddForm]);

	// Total calculations
	const totalIncome = useMemo(() => {
		return transactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);
	}, [transactions]);

	const totalExpense = useMemo(() => {
		return transactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);
	}, [transactions]);

	const netBalance = totalIncome - totalExpense;
	const budgetPercent = Math.min(100, Math.round((totalExpense / selectedBudget) * 100));

	const handleAddTransaction = () => {
		const parsedAmount = parseFloat(amount);
		if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

		addTransaction({
			title: title.trim(),
			amount: parsedAmount,
			type,
			category: type === 'income' ? 'Salary' : category, // Auto category for income
		});

		setTitle('');
		setAmount('');
		setType('expense');
		setCategory('Food');
		setShowAddForm(false);
		Keyboard.dismiss();
		if (onFormHandled) onFormHandled();
	};

	const filteredTransactions = useMemo(() => {
		return transactions.filter((t) => {
			const matchesCategory = activeCategoryFilter === 'All' || t.category === activeCategoryFilter;
			const matchesType = activeTypeFilter === 'all' || t.type === activeTypeFilter;
			return matchesCategory && matchesType;
		});
	}, [transactions, activeCategoryFilter, activeTypeFilter]);

	// Indicator color for budget exhaustion
	const getBudgetIndicatorColor = () => {
		if (budgetPercent >= 90) return colors.error;
		if (budgetPercent >= 75) return colors.warning;
		return colors.success;
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Budget Planner</Text>
				<Pressable 
					style={[styles.addToggleBtn, { backgroundColor: colors.primary }]}
					onPress={() => setShowAddForm(!showAddForm)}
				>
					{showAddForm ? <X size={16} color="#ffffff" /> : <Plus size={16} color="#ffffff" />}
					<Text style={styles.addToggleText}>{showAddForm ? 'Close' : 'Add Cash'}</Text>
				</Pressable>
			</View>

			<ScrollView 
				style={styles.scrollSection} 
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Budget Exhaustion Bar Card */}
				<View style={[styles.budgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<View style={styles.budgetHeader}>
						<View>
							<Text style={[styles.budgetCardLabel, { color: colors.textMuted }]}>MONTHLY BUDGET CEILING</Text>
							<Text style={[styles.budgetCardVal, { color: colors.text }]}>
								${totalExpense.toLocaleString('en-US', { maximumFractionDigits: 2 })} / ${selectedBudget}
							</Text>
						</View>
						<View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
							<Text style={[styles.badgeText, { color: colors.primary }]}>{budgetPercent}% Spent</Text>
						</View>
					</View>

					{/* Progress Indicator */}
					<View style={styles.progressBarBg}>
						<View 
							style={[
								styles.progressBarFill, 
								{ backgroundColor: getBudgetIndicatorColor(), width: `${budgetPercent}%` }
							]} 
						/>
					</View>

					{/* Alert triggers */}
					{budgetPercent >= 90 && (
						<View style={[styles.alertRow, { backgroundColor: colors.error + '10' }]}>
							<AlertTriangle size={14} color={colors.error} />
							<Text style={[styles.alertText, { color: colors.error }]}>
								Critical! You have used 90%+ of your designated budget limit.
							</Text>
						</View>
					)}

					{/* Budget selector buttons */}
					<Text style={[styles.selectorTitle, { color: colors.textMuted }]}>ADJUST TARGET BUDGET</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetSelectors}>
						{BUDGETS.map((b) => (
							<Pressable
								key={b}
								style={[
									styles.budgetBtn,
									{ borderColor: colors.border },
									selectedBudget === b && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
								]}
								onPress={() => setSelectedBudget(b)}
							>
								<Text 
									style={[
										styles.budgetText, 
										{ color: colors.textMuted },
										selectedBudget === b && { color: colors.primary, fontWeight: '700' }
									]}
								>
									${b}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>

				{/* Expandable Dialog */}
				{showAddForm && (
					<View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Text style={[styles.formTitle, { color: colors.text }]}>NEW TRANSACTION</Text>

						<View style={styles.typeToggleRow}>
							<Pressable
								style={[
									styles.typeToggleBtn,
									{ borderColor: colors.border },
									type === 'expense' && { backgroundColor: colors.error + '15', borderColor: colors.error }
								]}
								onPress={() => setType('expense')}
							>
								<ArrowDownLeft size={16} color={type === 'expense' ? colors.error : colors.textMuted} />
								<Text style={[styles.typeToggleText, { color: type === 'expense' ? colors.error : colors.textMuted }]}>Expense</Text>
							</Pressable>
							<Pressable
								style={[
									styles.typeToggleBtn,
									{ borderColor: colors.border },
									type === 'income' && { backgroundColor: colors.success + '15', borderColor: colors.success }
								]}
								onPress={() => setType('income')}
							>
								<ArrowUpRight size={16} color={type === 'income' ? colors.success : colors.textMuted} />
								<Text style={[styles.typeToggleText, { color: type === 'income' ? colors.success : colors.textMuted }]}>Income</Text>
							</Pressable>
						</View>

						<TextInput
							placeholder="Transaction title (e.g., Grocery outlet)"
							placeholderTextColor={colors.textMuted}
							value={title}
							onChangeText={setTitle}
							style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
						/>

						<View style={styles.amountInputRow}>
							<View style={[styles.currencyPrefix, { borderColor: colors.border, backgroundColor: colors.background }]}>
								<DollarSign size={16} color={colors.text} />
							</View>
							<TextInput
								placeholder="0.00"
								placeholderTextColor={colors.textMuted}
								keyboardType="decimal-pad"
								value={amount}
								onChangeText={setAmount}
								style={[styles.input, styles.amountInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
							/>
						</View>

						{/* Category selector for expense only */}
						{type === 'expense' && (
							<>
								<Text style={[styles.subLabel, { color: colors.text }]}>CATEGORY</Text>
								<View style={styles.categoryGrid}>
									{CATEGORIES.filter(c => c !== 'Salary').map((cat) => (
										<Pressable
											key={cat}
											style={[
												styles.categoryPill,
												{ borderColor: colors.border, backgroundColor: colors.background },
												category === cat && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
											]}
											onPress={() => setCategory(cat)}
										>
											<Text 
												style={[
													styles.categoryText, 
													{ color: colors.textMuted },
													category === cat && { color: colors.primary, fontWeight: '700' }
												]}
											>
												{cat}
											</Text>
										</Pressable>
									))}
								</View>
							</>
						)}

						<Pressable
							style={[styles.submitBtn, { backgroundColor: colors.primary }, (!title.trim() || !amount) && { opacity: 0.5 }]}
							onPress={handleAddTransaction}
							disabled={!title.trim() || !amount}
						>
							<Text style={styles.submitBtnText}>Add Transaction</Text>
						</Pressable>
					</View>
				)}

				{/* Filtering Section */}
				<View style={styles.filterBar}>
					<View style={styles.filterHeader}>
						<Filter size={16} color={colors.textMuted} />
						<Text style={[styles.filterTitle, { color: colors.text }]}>Filters</Text>
					</View>

					<View style={styles.segmentedRow}>
						<Pressable
							style={[
								styles.segmentBtn,
								{ borderColor: colors.border, backgroundColor: colors.surface },
								activeTypeFilter === 'all' && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
							]}
							onPress={() => setActiveTypeFilter('all')}
						>
							<Text style={[styles.segmentText, { color: activeTypeFilter === 'all' ? colors.primary : colors.textMuted }]}>All</Text>
						</Pressable>
						<Pressable
							style={[
								styles.segmentBtn,
								{ borderColor: colors.border, backgroundColor: colors.surface },
								activeTypeFilter === 'expense' && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
							]}
							onPress={() => setActiveTypeFilter('expense')}
						>
							<Text style={[styles.segmentText, { color: activeTypeFilter === 'expense' ? colors.primary : colors.textMuted }]}>Expenses</Text>
						</Pressable>
						<Pressable
							style={[
								styles.segmentBtn,
								{ borderColor: colors.border, backgroundColor: colors.surface },
								activeTypeFilter === 'income' && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
							]}
							onPress={() => setActiveTypeFilter('income')}
						>
							<Text style={[styles.segmentText, { color: activeTypeFilter === 'income' ? colors.primary : colors.textMuted }]}>Incomes</Text>
						</Pressable>
					</View>

					{/* Horizontal category filters */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
						<Pressable
							style={[
								styles.catBadge,
								{ backgroundColor: colors.surface, borderColor: colors.border },
								activeCategoryFilter === 'All' && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
							]}
							onPress={() => setActiveCategoryFilter('All')}
						>
							<Text style={[styles.catBadgeText, { color: activeCategoryFilter === 'All' ? colors.primary : colors.textMuted }]}>All</Text>
						</Pressable>
						{CATEGORIES.map((cat) => (
							<Pressable
								key={cat}
								style={[
									styles.catBadge,
									{ backgroundColor: colors.surface, borderColor: colors.border },
									activeCategoryFilter === cat && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
								]}
								onPress={() => setActiveCategoryFilter(cat)}
							>
								<Text style={[styles.catBadgeText, { color: activeCategoryFilter === cat ? colors.primary : colors.textMuted }]}>{cat}</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>

				{/* Transaction List */}
				<View style={styles.transactionsHeader}>
					<Text style={[styles.listHeaderTitle, { color: colors.text }]}>Transaction History</Text>
					<Text style={[styles.listHeaderCount, { color: colors.textMuted }]}>{filteredTransactions.length} items</Text>
				</View>

				{filteredTransactions.length === 0 ? (
					<View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<DollarSign size={36} color={colors.textMuted} style={styles.emptyIcon} />
						<Text style={[styles.emptyText, { color: colors.text }]}>No transactions logged</Text>
						<Text style={[styles.emptySubText, { color: colors.textMuted }]}>Log expenses and income above to map your cashflow.</Text>
					</View>
				) : (
					<View style={styles.transactionsList}>
						{filteredTransactions.map((item) => {
							const isExpense = item.type === 'expense';
							return (
								<View 
									key={item.id} 
									style={[styles.txRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
								>
									<View style={[styles.txIconWrapper, { backgroundColor: isExpense ? colors.error + '10' : colors.success + '10' }]}>
										{isExpense ? (
											<ArrowDownLeft size={16} color={colors.error} />
										) : (
											<ArrowUpRight size={16} color={colors.success} />
										)}
									</View>

									<View style={styles.txDetails}>
										<Text style={[styles.txTitle, { color: colors.text }]}>{item.title}</Text>
										<View style={styles.txMeta}>
											<Text style={[styles.txCategory, { color: colors.textMuted }]}>{item.category}</Text>
											<Text style={[styles.txDot, { color: colors.textMuted }]}>•</Text>
											<Text style={[styles.txDate, { color: colors.textMuted }]}>
												{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
											</Text>
										</View>
									</View>

									<Text style={[styles.txAmount, { color: isExpense ? colors.error : colors.success }]}>
										{isExpense ? '-' : '+'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</Text>

									<Pressable
										style={styles.trashBtn}
										onPress={() => deleteTransaction(item.id)}
									>
										<Trash2 size={16} color={colors.error} />
									</Pressable>
								</View>
							);
						})}
					</View>
				)}
			</ScrollView>
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
	scrollSection: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 32,
	},
	budgetCard: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.02,
		shadowRadius: 3,
		elevation: 1,
	},
	budgetHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	budgetCardLabel: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	budgetCardVal: {
		fontSize: 18,
		fontWeight: '800',
		marginTop: 2,
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	badgeText: {
		fontSize: 10,
		fontWeight: '700',
	},
	progressBarBg: {
		height: 8,
		backgroundColor: '#e2e8f0',
		borderRadius: 4,
		marginBottom: 12,
		overflow: 'hidden',
	},
	progressBarFill: {
		height: '100%',
		borderRadius: 4,
	},
	alertRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderRadius: 8,
		marginBottom: 14,
		gap: 8,
	},
	alertText: {
		fontSize: 11,
		fontWeight: '600',
		flex: 1,
	},
	selectorTitle: {
		fontSize: 9,
		fontWeight: '700',
		letterSpacing: 0.5,
		marginBottom: 8,
	},
	budgetSelectors: {
		flexDirection: 'row',
	},
	budgetBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		borderWidth: 1,
		marginRight: 6,
	},
	budgetText: {
		fontSize: 11,
		fontWeight: '600',
	},
	formContainer: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 16,
		gap: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 2,
	},
	formTitle: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.8,
	},
	typeToggleRow: {
		flexDirection: 'row',
		gap: 10,
	},
	typeToggleBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		gap: 6,
	},
	typeToggleText: {
		fontSize: 12,
		fontWeight: '700',
	},
	input: {
		height: 44,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	amountInputRow: {
		flexDirection: 'row',
		gap: 8,
	},
	currencyPrefix: {
		width: 44,
		height: 44,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	amountInput: {
		flex: 1,
	},
	subLabel: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
		marginTop: 4,
	},
	categoryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	categoryPill: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	categoryText: {
		fontSize: 11,
		fontWeight: '600',
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
	filterBar: {
		marginBottom: 16,
	},
	filterHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 8,
	},
	filterTitle: {
		fontSize: 12,
		fontWeight: '700',
	},
	segmentedRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 10,
	},
	segmentBtn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		height: 32,
		borderRadius: 8,
		borderWidth: 1,
	},
	segmentText: {
		fontSize: 11,
		fontWeight: '600',
	},
	categoryFilters: {
		flexDirection: 'row',
	},
	catBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 14,
		borderWidth: 1,
		marginRight: 6,
	},
	catBadgeText: {
		fontSize: 11,
		fontWeight: '600',
	},
	transactionsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
		marginTop: 6,
	},
	listHeaderTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	listHeaderCount: {
		fontSize: 12,
		fontWeight: '500',
	},
	emptyState: {
		padding: 24,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyIcon: {
		marginBottom: 8,
		opacity: 0.5,
	},
	emptyText: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
	},
	emptySubText: {
		fontSize: 11,
		textAlign: 'center',
	},
	transactionsList: {
		gap: 8,
	},
	txRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
	},
	txIconWrapper: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	txDetails: {
		flex: 1,
	},
	txTitle: {
		fontSize: 13,
		fontWeight: '600',
		marginBottom: 2,
	},
	txMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	txCategory: {
		fontSize: 10,
		fontWeight: '500',
	},
	txDot: {
		fontSize: 10,
	},
	txDate: {
		fontSize: 10,
	},
	txAmount: {
		fontSize: 14,
		fontWeight: '700',
		marginRight: 8,
	},
	trashBtn: {
		padding: 6,
	},
});
