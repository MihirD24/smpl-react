import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import AppIcon from '../../../components/appIcon';
import { cardStyles, getCardTheme } from '../../../assets/style/cardStyles';

export type ProjectRemainingStatus = 'Pending' | 'Completed';
export interface ProjectOption {
  id: number | string;
  name: string;
}
export interface ProjectRemaining {
  id: number | string;
  project: ProjectOption;
  status: ProjectRemainingStatus;
  details: string;
  createdAt?: string;
  employees?: ProjectOption[];
}
const formatDisplay = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusConfig = (status: ProjectRemainingStatus) => {
  switch (status) {
    case 'Pending':
      return {
        bg: '#FFF8E1',
        darkBg: '#3B2F00',
        text: '#B45309',
        icon: 'Clock' as const,
      };
    case 'Completed':
      return {
        bg: '#ECFDF5',
        darkBg: '#002E1C',
        text: '#065F46',
        icon: 'CheckCircle' as const,
      };
    default:
      return {
        bg: '#F3F4F6',
        darkBg: '#1E1E1E',
        text: '#374151',
        icon: 'Circle' as const,
      };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectRemainingCardProps {
  item: ProjectRemaining;
  /** Optional callback so the parent can sync the status change */
  onMarkCompleted?: (id: number | string) => void;
}

const ProjectRemainingCard: React.FC<ProjectRemainingCardProps> = ({
  item,
  onMarkCompleted,
}) => {
  const isDark = useColorScheme() === 'dark';
  const ct = getCardTheme(isDark);

  // Local status state — starts from the prop, updates on button press

  const { bg, darkBg, text, icon  } = statusConfig(item.status);
  const [expanded, setExpanded] = React.useState(false);

  const handleMarkCompleted = (projectRemainingPointId: number | string) => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to mark this project remaining point as completed?', 
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark',
          onPress: () => {
            onMarkCompleted?.(projectRemainingPointId);
            },
        },
      ],
    );
  };

  return (
    <View
      style={[
        cardStyles.card,
        isDark ? cardStyles.cardDark : cardStyles.cardLight,
      ]}
    >
      <View style={cardStyles.headerRow}>
        <View
          style={[
            cardStyles.iconBox,
            isDark ? cardStyles.iconBoxDark : cardStyles.iconBoxLight,
          ]}
        >
          <AppIcon name="FolderOpen" size={moderateScale(20)} color="#3B82F6" />
        </View>
        <View style={cardStyles.headerText}>
          <Text
            style={[styles.projectName, { color: ct.textPrimary }]}
            numberOfLines={1}
          >
            {item?.project?.name || '—'}
          </Text>
          {!!item.createdAt && (
            <Text style={[styles.dateText, { color: ct.textMuted }]}>
              {formatDisplay(item.createdAt)}
            </Text>
          )}
        </View>
        <View
          style={[cardStyles.badge, { backgroundColor: isDark ? darkBg : bg }]}
        >
          <AppIcon
            name={icon}
            size={moderateScale(11)}
            color={text}
            style={cardStyles.badgeIcon}
          />
          <Text style={[cardStyles.badgeText, { color: text }]}>{item.status}</Text>
        </View>
      </View>
      <View style={[cardStyles.divider, { backgroundColor: ct.divider }]} />
      {!!item.details && (
        <View
          style={[
            cardStyles.contentBlock,
            { backgroundColor: ct.contentBlockBg },
          ]}
        >
          <AppIcon
            name="FileText"
            size={moderateScale(13)}
            color="#6B7280"
            style={cardStyles.contentBlockIcon}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[cardStyles.contentBlockText, { color: ct.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {item.details}
            </Text>
            {item.details.length > 90 && (
              <Text
                onPress={() => setExpanded(!expanded)}
                style={cardStyles.seeMoreText}
              >
                {expanded ? 'See Less' : 'See More'}
              </Text>
            )}
          </View>
        </View>
      )}

      {!!item.employees?.length && (
        <View
          style={[
            cardStyles.contentBlock,
            { backgroundColor: ct.contentBlockBg, marginTop: verticalScale(6) },
          ]}
        >
          <AppIcon
            name="Users"
            size={moderateScale(13)}
            color="#6B7280"
            style={cardStyles.contentBlockIcon}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={[cardStyles.contentBlockText, { color: ct.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {item.employees.map(e => e.name).join(', ')}
            </Text>

            {item.employees.length > 3 && (
              <Text
                onPress={() => setExpanded(!expanded)}
                style={cardStyles.seeMoreText}
              >
                {expanded ? 'See Less' : 'See More'}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ── Mark as Completed Button (only for Pending) ──────────────────── */}
      {item.status === 'Pending' && (
        <>
          <View
            style={[
              cardStyles.divider,
              { backgroundColor: ct.divider, marginTop: verticalScale(8) },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.markCompletedBtn,
              {
                backgroundColor: isDark ? '#002E1C' : '#ECFDF5',
                borderColor: '#065F46',
              },
            ]}
            onPress={() => handleMarkCompleted(item.id)}
            activeOpacity={0.75}
          >
            <AppIcon
              name="CheckCircle"
              size={moderateScale(14)}
              color="#065F46"
            />
            <Text style={styles.markCompletedText}>Mark as Completed</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ProjectRemainingCard;

const styles = StyleSheet.create({
  projectName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateText: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  markCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginTop: verticalScale(4),
  },
  markCompletedText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#065F46',
    letterSpacing: 0.2,
  },
});
