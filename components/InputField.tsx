import {
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Text,
  Image,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { InputFieldProps } from '@/types/type';

const InputField = ({
  labelStyle,
  label,
  icon,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  placeholder,
  style,
  ...props
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, containerStyle]}>
          <Text style={[styles.text, labelStyle]}>
            {label}
          </Text>

          <View
            style={[
              styles.input,
              focused && {
                borderColor: '#7C3AED',
                borderWidth: 2,
                backgroundColor: '#37324F', 
              },
              inputStyle,
            ]}
          >
            {icon && (
              <Image
                source={icon}
                style={[{ width: 22, height: 22, marginLeft: 12, tintColor: '#9ca3af' }, iconStyle]}
                resizeMode="contain"
              />
            )}

            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[
                {
                  flex: 1,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  color: 'white',
                  paddingVertical: 12,     
                  paddingHorizontal: 8,
                },
                style,
              ]}
              secureTextEntry={secureTextEntry}
              placeholder={placeholder}
              placeholderTextColor="#858597"
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    marginBottom: 6,
    color: '#d1d5db',         
  },
  input: {
    height: 56,                
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#2D2D44', 
    borderRadius: 16,
    borderColor: '#4B5563',
    borderWidth: 1.5,
  },
});