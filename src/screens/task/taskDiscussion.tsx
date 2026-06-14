import {
  ScrollView,
  TextInput,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../assets/style/taskDiscussion';
import AppIcon from '../../components/appIcon';
import Config from 'react-native-config';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import ToastUtil from '../../utils/toastAndroid';

interface DiscussionItem {
  sender_id: string;
  name: string;
  message: string;
}

const TaskDiscussion: React.FC<AppStackScreenProps<'TaskDiscussion'>> = ({
  navigation,
  route,
}) => {
  const [discussionData, setDiscussionData] = useState<DiscussionItem[]>([]);
  const [loginUserID, setLoginUserID] = useState('');
  const [discussion, setDiscussion] = useState('');

  const taskDiscussion = async () => {
    const userInfo = (await AsyncStorage.getItem('userInfo')) || '{}';
    const userToken = await AsyncStorage.getItem('userToken');
    setLoginUserID(JSON.parse(userInfo).id);
    let formData = new FormData();
    formData.append('user_id', JSON.parse(userInfo).id);
    formData.append('task_id', route.params?.task_id || '');

    fetch(`${Config.API_BASE_URL}task-discussion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + userToken,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(response => response.json())
      .then(async json => {
        if (json.success) {
          setDiscussionData(json.data);
        } else {
          ToastUtil.info(json.message);
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  const addDiscussion = async () => {
    const userInfo = (await AsyncStorage.getItem('userInfo')) || '{}';
    const userToken = await AsyncStorage.getItem('userToken');
    let formData = new FormData();
    formData.append('user_id', JSON.parse(userInfo).id);
    formData.append('task_id', route.params?.task_id);
    formData.append('message', discussion);

    fetch(`${Config.API_BASE_URL}add-task-discussion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + userToken,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(response => response.json())
      .then(async json => {
        if (json.success) {
          setDiscussion('');
          taskDiscussion();
        } else {
          ToastUtil.info(json.message);
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    taskDiscussion();
    return () => {};
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.chatWrapper}>
          {discussionData.length ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.messagesSection} key={1}>
                {discussionData.map((message, index) => (
                  <View
                    key={index}
                    style={[
                      styles.singleMessage,
                      message.sender_id === loginUserID
                        ? styles.singleMessageRight
                        : styles.singleMessageLeft,
                    ]}
                  >
                    <View
                      style={[
                        message.sender_id === loginUserID
                          ? styles.singleMessageTextRight
                          : styles.singleMessageTextLeft,
                      ]}
                    >
                      <Text style={{ fontWeight: 'bold' }}>{message.name}</Text>
                      <Text style={[]}>{message.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View></View>
          )}
          <View style={styles.bottomSection}>
            <TextInput
              placeholder="Type message"
              placeholderTextColor="gray"
              style={[styles.textInput, { flex: 1 }]}
              value={discussion}
              onChangeText={text => setDiscussion(text)}
            />
            <TouchableOpacity
              style={styles.sendIconWrapper}
              onPress={() => {
                addDiscussion();
              }}
            >
              <AppIcon name="Send" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default TaskDiscussion;
