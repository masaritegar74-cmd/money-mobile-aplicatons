import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type AccentPreset = 'indigo' | 'emerald' | 'crimson' | 'amber' | 'violet';

export interface ThemeColors {
	primary: string;
	primarySoft: string;
	background: string;
	surface: string;
	border: string;
	text: string;
	textMuted: string;
	success: string;
	warning: string;
	error: string;
	cardAccent: string;
}

interface ThemeContextType {
	themeMode: ThemeMode;
	accentPreset: AccentPreset;
	colors: ThemeColors;
	setThemeMode: (mode: ThemeMode) => void;
	setAccentPreset: (preset: AccentPreset) => void;
	isDark: boolean;
}

const accentPresets: Record<AccentPreset, { primary: string; softLight: string; softDark: string }> = {
	indigo: { primary: '#4f46e5', softLight: '#eef2ff', softDark: '#1e1b4b' },
	emerald: { primary: '#10b981', softLight: '#ecfdf5', softDark: '#064e3b' },
	crimson: { primary: '#e11d48', softLight: '#fff1f2', softDark: '#4c0519' },
	amber: { primary: '#d97706', softLight: '#fffbeb', softDark: '#451a03' },
	violet: { primary: '#7c3aed', softLight: '#f5f3ff', softDark: '#2e1065' },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
	const [accentPreset, setAccentPresetState] = useState<AccentPreset>('indigo');

	// Load initial settings
	useEffect(() => {
		const loadThemeSettings = async () => {
			try {
				const savedMode = await AsyncStorage.getItem('OMNIHUB_THEME_MODE');
				const savedAccent = await AsyncStorage.getItem('OMNIHUB_ACCENT_PRESET');
				if (savedMode) setThemeModeState(savedMode as ThemeMode);
				if (savedAccent) setAccentPresetState(savedAccent as AccentPreset);
			} catch (e) {
				console.error('Failed to load theme settings', e);
			}
		};
		loadThemeSettings();
	}, []);

	const setThemeMode = async (mode: ThemeMode) => {
		setThemeModeState(mode);
		try {
			await AsyncStorage.setItem('OMNIHUB_THEME_MODE', mode);
		} catch (e) {
			console.error(e);
		}
	};

	const setAccentPreset = async (preset: AccentPreset) => {
		setAccentPresetState(preset);
		try {
			await AsyncStorage.setItem('OMNIHUB_ACCENT_PRESET', preset);
		} catch (e) {
			console.error(e);
		}
	};

	const isDark = themeMode === 'dark';
	const activePreset = accentPresets[accentPreset];

	const colors: ThemeColors = {
		primary: activePreset.primary,
		primarySoft: isDark ? activePreset.softDark : activePreset.softLight,
		background: isDark ? '#0f172a' : '#f8fafc',
		surface: isDark ? '#1e293b' : '#ffffff',
		border: isDark ? '#334155' : '#e2e8f0',
		text: isDark ? '#f8fafc' : '#0f172a',
		textMuted: isDark ? '#94a3b8' : '#64748b',
		success: '#10b981',
		warning: '#f59e0b',
		error: '#ef4444',
		cardAccent: isDark ? '#1e293b' : '#f1f5f9',
	};

	return (
		<ThemeContext.Provider value={{ themeMode, accentPreset, colors, setThemeMode, setAccentPreset, isDark }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useAppTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useAppTheme must be used within a ThemeProvider');
	}
	return context;
};
