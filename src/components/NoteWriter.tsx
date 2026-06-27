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
import { useAppState, NOTE_COLORS } from '../appStateContext';
import { useAppTheme } from '../themeContext';
import { Note } from '../types';
import { Plus, Trash2, Star, Search, Grid, List, X, CornerDownRight } from 'lucide-react-native';

interface NoteWriterProps {
	forceShowAddForm?: boolean;
	onFormHandled?: () => void;
}

export const NoteWriter: React.FC<NoteWriterProps> = ({ forceShowAddForm = false, onFormHandled }) => {
	const { notes, addNote, updateNote, deleteNote } = useAppState();
	const { colors, isDark } = useAppTheme();

	// View toggle
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [searchQuery, setSearchQuery] = useState('');
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [showAddForm, setShowAddForm] = useState(forceShowAddForm);

	// Form states
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].hex);

	React.useEffect(() => {
		if (forceShowAddForm) {
			setShowAddForm(true);
		}
	}, [forceShowAddForm]);

	const handleAddNote = () => {
		if (!title.trim() && !content.trim()) return;

		addNote({
			title: title.trim() || 'Untitled Note',
			content: content.trim(),
			color: selectedColor,
			favorite: false,
		});

		setTitle('');
		setContent('');
		setSelectedColor(NOTE_COLORS[0].hex);
		setShowAddForm(false);
		Keyboard.dismiss();
		if (onFormHandled) onFormHandled();
	};

	const filteredNotes = useMemo(() => {
		return notes.filter((n) => {
			const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
				n.content.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesFavorite = !favoritesOnly || n.favorite;
			return matchesSearch && matchesFavorite;
		});
	}, [notes, searchQuery, favoritesOnly]);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Quick Notes</Text>
				<Pressable 
					style={[styles.addToggleBtn, { backgroundColor: colors.primary }]}
					onPress={() => setShowAddForm(!showAddForm)}
				>
					{showAddForm ? <X size={16} color="#ffffff" /> : <Plus size={16} color="#ffffff" />}
					<Text style={styles.addToggleText}>{showAddForm ? 'Close' : 'New Note'}</Text>
				</Pressable>
			</View>

			<ScrollView 
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Expanding form */}
				{showAddForm && (
					<View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Text style={[styles.formLabel, { color: colors.text }]}>CREATE STICKY NOTE</Text>
						
						<TextInput
							placeholder="Note Title"
							placeholderTextColor={colors.textMuted}
							value={title}
							onChangeText={setTitle}
							style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
						/>

						<TextInput
							placeholder="Type your notes here..."
							placeholderTextColor={colors.textMuted}
							value={content}
							onChangeText={setContent}
							multiline
							numberOfLines={4}
							style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
						/>

						{/* Pastel Color Selector */}
						<Text style={[styles.subLabel, { color: colors.text }]}>STICKY PAPER TINT</Text>
						<View style={styles.colorSelectorRow}>
							{NOTE_COLORS.map((item) => (
								<Pressable
									key={item.hex}
									style={[
										styles.colorCircle,
										{ backgroundColor: item.hex },
										selectedColor === item.hex && styles.colorCircleSelected
									]}
									onPress={() => setSelectedColor(item.hex)}
								/>
							))}
						</View>

						<Pressable
							style={[styles.submitBtn, { backgroundColor: colors.primary }, (!title.trim() && !content.trim()) && { opacity: 0.5 }]}
							onPress={handleAddNote}
							disabled={!title.trim() && !content.trim()}
						>
							<Text style={styles.submitBtnText}>Post Note</Text>
						</Pressable>
					</View>
				)}

				{/* Filtering and Mode bar */}
				<View style={styles.filterBar}>
					<View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Search size={18} color={colors.textMuted} style={styles.searchIcon} />
						<TextInput
							placeholder="Search notes..."
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

					<View style={styles.controlRow}>
						{/* Favorite Toggle */}
						<Pressable
							style={[
								styles.favToggleBtn,
								{ borderColor: colors.border, backgroundColor: colors.surface },
								favoritesOnly && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
							]}
							onPress={() => setFavoritesOnly(!favoritesOnly)}
						>
							<Star size={16} color={favoritesOnly ? '#eab308' : colors.textMuted} fill={favoritesOnly ? '#eab308' : 'none'} />
							<Text style={[styles.favToggleText, { color: favoritesOnly ? colors.primary : colors.textMuted }]}>
								Favorites Only
							</Text>
						</Pressable>

						{/* Grid / List Switcher */}
						<View style={[styles.switchContainer, { borderColor: colors.border }]}>
							<Pressable
								style={[styles.switchBtn, viewMode === 'grid' && { backgroundColor: colors.primarySoft }]}
								onPress={() => setViewMode('grid')}
							>
								<Grid size={16} color={viewMode === 'grid' ? colors.primary : colors.textMuted} />
							</Pressable>
							<Pressable
								style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: colors.primarySoft }]}
								onPress={() => setViewMode('list')}
							>
								<List size={16} color={viewMode === 'list' ? colors.primary : colors.textMuted} />
							</Pressable>
						</View>
					</View>
				</View>

				{/* Notes List / Grid display */}
				{filteredNotes.length === 0 ? (
					<View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Star size={36} color={colors.textMuted} style={styles.emptyIcon} />
						<Text style={[styles.emptyText, { color: colors.text }]}>No notes found</Text>
						<Text style={[styles.emptySub, { color: colors.textMuted }]}>
							{notes.length === 0 ? 'Create a sticky note above to save thoughts!' : 'Try disabling favorites or search queries.'}
						</Text>
					</View>
				) : (
					<View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
						{filteredNotes.map((item) => {
							// Determine appropriate text color on sticky note
							// Dark Mode text needs proper contrast if note is light paper
							const stickyTextAndIconsColor = '#1e293b'; // Slate 800 has gorgeous contrast with pastel notes!

							return (
								<View 
									key={item.id}
									style={[
										viewMode === 'grid' ? styles.gridCard : styles.listCard,
										{ backgroundColor: item.color }
									]}
								>
									<View style={styles.noteHeader}>
										<Text style={[styles.noteTitle, { color: stickyTextAndIconsColor }]} numberOfLines={1}>
											{item.title}
										</Text>
										<View style={styles.noteActions}>
											<Pressable
												style={styles.actionIcon}
												onPress={() => updateNote(item.id, { favorite: !item.favorite })}
											>
												<Star 
													size={16} 
													color={item.favorite ? '#eab308' : '#64748b'} 
													fill={item.favorite ? '#eab308' : 'none'} 
												/>
											</Pressable>
											<Pressable
												style={styles.actionIcon}
												onPress={() => deleteNote(item.id)}
											>
												<Trash2 size={16} color="#ef4444" />
											</Pressable>
										</View>
									</View>

									<Text style={[styles.noteContent, { color: '#475569' }]} numberOfLines={viewMode === 'grid' ? 4 : 2}>
										{item.content}
									</Text>

									<Text style={[styles.noteDate, { color: '#64748b' }]}>
										{new Date(item.updatedAt).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</Text>
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
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 32,
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
		height: 90,
		paddingTop: 10,
		textAlignVertical: 'top',
	},
	subLabel: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
		marginTop: 4,
	},
	colorSelectorRow: {
		flexDirection: 'row',
		gap: 12,
		marginVertical: 4,
	},
	colorCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#cbd5e1',
	},
	colorCircleSelected: {
		borderWidth: 3,
		borderColor: '#4f46e5',
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
	controlRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	favToggleBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		gap: 6,
	},
	favToggleText: {
		fontSize: 11,
		fontWeight: '600',
	},
	switchContainer: {
		flexDirection: 'row',
		borderRadius: 8,
		borderWidth: 1,
		overflow: 'hidden',
	},
	switchBtn: {
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		padding: 32,
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
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 4,
	},
	emptySub: {
		fontSize: 11,
		textAlign: 'center',
	},
	gridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	listContainer: {
		gap: 12,
	},
	gridCard: {
		width: '48.2%', // Fits 2 cards per row perfectly
		padding: 12,
		borderRadius: 12,
		minHeight: 140,
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	listCard: {
		padding: 14,
		borderRadius: 12,
		minHeight: 90,
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	noteHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	noteTitle: {
		fontSize: 14,
		fontWeight: '700',
		flex: 1,
		marginRight: 6,
	},
	noteActions: {
		flexDirection: 'row',
		gap: 6,
	},
	actionIcon: {
		padding: 2,
	},
	noteContent: {
		fontSize: 12.5,
		lineHeight: 16,
		marginBottom: 8,
	},
	noteDate: {
		fontSize: 9,
		fontWeight: '500',
		textAlign: 'right',
	},
});
