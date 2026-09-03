import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constant/theme';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean | number;
  safeTop?: boolean;
  safeBottom?: boolean;
  backgroundColor?: string;
  safeAreaTopColor?: string;
  safeAreaBottomColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  statusBarTranslucent?: boolean;
  keyboardAvoiding?: boolean;
  withHeader?: boolean;
}

const ScreenWrapper: React.FC<Props> = ({
  children, scrollable=false, padding=false, safeTop=true, safeBottom=true,
  backgroundColor, safeAreaTopColor, safeAreaBottomColor,
  statusBarStyle, statusBarBackgroundColor, statusBarTranslucent=true,
  keyboardAvoiding=false,
}) => {
  const insets=useSafeAreaInsets();
  const {theme}=useAppTheme();
  const bg=backgroundColor ?? theme.background;
  const horizontal=typeof padding==='number'?padding:padding?16:0;
  const body=scrollable ? (
    <ScrollView contentContainerStyle={[styles.scroll,{paddingHorizontal:horizontal}]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : <View style={[styles.inner,{paddingHorizontal:horizontal}]}>{children}</View>;
  return (
    <View style={[styles.root,{backgroundColor:bg}]}>
      <StatusBar translucent={statusBarTranslucent} backgroundColor={statusBarBackgroundColor ?? 'transparent'} barStyle={statusBarStyle ?? 'dark-content'} />
      {safeTop && <View style={{height:insets.top,backgroundColor:safeAreaTopColor ?? bg}} />}
      {keyboardAvoiding ? <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS==='ios'?'padding':undefined}>{body}</KeyboardAvoidingView> : body}
      {safeBottom && Platform.OS==='ios' && <View style={{height:insets.bottom,backgroundColor:safeAreaBottomColor ?? bg}} />}
    </View>
  );
};
const styles=StyleSheet.create({root:{flex:1},flex:{flex:1},inner:{flex:1},scroll:{flexGrow:1,paddingBottom:24}});
export default ScreenWrapper;
