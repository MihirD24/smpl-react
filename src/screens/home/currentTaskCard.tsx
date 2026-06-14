import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import { CurrentTaskData } from '../../types/currentTaskData';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

type CurrentTaskCardProps = {
  currentTaskData: CurrentTaskData | null;
  onCountsRefresh?: () => void;
  onTaskComplete?: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const detectIsPaused = (data: CurrentTaskData | null): boolean => {
  if (!data) return false;
  if (data?.button_status === 'Start') return true;
  if (data?.button_status === 'Stop') return false;
  const status = (data?.status ?? data?.work_status ?? '')
    .toString()
    .toLowerCase();
  return (
    status === 'stop' ||
    status === 'paused' ||
    status === 'pause' ||
    data?.is_paused === 1 ||
    data?.is_paused === true
  );
};

const calcRunningElapsed = (data: CurrentTaskData): number => {
  const previousWorked = (data?.total_minutes ?? 0) * 60;
  return previousWorked;
};

const calcPausedElapsed = (data: CurrentTaskData): number => {
  return (data?.total_minutes ?? 0) * 60;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CurrentTaskCard = ({ currentTaskData }: CurrentTaskCardProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const t = {
    card: isDarkMode ? '#1E2028' : '#FFFFFF',
    text: isDarkMode ? '#F0F0F0' : '#1A1D2E',
    sub: '#9098B1',
    border: isDarkMode ? '#2A2D38' : '#EAEDFF',
    primary: '#3B6FD4',
  };

  // ─── Timer & pause state ──────────────────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Pulse animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.2,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    if (!isPaused) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }

    return () => pulse.stop();
  }, [isPaused]);

  // ─── Timer tick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  // ─── Sync from server data ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentTaskData) return;

    const serverIsPaused = detectIsPaused(currentTaskData);
    setIsPaused(serverIsPaused);

    if (serverIsPaused) {
      setElapsedSeconds(calcPausedElapsed(currentTaskData));
    } else {
      setElapsedSeconds(calcRunningElapsed(currentTaskData));
    }
  }, [currentTaskData]);

  // ─── Formatters ───────────────────────────────────────────────────────────

  const formatTime = (secs: number): string => {
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatTime12h = (raw: string | undefined): string => {
    if (!raw) return '--:-- --';
    const date = new Date(String(raw).replace(' ', 'T'));
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return raw;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes == null) return '—';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hr${h > 1 ? 's' : ''}${m ? ` ${m}min` : ''}`;
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const taskName =
    currentTaskData?.parent_work_log?.get_selected_projectmodule?.name ||
    currentTaskData?.parent_work_log?.title ||
    'Current Task';

  const startTimeRaw =
    currentTaskData?.start_time ??
    currentTaskData?.started_at ??
    currentTaskData?.created_at;

  const stopTimeRaw =
    currentTaskData?.end_time ?? currentTaskData?.stopped_at ?? '';

  const timeLabel = isPaused
    ? `⏹  Stopped at ${formatTime12h(stopTimeRaw ?? startTimeRaw)}`
    : `▶  Started at ${formatTime12h(startTimeRaw)}`;

  const accentColor = isPaused ? '#FFA000' : '#3B6FD4';

  const estimatedSeconds =
    (currentTaskData?.parent_work_log?.estimated_minutes ?? 0) * 60;

  const status = elapsedSeconds <= estimatedSeconds ? 'ON_TIME' : 'DELAYED';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          borderLeftColor: accentColor,
        },
      ]}
    >
      {/* Top */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPaused
                ? isDarkMode
                  ? '#3A2A00'
                  : '#FFF4D6'
                : isDarkMode
                ? '#1A2540'
                : '#EEF4FF',
            },
          ]}
        >
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: accentColor,
                opacity: isPaused ? 1 : pulseAnim,
              },
            ]}
          />
          <Text style={[styles.statusLabel, { color: accentColor }]}>
            {isPaused ? 'PAUSED' : 'WORKING'}
          </Text>
        </View>

        <Text style={[styles.timer, { color: accentColor }]}>
          {formatTime(elapsedSeconds)}
        </Text>
      </View>

      {/* Middle */}
      <View style={styles.middleRow}>
        <Text style={[styles.taskName, { color: t.text }]} numberOfLines={2}>
          {taskName}
        </Text>

        <Text
          style={{
            color:
              status === 'ON_TIME'
                ? isDarkMode
                  ? '#4ADE80'
                  : '#22C55E'
                : '#EF4444',
            fontWeight: '600',
            fontSize: moderateScale(12),
          }}
        >
          {status === 'ON_TIME' ? 'On Time' : 'Delayed'}
        </Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottomRow}>
        <Text style={[styles.timeLabel, { color: t.sub }]}>{timeLabel}</Text>
        <Text style={[styles.timeLabel, { color: t.sub }]}>
          Est.{' '}
          {formatMinutes(
            currentTaskData?.parent_work_log?.estimated_minutes ?? 0,
          )}
        </Text>
      </View>
    </View>
  );
};

export default CurrentTaskCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: moderateScale(14),
    marginVertical: verticalScale(6),
    borderWidth: moderateScale(1),
    borderLeftWidth: moderateScale(4),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
  },

  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },

  statusLabel: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  timer: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },

  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },

  taskName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    flex: 1,
    marginRight: moderateScale(12),
    lineHeight: 20,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
});
