import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function Footer({ navigation }) {
  return (
    <View style={styles.wrap}>
      <Image source={require('../images/logo-default.png')} style={styles.logo} resizeMode="contain" />
      <Pressable onPress={() => {}}>
        <Text style={styles.link}>Cookieverklaring</Text>
      </Pressable>
      <Pressable onPress={() => {}}>
        <Text style={styles.link}>Disclaimer</Text>
      </Pressable>
      <Pressable onPress={() => {}}>
        <Text style={styles.link}>Privacyverklaring</Text>
      </Pressable>
      <Pressable onPress={() => {}}>
        <Text style={styles.link}>Cookiebeheer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  logo: {
    width: 180,
    height: 48,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  link: {
    fontFamily: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});
