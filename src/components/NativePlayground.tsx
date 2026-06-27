import React, { useState, useEffect, useRef } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	Pressable, 
	Animated, 
	Platform,
	Dimensions
} from 'react-native';
import { useAppTheme } from '../themeContext';
import { 
	Zap, 
	Battery, 
	Activity, 
	Smartphone, 
	RotateCcw, 
	Play, 
	Info,
	Cpu
} from 'lucide-react-native';

const GAME_WIDTH = 260;
const GAME_HEIGHT = 185;
const BALL_SIZE = 18;
const HOLE_SIZE = 24;

export const NativePlayground: React.FC = () => {
	const { colors, isDark } = useAppTheme();

	// Simulated Battery State
	const [batteryLevel, setBatteryLevel] = useState(82);
	const [isCharging, setIsCharging] = useState(false);

	// Simulated Haptic Animation States
	const [hapticWave] = useState(new Animated.Value(0));
	const [hapticOpacity] = useState(new Animated.Value(0));
	const [activeHapticType, setActiveHapticType] = useState<string | null>(null);

	// Physics Game States
	const [gameActive, setGameActive] = useState(true);
	const [score, setScore] = useState(0);
	const [ballPos, setBallPos] = useState({ x: 120, y: 80 });
	const [tilt, setTilt] = useState({ x: 0, y: 0 }); // Tilt simulation from virtual joystick
	const [victoryMessage, setVictoryMessage] = useState(false);

	const physicsRef = useRef<{
		x: number;
		y: number;
		vx: number;
		vy: number;
		targetX: number;
		targetY: number;
	}>({
		x: 120,
		y: 80,
		vx: 0,
		vy: 0,
		targetX: 40,
		targetY: 40
	});

	// Initialize random target hole
	useEffect(() => {
		resetTarget();
	}, []);

	const resetTarget = () => {
		const pad = 30;
		const targetX = pad + Math.random() * (GAME_WIDTH - pad * 2 - HOLE_SIZE);
		const targetY = pad + Math.random() * (GAME_HEIGHT - pad * 2 - HOLE_SIZE);
		physicsRef.current.targetX = targetX;
		physicsRef.current.targetY = targetY;
	};

	const restartGame = () => {
		physicsRef.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
		physicsRef.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
		physicsRef.current.vx = 0;
		physicsRef.current.vy = 0;
		setBallPos({ x: physicsRef.current.x, y: physicsRef.current.y });
		setScore(0);
		setTilt({ x: 0, y: 0 });
		setVictoryMessage(false);
		resetTarget();
	};

	// Physics loop
	useEffect(() => {
		let animFrameId: number;
		const updatePhysics = () => {
			if (!gameActive) return;

			const p = physicsRef.current;
			
			// Virtual Gravity from Joystick Tilt
			const gx = tilt.x * 0.35;
			const gy = tilt.y * 0.35;

			// Integrate forces with standard friction
			p.vx = (p.vx + gx) * 0.95;
			p.vy = (p.vy + gy) * 0.95;

			p.x += p.vx;
			p.y += p.vy;

			// Boundaries Collision with Elasticity bounce
			const maxB_X = GAME_WIDTH - BALL_SIZE;
			const maxB_Y = GAME_HEIGHT - BALL_SIZE;
			const bounce = -0.55;

			if (p.x < 0) {
				p.x = 0;
				p.vx *= bounce;
			} else if (p.x > maxB_X) {
				p.x = maxB_X;
				p.vx *= bounce;
			}

			if (p.y < 0) {
				p.y = 0;
				p.vy *= bounce;
			} else if (p.y > maxB_Y) {
				p.y = maxB_Y;
				p.vy *= bounce;
			}

			// Collision check with target hole
			const ballCenterX = p.x + BALL_SIZE / 2;
			const ballCenterY = p.y + BALL_SIZE / 2;
			const holeCenterX = p.targetX + HOLE_SIZE / 2;
			const holeCenterY = p.targetY + HOLE_SIZE / 2;

			const dist = Math.sqrt(
				Math.pow(ballCenterX - holeCenterX, 2) + Math.pow(ballCenterY - holeCenterY, 2)
			);

			// If ball center is close to hole center
			if (dist < 12) {
				// Score point!
				setScore((s) => s + 1);
				setVictoryMessage(true);
				triggerVisualHaptic('success');
				resetTarget();
				// Pull ball into hole center
				p.x = p.targetX + (HOLE_SIZE - BALL_SIZE) / 2;
				p.y = p.targetY + (HOLE_SIZE - BALL_SIZE) / 2;
				p.vx = 0;
				p.vy = 0;

				setTimeout(() => {
					setVictoryMessage(false);
				}, 1500);
			}

			setBallPos({ x: p.x, y: p.y });
			animFrameId = requestAnimationFrame(updatePhysics);
		};

		if (gameActive) {
			animFrameId = requestAnimationFrame(updatePhysics);
		}

		return () => cancelAnimationFrame(animFrameId);
	}, [tilt, gameActive]);

	// Joystick tilt simulation math
	const handleJoystickTouch = (e: any) => {
		const nativeEvent = e.nativeEvent;
		const { locationX, locationY } = nativeEvent;
		const centerX = 50; // Joystick container is 100x100
		const centerY = 50;

		// Vector coordinates from center
		const dx = locationX - centerX;
		const dy = locationY - centerY;

		// Normalized tilt vector clamped to [-1, 1]
		const tiltX = Math.max(-1, Math.min(1, dx / 40));
		const tiltY = Math.max(-1, Math.min(1, dy / 40));

		setTilt({ x: tiltX, y: tiltY });
	};

	const handleJoystickRelease = () => {
		setTilt({ x: 0, y: 0 });
	};

	// Mock Haptic simulation wave animation
	const triggerVisualHaptic = (type: string) => {
		setActiveHapticType(type);
		hapticWave.setValue(0);
		hapticOpacity.setValue(0.8);

		Animated.parallel([
			Animated.timing(hapticWave, {
				toValue: 1,
				duration: type === 'heavy' ? 450 : type === 'double' ? 550 : 300,
				useNativeDriver: true,
			}),
			Animated.timing(hapticOpacity, {
				toValue: 0,
				duration: type === 'heavy' ? 450 : type === 'double' ? 550 : 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			setActiveHapticType(null);
		});
	};

	// Battery level indicator styling
	const getBatteryColor = () => {
		if (batteryLevel < 20) return colors.error;
		if (batteryLevel < 50) return colors.warning;
		return colors.success;
	};

	return (
		<ScrollView 
			style={[styles.container, { backgroundColor: colors.background }]} 
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Device Playground</Text>
				<Text style={[styles.subtitle, { color: colors.textMuted }]}>Interactive Simulated Hardware APIs</Text>
			</View>

			{/* PHYSICS BALL GAME */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.cardHeader}>
					<Activity size={18} color={colors.primary} />
					<Text style={[styles.cardTitle, { color: colors.text }]}>Tilt Gravity Ball Game</Text>
					<Text style={[styles.scoreBadge, { backgroundColor: colors.primarySoft, color: colors.primary }]}>
						Score: {score}
					</Text>
				</View>
				<Text style={[styles.desc, { color: colors.textMuted }]}>
					Drag inside the touch-controller to tilt gravity. Slide the ball into the glowing hole!
				</Text>

				<View style={styles.gameLayout}>
					{/* Maze container */}
					<View style={[styles.gameArea, { borderColor: colors.border, backgroundColor: isDark ? '#020617' : '#f8fafc' }]}>
						{/* Target Hole */}
						<View 
							style={[
								styles.targetHole, 
								{ 
									left: physicsRef.current.targetX, 
									top: physicsRef.current.targetY,
									borderColor: victoryMessage ? colors.success : '#f59e0b',
									shadowColor: victoryMessage ? colors.success : '#f59e0b',
								}
							]} 
						/>

						{/* Rolling Ball */}
						<View 
							style={[
								styles.ball, 
								{ 
									left: ballPos.x, 
									top: ballPos.y,
									backgroundColor: colors.primary,
								}
							]} 
						/>

						{/* Score text overlay */}
						{victoryMessage && (
							<View style={styles.victoryOverlay}>
								<Text style={[styles.victoryText, { color: colors.success }]}>TARGET SUNK!</Text>
							</View>
						)}
					</View>

					{/* Controller Area */}
					<View style={styles.controlsBlock}>
						<View 
							style={[styles.joystickBase, { backgroundColor: colors.cardAccent, borderColor: colors.border }]}
							onTouchStart={handleJoystickTouch}
							onTouchMove={handleJoystickTouch}
							onTouchEnd={handleJoystickRelease}
						>
							<View 
								style={[
									styles.joystickThumb, 
									{ 
										backgroundColor: colors.primary,
										transform: [
											{ translateX: tilt.x * 24 },
											{ translateY: tilt.y * 24 }
										]
									}
								]} 
							/>
						</View>
						<Text style={[styles.joystickLabel, { color: colors.textMuted }]}>Tilt Controller</Text>
						
						<Pressable style={[styles.restartBtn, { borderColor: colors.border }]} onPress={restartGame}>
							<RotateCcw size={14} color={colors.text} />
							<Text style={[styles.restartText, { color: colors.text }]}>Reset</Text>
						</Pressable>
					</View>
				</View>
			</View>

			{/* VISUAL HAPTIC SANDBOX */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.cardHeader}>
					<Smartphone size={18} color="#7c3aed" />
					<Text style={[styles.cardTitle, { color: colors.text }]}>Visual Haptics Sim</Text>
				</View>
				<Text style={[styles.desc, { color: colors.textMuted }]}>
					Fictional tactile responses. Trigger waves representing different engine vibration profiles.
				</Text>

				{/* Visual feedback area */}
				<View style={[styles.waveBox, { backgroundColor: isDark ? '#111b27' : '#f0f4f8', borderColor: colors.border }]}>
					{activeHapticType && (
						<Animated.View 
							style={[
								styles.hapticRipple,
								{
									borderColor: activeHapticType === 'success' ? colors.success : activeHapticType === 'error' ? colors.error : colors.primary,
									opacity: hapticOpacity,
									transform: [
										{
											scale: hapticWave.interpolate({
												inputRange: [0, 1],
												outputRange: [0.1, 1.8],
											})
										}
									]
								}
							]}
						/>
					)}
					<Text style={[styles.waveLabel, { color: colors.text }]}>
						{activeHapticType ? `VIBRATING: ${activeHapticType.toUpperCase()}` : 'SANDBOX IDLE'}
					</Text>
				</View>

				{/* Haptic triggers list */}
				<View style={styles.hapticRow}>
					<Pressable 
						style={[styles.hapticBtn, { borderColor: colors.border }]}
						onPress={() => triggerVisualHaptic('light')}
					>
						<Text style={[styles.hapticBtnText, { color: colors.text }]}>Light Tap</Text>
					</Pressable>
					<Pressable 
						style={[styles.hapticBtn, { borderColor: colors.border }]}
						onPress={() => triggerVisualHaptic('heavy')}
					>
						<Text style={[styles.hapticBtnText, { color: colors.text }]}>Heavy Impact</Text>
					</Pressable>
					<Pressable 
						style={[styles.hapticBtn, { borderColor: colors.border }]}
						onPress={() => triggerVisualHaptic('success')}
					>
						<Text style={[styles.hapticBtnText, { color: colors.success }]}>Success</Text>
					</Pressable>
					<Pressable 
						style={[styles.hapticBtn, { borderColor: colors.border }]}
						onPress={() => triggerVisualHaptic('error')}
					>
						<Text style={[styles.hapticBtnText, { color: colors.error }]}>Error</Text>
					</Pressable>
				</View>
			</View>

			{/* SIMULATED HARDWARE INDICATORS */}
			<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
				<View style={styles.cardHeader}>
					<Zap size={18} color="#d97706" />
					<Text style={[styles.cardTitle, { color: colors.text }]}>Hardware Simulation Logs</Text>
				</View>

				<View style={styles.hardwareGrid}>
					{/* Battery Block */}
					<View style={[styles.hwCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
						<View style={styles.hwCardHeader}>
							<Battery size={16} color={getBatteryColor()} />
							<Text style={[styles.hwLabel, { color: colors.text }]}>Mock Battery</Text>
						</View>
						<Text style={[styles.hwValue, { color: colors.text }]}>{batteryLevel}%</Text>
						
						{/* Drag bar for charge level */}
						<View style={styles.sliderRow}>
							<Pressable 
								style={[styles.chargeBtn, { backgroundColor: colors.primarySoft }]}
								onPress={() => setBatteryLevel(Math.max(5, batteryLevel - 15))}
							>
								<Text style={{ color: colors.primary, fontWeight: '700' }}>-</Text>
							</Pressable>
							<Pressable 
								style={[styles.chargeBtn, { backgroundColor: colors.primarySoft }]}
								onPress={() => setBatteryLevel(Math.min(100, batteryLevel + 15))}
							>
								<Text style={{ color: colors.primary, fontWeight: '700' }}>+</Text>
							</Pressable>
						</View>
						<Pressable 
							style={[styles.chargingToggle, { borderColor: colors.border }, isCharging && { backgroundColor: '#ecfdf5' }]}
							onPress={() => setIsCharging(!isCharging)}
						>
							<Text style={[styles.chargingToggleText, { color: isCharging ? '#047857' : colors.text }]}>
								{isCharging ? '⚡ CHARGING' : 'DISCHARGING'}
							</Text>
						</Pressable>
					</View>

					{/* CPU Metrics Block */}
					<View style={[styles.hwCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
						<View style={styles.hwCardHeader}>
							<Cpu size={16} color="#7c3aed" />
							<Text style={[styles.hwLabel, { color: colors.text }]}>Simulated Core Load</Text>
						</View>
						<Text style={[styles.hwValue, { color: colors.text }]}>24%</Text>
						<View style={styles.ramGrid}>
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<View 
									key={i} 
									style={[
										styles.ramBar, 
										{ backgroundColor: i <= 2 ? '#7c3aed' : colors.border }
									]} 
								/>
							))}
						</View>
						<Text style={[styles.ramText, { color: colors.textMuted }]}>ARM Cortex v8 Architecture</Text>
					</View>
				</View>

				<View style={[styles.systemSpecs, { backgroundColor: colors.background, borderColor: colors.border }]}>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Platform Os</Text>
						<Text style={[styles.specVal, { color: colors.text }]}>{Platform.OS.toUpperCase()} v{Platform.Version}</Text>
					</View>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Framework Bundler</Text>
						<Text style={[styles.specVal, { color: colors.text }]}>Expo Go & Metro</Text>
					</View>
					<View style={styles.specRow}>
						<Text style={[styles.specName, { color: colors.textMuted }]}>Persistent Core</Text>
						<Text style={[styles.specVal, { color: colors.text }]}>AsyncStorage</Text>
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
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 6,
	},
	cardTitle: {
		fontSize: 14,
		fontWeight: '700',
		flex: 1,
	},
	scoreBadge: {
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 10,
		fontSize: 11,
		fontWeight: '700',
	},
	desc: {
		fontSize: 12,
		lineHeight: 16,
		marginBottom: 14,
	},
	gameLayout: {
		flexDirection: 'row',
		gap: 12,
	},
	gameArea: {
		flex: 1,
		height: GAME_HEIGHT,
		borderRadius: 12,
		borderWidth: 2.5,
		overflow: 'hidden',
		position: 'relative',
	},
	ball: {
		width: BALL_SIZE,
		height: BALL_SIZE,
		borderRadius: BALL_SIZE / 2,
		position: 'absolute',
	},
	targetHole: {
		width: HOLE_SIZE,
		height: HOLE_SIZE,
		borderRadius: HOLE_SIZE / 2,
		borderWidth: 3,
		position: 'absolute',
		backgroundColor: '#1e293b',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 6,
		elevation: 4,
	},
	victoryOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(16, 185, 129, 0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	victoryText: {
		fontSize: 14,
		fontWeight: '900',
		letterSpacing: 1,
	},
	controlsBlock: {
		alignItems: 'center',
		justifyContent: 'space-between',
		width: 100,
	},
	joystickBase: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 1.5,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	joystickThumb: {
		width: 28,
		height: 28,
		borderRadius: 14,
		position: 'absolute',
	},
	joystickLabel: {
		fontSize: 9,
		fontWeight: '700',
		marginTop: 4,
	},
	restartBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingVertical: 5,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		marginTop: 8,
	},
	restartText: {
		fontSize: 10,
		fontWeight: '600',
	},
	waveBox: {
		height: 80,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		overflow: 'hidden',
		marginBottom: 12,
	},
	hapticRipple: {
		position: 'absolute',
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3.5,
	},
	waveLabel: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.5,
		zIndex: 2,
	},
	hapticRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	hapticBtn: {
		flex: 1,
		minWidth: '45%',
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		borderRadius: 8,
		borderWidth: 1,
	},
	hapticBtnText: {
		fontSize: 11,
		fontWeight: '600',
	},
	hardwareGrid: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 14,
	},
	hwCard: {
		flex: 1,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'space-between',
		minHeight: 135,
	},
	hwCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 4,
	},
	hwLabel: {
		fontSize: 10,
		fontWeight: '600',
	},
	hwValue: {
		fontSize: 22,
		fontWeight: '800',
		marginVertical: 4,
	},
	sliderRow: {
		flexDirection: 'row',
		gap: 6,
		marginBottom: 6,
	},
	chargeBtn: {
		flex: 1,
		height: 24,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chargingToggle: {
		height: 24,
		borderRadius: 6,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chargingToggleText: {
		fontSize: 9,
		fontWeight: '700',
	},
	ramGrid: {
		flexDirection: 'row',
		gap: 3,
		height: 10,
		alignItems: 'center',
		marginVertical: 6,
	},
	ramBar: {
		flex: 1,
		height: '100%',
		borderRadius: 1.5,
	},
	ramText: {
		fontSize: 9,
		fontWeight: '500',
	},
	systemSpecs: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		gap: 8,
	},
	specRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	specName: {
		fontSize: 11,
		fontWeight: '500',
	},
	specVal: {
		fontSize: 11,
		fontWeight: '700',
	},
});
