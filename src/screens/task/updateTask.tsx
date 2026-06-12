/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import formStyles from '../../assets/style/form';
import MainStyle from '../../assets/style/maincss';
import AppIcon from '../../components/appIcon';
import Config from 'react-native-config';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import ToastUtil from '../../utils/toastAndroid';

const UpdateTask: React.FC<AppStackScreenProps<'UpdateTask'>> = ({
  navigation,
  route,
}) => {
  const mainStyles = MainStyle();
  const [refreshing, setRefreshing] = useState(true);
  const [staffData, setStaffData] = useState([]);
  const [departmentData, setdepartmentData] = useState([]);

  const [departmentId, setDepartmentId] = useState('');

  const [title, settitle] = useState(route.params.data.module);
  const [taskDesc, setTaskDesc] = useState(route.params.data.description);
  const [devFeedback, setDevFeedback] = useState('');
  const [taskPriorityStatus, setTaskPriorityStatus] = useState('');
  const [staffId, setStaffId] = useState('');
  const [watcherIds, setWatcherIds] = useState<any[]>([]);
  const [developerList, setDeveloperList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [developerId, setDeveloperId] = useState(route.params.data.description);
  const [loading, setLoading] = useState(true); // For handling notification initialization
  const [search, setsearch] = useState('');
  const [value, setValue] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState({});
  const [selectedTaskPriority, setSelectedTaskPriority] = useState({});
  const [projectId, setProjectId] = useState('');

  const data = [
    { id: 'High', name: 'High' },
    { id: 'Medium', name: 'Medium' },
    { id: 'Low', name: 'Low' },
  ];

  const getTaskDataByID = async () => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const userToken = await AsyncStorage.getItem('userToken');
    let formData = new FormData();
    formData.append('user_id', JSON.parse(userInfo || '{}').id);
    formData.append('task_id', route.params.data.id);

    fetch(`${Config.API_BASE_URL}task-data-by-id`, {
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
        setRefreshing(false);
        setSelectedStaff(json.data.staff);
        setStaffId(json.data.staff.id);

        const regex = /(<([^>]+)>)/gi;
        const task_desc = json.data.task_desc;

        if (task_desc != '' || task_desc != null) {
          setTaskDesc(task_desc.replace(regex, ''));
        } else {
          setTaskDesc('');
        }

        var selectedDepartmentObj = {
          id: json.data.department_id,
          name: json.data.department_name,
        };
        setSelectedDepartment(selectedDepartmentObj);
        setDepartmentId(json.data.department_id);

        var selectedTaskPriorityObj = {
          id: json.data.task_priority_status,
          name: json.data.task_priority_status,
        };
        setSelectedTaskPriority(selectedTaskPriorityObj);
        setTaskPriorityStatus(json.data.task_priority_status);

        var users = [];
        json.data.watchers.map((userData: { id: any }) => {
          setWatcherIds(users => [...users, userData.id]);
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  const getStaffList = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    fetch(`${Config.API_BASE_URL}developers-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + userToken,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(async json => {
        if (json.success) {
          setRefreshing(false);
          setStaffData(json.data);
        } else {
          setStaffData([]);
          ToastUtil.info(json.message);
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  const getProjectList = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    fetch(`${Config.API_BASE_URL}projects-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + userToken,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(async json => {
        if (json.success) {
          setProjectList(json.data);
        } else {
          setProjectList([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  const getDeveloperList = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    fetch(`${Config.API_BASE_URL}developers-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + userToken,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(async json => {
        if (json.success) {
          setDeveloperList(json.data);
        } else {
          setDeveloperList([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  const updateTask = async () => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const userToken = await AsyncStorage.getItem('userToken');
    let formData = new FormData();
    formData.append('edit_id', route.params.data.id);
    formData.append('project_id', projectId);
    formData.append('department_id', departmentId);
    formData.append('module', title);
    formData.append('description', taskDesc);
    formData.append('priority', taskPriorityStatus);
    formData.append('emp_id', staffId);
    formData.append('supporting_staff_id', developerId);
    formData.append('remarks', remarks);
    formData.append('estimated_minutes', estimatedTime);

    fetch(`${Config.API_BASE_URL}work-log-update`, {
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
          navigation.navigate('TabNavigator', {
            screen: 'Home',
          });
        } else {
          ToastUtil.info(json.message);
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    getTaskDataByID();
    getStaffList();
    getDeveloperList();
    getProjectList();
    return () => {};
  }, []);

  return (
    <>
      <ScrollView>
        <View style={mainStyles.BottomView}>
          <View>
            <Text style={mainStyles.formlabel}>Project</Text>
            <Dropdown
              style={mainStyles.dropdown}
              placeholderStyle={mainStyles.placeholderStyle}
              selectedTextStyle={mainStyles.selectedTextStyle}
              inputSearchStyle={mainStyles.inputSearchStyle}
              itemTextStyle={mainStyles.itemTextStyle}
              iconStyle={mainStyles.iconStyle}
              data={projectList}
              search
              maxHeight={250}
              labelField="project_name"
              valueField="id"
              placeholder="Select Department"
              searchPlaceholder="Search..."
              value={projectId}
              onChange={item => {
                setProjectId(item.id);
              }}
              renderLeftIcon={() => (
                <AppIcon
                  name="Clipboard"
                  size={20}
                  color="#232323"
                  style={formStyles.icon}
                />
              )}
            />
          </View>
          <View>
            <Text style={mainStyles.formlabel}>Module</Text>
            <TextInput
              placeholder="Module"
              placeholderTextColor={'#c0c0c0'}
              value={title}
              style={mainStyles.textInput}
              onChangeText={text => settitle(text)}
            />
          </View>
          <View>
            <Text style={mainStyles.formlabel}>Task Description</Text>
            <TextInput
              placeholder="Task Description"
              placeholderTextColor={'#c0c0c0'}
              multiline={true}
              numberOfLines={4}
              value={taskDesc}
              style={mainStyles.textArea}
              onChangeText={text => setTaskDesc(text)}
            />
          </View>

          <View>
            <Text style={mainStyles.formlabel}>Lead Developer</Text>
            <Dropdown
              style={mainStyles.dropdown}
              placeholderStyle={mainStyles.placeholderStyle}
              selectedTextStyle={mainStyles.selectedTextStyle}
              inputSearchStyle={mainStyles.inputSearchStyle}
              itemTextStyle={mainStyles.itemTextStyle}
              iconStyle={mainStyles.iconStyle}
              data={staffData}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Select Staff"
              searchPlaceholder="Search..."
              value={staffId}
              onChange={item => {
                setStaffId(item.id);
              }}
              renderLeftIcon={() => (
                <AppIcon
                  name="User"
                  size={20}
                  color="#232323"
                  style={formStyles.icon}
                />
              )}
            />
          </View>

          <View>
            <Text style={mainStyles.formlabel}>Supporting Developer</Text>
            <MultiSelect
              style={mainStyles.dropdown}
              placeholderStyle={mainStyles.placeholderStyle}
              selectedTextStyle={mainStyles.selectedTextStyle}
              inputSearchStyle={mainStyles.inputSearchStyle}
              itemTextStyle={mainStyles.itemTextStyle}
              iconStyle={mainStyles.iconStyle}
              search
              data={staffData}
              labelField="name"
              valueField="id"
              placeholder="Select Task watcher"
              searchPlaceholder="Search..."
              value={developerId}
              onChange={item => {
                setDeveloperId(item);
              }}
              renderLeftIcon={() => (
                <AppIcon
                  name="User"
                  size={20}
                  color="#232323"
                  style={formStyles.icon}
                />
              )}
              selectedStyle={mainStyles.selectedStyle}
            />
          </View>
          <View>
            <Text style={mainStyles.formlabel}>Task Priority</Text>
            <Dropdown
              style={mainStyles.dropdown}
              placeholderStyle={mainStyles.placeholderStyle}
              selectedTextStyle={mainStyles.selectedTextStyle}
              inputSearchStyle={mainStyles.inputSearchStyle}
              itemTextStyle={mainStyles.itemTextStyle}
              iconStyle={mainStyles.iconStyle}
              data={data}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Select Priority"
              searchPlaceholder="Search..."
              value={taskPriorityStatus}
              onChange={item => {
                setTaskPriorityStatus(item.id);
              }}
              renderLeftIcon={() => (
                <AppIcon
                  name="Eye"
                  size={20}
                  color="#232323"
                  style={formStyles.icon}
                />
              )}
            />
          </View>

          <View>
            <Text style={mainStyles.formlabel}>Estimated Hours</Text>
            <TextInput
              placeholder="Estimated Hours"
              placeholderTextColor={'#c0c0c0'}
              value={estimatedTime}
              style={mainStyles.textInput}
              onChangeText={text => setEstimatedTime(text)}
            />
          </View>

          <View>
            <Text style={mainStyles.formlabel}>Remarks</Text>
            <TextInput
              placeholder="Remarks"
              placeholderTextColor={'#c0c0c0'}
              value={remarks}
              style={mainStyles.textInput}
              onChangeText={text => setRemarks(text)}
            />
          </View>

          <View>
            <Text style={mainStyles.formlabel}>Developer Feedback</Text>
            <TextInput
              placeholder="Task Description"
              placeholderTextColor={'#c0c0c0'}
              multiline={true}
              numberOfLines={4}
              value={devFeedback}
              style={mainStyles.textArea}
              onChangeText={text => setDevFeedback(text)}
            />
          </View>

          <View>
            <TouchableOpacity
              onPress={() => {
                updateTask();
              }}
              style={[mainStyles.button]}
            >
              <Text style={mainStyles.buttonLable}> Update Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default UpdateTask;
