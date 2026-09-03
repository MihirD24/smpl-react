import React, {useCallback} from 'react';
import {Pressable, PressableProps} from 'react-native';
import Animated,{useAnimatedStyle,useSharedValue,withTiming} from 'react-native-reanimated';
const AnimatedPressable=React.forwardRef<any,PressableProps>(({style,children,disabled,onPressIn,onPressOut,...props},ref)=>{
  const p=useSharedValue(0);
  const onIn=useCallback((e:any)=>{p.value=withTiming(1,{duration:100});onPressIn?.(e)},[onPressIn,p]);
  const onOut=useCallback((e:any)=>{p.value=withTiming(0,{duration:150});onPressOut?.(e)},[onPressOut,p]);
  const a=useAnimatedStyle(()=>({transform:[{scale:1-p.value*.018}],opacity:disabled?.48:1-p.value*.05}));
  return <Animated.View ref={ref} style={a}><Pressable {...props} disabled={disabled} onPressIn={onIn} onPressOut={onOut} style={style}>{children}</Pressable></Animated.View>;
});
AnimatedPressable.displayName='AnimatedPressable';
export default AnimatedPressable;
