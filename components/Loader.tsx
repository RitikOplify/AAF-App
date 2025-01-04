import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";


const Loader = () => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true, // Optimized for performance
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [rotateValue]);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex justify-center items-center h-full">
      <Animated.View
        style={[
          {
            transform: [{ rotate: rotateInterpolation }],
          },
        ]}
        className="w-16 h-16 rounded-full border-4 border-gray-300 border-t-red-500"
      ></Animated.View>
    </View>
  );
};

export default Loader;
