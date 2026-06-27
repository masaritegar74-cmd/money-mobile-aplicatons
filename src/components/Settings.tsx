import React, { useState } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	Pressable, 
	Switch, 
	Alert,
	Platform
} from 'react-native';
import { useAppTheme, AccentPreset } from '../themeContext';
import { useAppState } from '../appStateContext';
import { 
	Sun, 
	Moon, 
	Palette, 
	Database, 
	Info, 
	Trash2, 
	RefreshCw, 
	Check, 
	ChevronRight 
} from 'lucide-react-native';

const ACCENTS: { id: AccentPreset; name: string; color: string }[] = [
	{ id: 'indigo', name: 'Indigo Dream', color: '#4f46e5' },
	{ id: 'emerald', name: 'Emerald Forest', color: '#10b981' },
	{ id: 'crimson', name: 'Crimson Rose', color: '#e11d48' },
	{ id: 'amber', name: 'Amber Sunset', color: '#d97706' },
	{ id: 'violet', name: 'Violet Bloom', color: '#7c3aed' },
];

export const Settings: React.FC = () => {
	const { themeMode, setThemeMode, accentPreset, setAccentPreset, colors, isDark } = useAppTheme();
	const { tasks, transactions, notes, clearAllData, seedDemoData } = useAppState();

	const [isClearing, setIsClearing] = useState(false);
	const [isSeeding, setIsSeeding] = useState(false);

	const handleClear = async () => {
		setIsClearing(true);
		await clearAllData();
		setTimeout(() => setIsClearing(false), 800);
	};

	const handleSeed = () => {
		setIsSeeding(true);
		seedDemoData();
		setTimeout(() => setIsSeeding(false), 800);
	};

	return (
		<ScrollView 
			style={[styles.container, { backgroundColor: colors.background }]} 
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Settings</Text>
				<Text style={[styles.subtitle, { color: colors.textMuted }]}>Personalize your OmniHub workspace</Text>
			</View>

			{/* THEME PREFERENCE CARD */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.sectionHeader}>
					<Palette size={18} color={colors.primary} />
					<Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Styling</Text>
				</View>

				{/* Dark Mode Switch */}
				<View style={styles.settingRow}>
					<View style={styles.settingDetails}>
						<Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
						<Text style={[styles.settingDesc, { color: colors.textMuted }]}>
							Optimize colors for low-light environments
						</Text>
					</View>
					<View style={styles.switchWrapper}>
						{isDark ? (
							<Moon size={16} color={colors.primary} style={{ marginRight: 8 }} />
						) : (
							<Sun size={16} color="#d97706" style={{ marginRight: 8 }} />
						)}
						<Switch
							value={isDark}
							onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
							trackColor={{ false: '#cbd5e1', true: colors.primarySoft }}
							thumbColor={isDark ? colors.primary : '#f1f5f9'}
						/>
					</View>
				</View>

				<View style={[styles.divider, { backgroundColor: colors.border }]} />

				{/* Accent Selection Grid */}
				<Text style={[styles.gridLabel, { color: colors.text }]}>WORKSPACE PRIMARY PALETTE</Text>
				<View style={styles.accentsGrid}>
					{ACCENTS.map((item) => {
						const isSelected = accentPreset === item.id;
						return (
							<Pressable
								key={item.id}
								style={[
									styles.accentItem,
									{ backgroundColor: colors.background, borderColor: colors.border },
									isSelected && { borderColor: item.color, backgroundColor: item.color + '10' }
								]}
								onPress={() => setAccentPreset(item.id)}
							>
								<View style={[styles.colorBadge, { backgroundColor: item.color }]}>
									{isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
								</View>
								<Text 
									style={[
										styles.accentText, 
										{ color: colors.textMuted },
										isSelected && { color: colors.text, fontWeight: '700' }
									]}
								>
									{item.name}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			{/* DATABASE STATS CARD */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.sectionHeader}>
					<Database size={18} color="#10b981" />
					<Text style={[styles.sectionTitle, { color: colors.text }]}>Local Databases</Text>
				</View>
				<Text style={[styles.desc, { color: colors.textMuted }]}>
					Review metadata and records currently persisted in AsyncStorage.
				</Text>

				<View style={styles.statsTable}>
					<View style={styles.statsRow}>
						<Text style={[styles.statsName, { color: colors.text }]}>Tasks Stored</Text>
						<Text style={[styles.statsVal, { color: colors.primary, backgroundColor: colors.primarySoft }]}>
							{tasks.length} items
						</Text>
					</View>
					<View style={styles.statsRow}>
						<Text style={[styles.statsName, { color: colors.text }]}>Financial Cashflows</Text>
						<Text style={[styles.statsVal, { color: '#10b981', backgroundColor: '#ecfdf5' }]}>
							{transactions.length} records
						</Text>
					</View>
					<View style={styles.statsRow}>
						<Text style={[styles.statsName, { color: colors.text }]}>Sticky Notes</Text>
						<Text style={[styles.statsVal, { color: '#d97706', backgroundColor: '#fffbeb' }]}>
							{notes.length} drafts
						</Text>
					</View>
				</View>

				<View style={[styles.divider, { backgroundColor: colors.border }]} />

				{/* Database Admin Operations */}
				<Text style={[styles.gridLabel, { color: colors.text }]}>MAINTENANCE DEFAULTS</Text>
				<View style={styles.actionRow}>
					<Pressable 
						style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.background }]}
						onPress={handleSeed}
						disabled={isSeeding}
					>
						<RefreshCw size={15} color={colors.text} style={[isSeeding && styles.spinning]} />
						<Text style={[styles.actionBtnText, { color: colors.text }]}>
							{isSeeding ? 'Seeding...' : 'Load Mock Data'}
						</Text>
					</Pressable>

					<Pressable 
						style={[styles.actionButton, styles.dangerBtn, { borderColor: colors.error + '50', backgroundColor: colors.error + '10' }]}
						onPress={handleClear}
						disabled={isClearing}
					>
						<Trash2 size={15} color={colors.error} />
						<Text style={[styles.actionBtnText, { color: colors.error }]}>
							{isClearing ? 'Clearing...' : 'Clear All Data'}
						</Text>
					</Pressable>
				</View>
			</View>

			{/* APP DETAILS */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.sectionHeader}>
					<Info size={18} color="#7c3aed" />
					<Text style={[styles.sectionTitle, { color: colors.text }]}>About OmniHub</Text>
				</View>

				<View style={styles.specsList}>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Application Version</Text>
						<Text style={[styles.specValLabel, { color: colors.text }]}>1.0.0 (Production Build v1)</Text>
					</View>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Environment Wrapper</Text>
						<Text style={[styles.specValLabel, { color: colors.text }]}>Expo Router + Metro v54</Text>
					</View>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Platform Target</Text>
						<Text style={[styles.specValLabel, { color: colors.text }]}>Expo Go (Universal Preview)</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 32,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
	},
	subtitle: {
		fontSize: 12,
		fontWeight: '500',
		marginTop: 2,
	},
	card: {
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
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 14,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	desc: {
		fontSize: 11.5,
		lineHeight: 16,
		marginBottom: 12,
	},
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	settingDetails: {
		flex: 1,
		marginRight: 12,
	},
	settingLabel: {
		fontSize: 13,
		fontWeight: '700',
		marginBottom: 2,
	},
	settingDesc: {
		fontSize: 11,
		lineHeight: 14,
	},
	switchWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	divider: {
		height: 1,
		marginVertical: 14,
	},
	gridLabel: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.8,
		marginBottom: 10,
	},
	accentsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	accentItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 8,
		borderWidth: 1,
		width: '48.5%',
		gap: 8,
	},
	colorBadge: {
		width: 18,
		height: 18,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
	},
	accentText: {
		fontSize: 11,
		fontWeight: '600',
	},
	statsTable: {
		gap: 8,
		marginBottom: 4,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	statsName: {
		fontSize: 12,
		fontWeight: '600',
	},
	statsVal: {
		fontSize: 11,
		fontWeight: '700',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
		overflow: 'hidden',
	},
	actionRow: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 38,
		borderRadius: 8,
		borderWidth: 1,
		gap: 6,
	},
	dangerBtn: {
		borderWidth: 1,
	},
	actionBtnText: {
		fontSize: 11,
		fontWeight: '700',
	},
	specsList: {
		gap: 8,
	},
	specRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	specName: {
		fontSize: 11,
		fontWeight: '500',
	},
	specValLabel: {
		fontSize: 11,
		fontWeight: '700',
	},
	spinning: {
		// Mock spin style triggers no error but represents state change
	},
});
