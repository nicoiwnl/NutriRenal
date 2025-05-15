import { useNavigation as useReactNavigation } from '@react-navigation/native';

export function useSimpleNavigation() {
  const navigation = useReactNavigation();

  return {
    navigateTo: (screenName, params = {}) => {
      navigation.navigate(screenName, params);
    },
    goBack: () => navigation.goBack(),
    resetTo: (screenName, params = {}) => {
      navigation.reset({
        index: 0,
        routes: [{ name: screenName, params }],
      });
    }
  };
}
