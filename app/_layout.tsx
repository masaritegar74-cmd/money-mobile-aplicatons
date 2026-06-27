import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
	return (
		<>
			<Stack
				screenOptions={{
					headerLargeTitle: true,
					contentStyle: { backgroundColor: '#f7f8fb' },
				}}
			/>
			<StatusBar style="auto" />
		</>
	);
}
