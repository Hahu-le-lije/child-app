import { View,  ViewProps, StyleProp, ViewStyle,StyleSheet} from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SafeProps = {
  style?: StyleProp<ViewStyle>;
} & ViewProps;
const SafeAreaComponent: React.FC<SafeProps> = ({style,...props}) => {
    const insets=useSafeAreaInsets();
  return (
    <View
    style={
        [
            {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            },
            styles.container
            ,
            style,
        ]
    }
    {...props}
    />
  )
}

export default SafeAreaComponent
const styles = StyleSheet.create({
    container:{
        backgroundColor:"#1F1F39",
        height:"100%",
        width:"100%",
    }
})