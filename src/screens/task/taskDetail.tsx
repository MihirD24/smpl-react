import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
  getSingleTaskDetail,
  updateStartStopWork,
  updateTaskStatus,
} from '../../services';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import AppIcon from '../../components/appIcon';
import ToastUtil from '../../utils/toastAndroid';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import moment from 'moment';
import ScreenWrapper from '../../components/screenWrapper';
import { CommonActions } from '@react-navigation/native';
import NetInfoComponent from '../../components/netinfoComponent';
import { checkPunch } from '../../services';
const getStatusColors = (status: string) => {
  switch (status) {
    case 'Pending':
      return { bg: '#EEF2FF', text: '#4A6CF7' };
    case 'Working':
      return { bg: '#FFF8E1', text: '#F9A825' };
    case 'Completed By Developer':
      return { bg: '#E8F5E9', text: '#43A047' };
    case 'Re Open':
      return { bg: '#FFE8E8', text: '#E53935' };
    default:
      return { bg: '#F5F5F5', text: '#757575' };
  }
};

export const resetToHome = navigation => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'TabNavigator',
          state: {
            routes: [{ name: 'Home' }],
          },
        },
      ],
    }),
  );
};

const TaskDetail: React.FC<AppStackScreenProps<'TaskDetail'>> = ({
  navigation,
  route,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [singleTaskData, setSingleTaskData] = useState<any>({});
  const [developerFeedback, setDeveloperFeedback] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  const checkPunchStatus = async () => {
  const dateObj = new Date();
  const formattedDate = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
  const punchData = await checkPunch(formattedDate);
  // Punched in = has in_time but no out_time
  const punched = !!punchData?.in_time && !punchData?.out_time;
  setIsPunchedIn(punched);
};

  const passedData = route.params?.data ?? {};

  const loadUserRole = async () => {
    const raw = await AsyncStorage.getItem('userInfo');
    if (raw) setUserRole(JSON.parse(raw).role);
  };

  const fmtMins = (mins: number): string => {
    if (mins === 0) return '0';
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}hr`;
    return `${h}hr ${m}min`;
  };

  const loadTaskDetail = async () => {
    setLoading(true);
    const data = await getSingleTaskDetail(passedData?.work_log_id);

    if (data) setSingleTaskData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUserRole();
    loadTaskDetail();
    checkPunchStatus();
  }, []);

  const openModal = (action: string) => {
    setModalAction(action);
    setDeveloperFeedback('');
    setModalVisible(true);
  };

  const handleDirectStart = async () => {
      if (!isPunchedIn) {
    ToastUtil.info('Please punch in first before starting work');
    return;
  }
    setSubmitting(true);

    const response = await updateStartStopWork(
      passedData?.work_log_id,
      '', // no feedback
      'start',
    );

    setSubmitting(false);

    if (response?.success) {
      ToastUtil.success('Work started successfully');
      // navigation.replace('TabNavigator', { screen: 'Home' });
      resetToHome(navigation);
    } else {
      ToastUtil.info(response?.message ?? 'Something went wrong');
    }
  };
  const handleModalSubmit = async () => {
    // 🚨 Require remarks for specific actions
    const isRemarksRequired =
      modalAction === 'stop' ||
      modalAction === 'Completed By Developer' ||
      modalAction === 'Re Open';

    if (isRemarksRequired && !developerFeedback.trim()) {
      ToastUtil.info('Please add remarks before submitting');
      return;
    }

    setSubmitting(true);

    try {
      if (modalAction === 'start') {
        await handleStartStop('start');
      } else if (modalAction === 'stop') {
        await handleStartStop('stop');
      } else if (modalAction === 'Completed By Developer') {
        await handleStatusUpdate('Completed By Developer');
      } else if (modalAction === 'Re Open') {
        await handleStatusUpdate('Re Open');
      }
    } finally {
      setSubmitting(false);
      setModalVisible(false);
    }
  };

  const handleStartStop = async (type: string) => {
    const response = await updateStartStopWork(
      passedData?.work_log_id,
      developerFeedback,
      type,
    );
    if (response?.success) {
      ToastUtil.success(
        type === 'start'
          ? 'Work started successfully'
          : 'Work stopped successfully',
      );
      // navigation.navigate('TabNavigator', { screen: 'Home' });
      resetToHome(navigation);
    } else {
      ToastUtil.info(response?.message ?? 'Something went wrong');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    const response = await updateTaskStatus(
      passedData?.work_log_id,
      developerFeedback,
      status,
    );
    if (response?.success) {
      ToastUtil.success(`Status updated to "${status}"`);
      // navigation.navigate('TabNavigator', { screen: 'Home' });
      resetToHome(navigation);
    } else {
      ToastUtil.info(response?.message ?? 'Something went wrong');
    }
  };

  const currentStatus = singleTaskData?.status ?? passedData?.status ?? '';
  const isCompleted = currentStatus === 'Completed By Developer';

  const buttonStatus = singleTaskData?.button_status ?? '';

  const sessions = singleTaskData?.developer_details ?? [];
  const statusColors = getStatusColors(currentStatus);

  const renderButtons = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginVertical: verticalScale(16) }}
        />
      );
    }

    if (
      userRole === 'Employee' &&
      !isCompleted &&
      currentStatus !== 'Pending'
    ) {
      if (buttonStatus === 'Stop') {
        return (
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.btn, styles.btnRed]}
              onPress={() => openModal('stop')}
            >
              <AppIcon name="StopCircle" size={16} color="#FFF" />
              <Text style={styles.btnText}>WORK STOP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGreen]}
              onPress={() => openModal('Completed By Developer')}
            >
              <AppIcon name="CheckCircle" size={16} color="#FFF" />
              <Text style={styles.btnText}>COMPLETE REQUEST</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (buttonStatus === 'Start') {
        return (
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#3B82F6' }]}
              disabled={submitting}
              onPress={() => handleDirectStart()}
            >
              <AppIcon name="Play" size={16} color="#FFF" />
              <Text style={styles.btnText}>START WORK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGreen]}
              onPress={() => openModal('Completed By Developer')}
            >
              <AppIcon name="CheckCircle" size={16} color="#FFF" />
              <Text style={styles.btnText}>COMPLETE REQUEST</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    if (userRole === 'Employee' && currentStatus === 'Pending') {
      return (
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#3B82F6' }]}
            disabled={submitting}
            onPress={() => handleDirectStart()}
          >
            <AppIcon name="Play" size={16} color="#FFF" />
            <Text style={styles.btnText}>START WORK</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (userRole === 'Owner' && isCompleted) {
      return (
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnOutline,
              { borderColor: colors.primary },
            ]}
            onPress={() => openModal('Re Open')}
          >
            <AppIcon name="RotateCcw" size={16} color={colors.primary} />
            <Text style={[styles.btnText, { color: colors.primary }]}>
              REOPEN TASK
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const hasActiveSession = sessions.some((s: any) => s.end_time === null);
  const sectionTitle = hasActiveSession
    ? 'ACTIVE SESSION'
    : 'COMPLETION SUMMARY';

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={loadTaskDetail} />
      <ScrollView
        style={[styles.root, isDarkMode && styles.rootDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status + ID row ── */}
        <View style={styles.statusRow}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColors.text }]}
            />
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {currentStatus.toUpperCase()}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <AppIcon name="Wrench" size={16} color={colors.primary} />
            <Text style={[styles.statusText, { color: '#98A6BA' }]}>
              {singleTaskData?.work_type ?? passedData?.work_type ?? '—'}
            </Text>
          </View>
        </View>

        {/* ── Module + Work Type (2 separate cards in row) ── */}
        <View style={styles.row}>
          <View style={[styles.halfCard, isDarkMode && styles.infoCardDark]}>
            <View style={styles.infoCardLabelRow}>
              <AppIcon name="Layers" size={16} color="#2563EB" />
              <Text style={styles.infoCardLabel}>MODULE</Text>
            </View>

            <Text style={[styles.infoCardValue, isDarkMode && styles.textDark]}>
              {singleTaskData?.project_work_module?.name ?? '—'}
            </Text>
          </View>
          <View style={[styles.halfCard, isDarkMode && styles.infoCardDark]}>
            <View style={styles.infoCardLabelRow}>
              <AppIcon name="Laptop" size={16} color="#2563EB" />
              <Text style={styles.infoCardLabel}>PROJECT</Text>
            </View>

            <Text style={[styles.infoCardValue, isDarkMode && styles.textDark]}>
              {passedData.project_name ??
                passedData?.parent_work_log?.project?.project_name ??
                '—'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          {/* Module Card */}
          <View style={[styles.halfCard, isDarkMode && styles.infoCardDark]}>
            <View style={styles.infoCardLabelRow}>
              <AppIcon name="Clock" size={16} color="#2563EB" />
              <Text style={styles.infoCardLabel}>ESTIMATED TIME</Text>
            </View>

            <Text style={[styles.estimatedTime, isDarkMode && styles.textDark]}>
              {fmtMins(
                singleTaskData?.estimated_minutes ?? passedData?.estimated_minutes,
              )}
            </Text>
          </View>

          {/* Work Type Card */}
          <View style={[styles.halfCard, isDarkMode && styles.infoCardDark]}>
            <View style={styles.infoCardLabelRow}>
              <AppIcon name="AlarmClock" size={16} color="#2563EB" />
              <Text style={styles.infoCardLabel}>Running Time</Text>
            </View>

            <Text style={[styles.estimatedTime, isDarkMode && styles.textDark]}>
              {fmtMins(
                singleTaskData?.total_minutes ?? passedData?.total_minutes,
              )}
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
          <View style={styles.infoCardLabelRow}>
            <AppIcon name="FileText" size={16} color="#2563EB" />
            <Text style={styles.infoCardLabel}>TASK DESCRIPTION</Text>
          </View>
          <Text
            style={[
              styles.infoCardValue,
              isDarkMode && styles.textDark,
              { fontWeight: '600' },
            ]}
          >
            {singleTaskData?.description ?? passedData?.description ?? ''}
          </Text>
        </View>

        {renderButtons()}

        <View
          style={[
            styles.completionCard,
            isDarkMode && styles.completionCardDark,
          ]}
        >
          <View style={styles.completionHeader}>
            <AppIcon name="RotateCcw" size={16} color="#94A3B8" />
            <Text style={styles.completionTitle}>{sectionTitle}</Text>
          </View>

          {sessions.length === 0 ? (
            <View style={styles.completionBody}>
              <Text style={styles.completionLabel}>STARTED AT</Text>
              <Text
                style={[
                  styles.completionValue,
                  { color: isDarkMode ? '#F0F0F0' : '#1A1A2E' },
                ]}
              >
                —
              </Text>
              <Text style={styles.completionLabel}>ENDED AT</Text>
              <Text
                style={[
                  styles.completionValue,
                  { color: isDarkMode ? '#F0F0F0' : '#1A1A2E' },
                ]}
              >
                —
              </Text>

              <Text style={[styles.completionLabel, { marginTop: 12 }]}>
                REMARKS
              </Text>

              <View style={styles.remarksBoxNew}>
                <Text style={styles.remarksTextNew}>
                  No remarks added for this session yet...
                </Text>
              </View>
            </View>
          ) : (
            sessions.map((item: any, index: number) => (
              <View key={index} style={styles.completionBody}>
                <Text style={styles.completionLabel}>STARTED AT</Text>
                <Text
                  style={[
                    styles.completionValue,
                    { color: isDarkMode ? '#F0F0F0' : '#1A1A2E' },
                  ]}
                >
                  {item?.start_time
                    ? moment(item.start_time).isValid()
                      ? moment(item.start_time).format('DD-MM-YYYY hh:mm:ss a')
                      : '--'
                    : '--'}{' '}
                </Text>
                <Text style={[styles.completionLabel, { marginTop: 12 }]}>
                  ENDED AT
                </Text>
                <Text
                  style={[
                    styles.completionValue,
                    { color: isDarkMode ? '#F0F0F0' : '#1A1A2E' },
                    { marginTop: 4 },
                  ]}
                >
                  {item?.end_time
                    ? moment(item.end_time).isValid()
                      ? moment(item.end_time).format('DD-MM-YYYY hh:mm:ss a')
                      : '--'
                    : '--'}
                </Text>

                <Text style={[styles.completionLabel, { marginTop: 12 }]}>
                  REMARKS
                </Text>

                <View style={styles.remarksBoxNew}>
                  <Text style={styles.remarksTextNew}>
                    {item?.devloper_feedback ||
                      'No remarks added for this session yet...'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={'padding'}
                style={[
                  styles.modalContent,
                  isDarkMode && styles.modalContentDark,
                ]}
              >
                <View style={styles.modalHandle} />

                <Text
                  style={[styles.modalTitle, isDarkMode && styles.textDark]}
                >
                  {modalAction === 'start'
                    ? 'Start Work'
                    : modalAction === 'stop'
                    ? 'Stop Work'
                    : modalAction === 'Re Open'
                    ? 'Reopen Task'
                    : 'Complete Request'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Add a note about this session
                </Text>

                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && styles.modalInputDark,
                  ]}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#888"
                  value={developerFeedback}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={setDeveloperFeedback}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.modalBtnText, { color: '#555' }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor:
                          modalAction === 'start'
                            ? '#3B82F6'
                            : modalAction === 'stop'
                            ? '#E53935'
                            : modalAction === 'Re Open'
                            ? colors.primary
                            : '#43A047',
                        opacity:
                          (modalAction === 'stop' ||
                            modalAction === 'Completed By Developer' ||
                            modalAction === 'Re Open') &&
                          !developerFeedback.trim()
                            ? 0.5
                            : 1,
                      },
                    ]}
                    onPress={handleModalSubmit}
                    disabled={
                      submitting ||
                      ((modalAction === 'stop' ||
                        modalAction === 'Completed By Developer' ||
                        modalAction === 'Re Open') &&
                        !developerFeedback.trim())
                    }
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={[styles.modalBtnText, { color: '#FFF' }]}>
                        Submit
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScreenWrapper>
  );
};
export default TaskDetail;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  rootDark: {
    backgroundColor: '#12121E',
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(40),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
    gap: scale(5),
  },
  statusDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCardDark: {
    backgroundColor: '#1E1E2E',
  },
  infoCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginBottom: verticalScale(6),
  },
  infoCardLabel: {
    fontSize: moderateScale(10),
    fontFamily: 'PTSans-Bold',
    color: '#94A3B8',
    letterSpacing: 1,
    fontWeight: '700',
  },
  infoCardValue: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    color: '#1A1A2E',
    fontWeight: '700',
    marginTop: verticalScale(6),
  },
  estimatedTime: {
    fontSize: moderateScale(22),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: verticalScale(6),
  },
  buttonSection: {
    gap: verticalScale(10),
    marginBottom: verticalScale(16),
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
  },
  btnText: {
    fontSize: moderateScale(14),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  btnGreen: {
    backgroundColor: '#43A047',
  },
  btnRed: {
    backgroundColor: '#E53935',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  completionCard: {
    backgroundColor: '#F4F8FE',
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginTop: verticalScale(10),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D6E4FF',
  },
  completionCardDark: {
    backgroundColor: '#1E1E2E',
    borderColor: '#3A3A4D',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    gap: scale(6),
  },
  completionTitle: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    color: '#64748B',
    letterSpacing: 1,
    fontWeight: '700',
  },
  completionBody: {
    marginTop: verticalScale(6),
  },
  completionLabel: {
    fontSize: moderateScale(10),
    fontFamily: 'PTSans-Bold',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  completionValue: {
    fontSize: moderateScale(13),
    fontFamily: 'PTSans-Bold',
    marginTop: verticalScale(4),
  },
  remarksBoxNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginTop: verticalScale(6),
  },
  remarksTextNew: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Regular',
    color: '#64748B',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    paddingBottom: verticalScale(32),
  },
  modalContentDark: {
    backgroundColor: '#1E1E2E',
  },
  modalHandle: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: verticalScale(4),
  },
  modalSubtitle: {
    fontSize: moderateScale(13),
    fontFamily: 'PTSans-Regular',
    color: '#888',
    marginBottom: verticalScale(14),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    fontSize: moderateScale(14),
    fontFamily: 'PTSans-Regular',
    color: '#333',
    minHeight: verticalScale(100),
    backgroundColor: '#FAFAFA',
    marginBottom: verticalScale(16),
  },
  modalInputDark: {
    borderColor: '#333',
    backgroundColor: '#2A2A3E',
    color: '#EEE',
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(10),
  },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(13),
    borderRadius: moderateScale(10),
  },
  modalBtnCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalBtnText: {
    fontSize: moderateScale(14),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
  },
  textDark: {
    color: '#F0F0F0',
  },
});
