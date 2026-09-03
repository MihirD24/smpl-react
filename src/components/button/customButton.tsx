import React from 'react';
import AppButton from '../AppButton';
export default function CustomButton({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <AppButton label={label} onPress={onPress} disabled={disabled}/>}
