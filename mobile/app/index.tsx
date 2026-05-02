import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../lib/api';
import { C } from '../constants/colors';

export default function LoginScreen() {
  const { login, loginAsGuest } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your application number and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(username.trim(), password);
      if (data.success) {
        await login(
          { accessToken: data.accessToken, sessionId: data.sessionId, sessionTime: data.sessionTime },
          data.profile
        );
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials. Please try again.');
      }
    } catch (e: any) {
      Alert.alert(
        'Connection Error',
        'Could not reach the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    await loginAsGuest();
    setGuestLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Ionicons name="school" size={32} color={C.primary} />
          </View>
          <Text style={s.logoText}>Unibuddy</Text>
          <Text style={s.tagline}>SRMAP Attendance Intelligence</Text>
        </View>

        <View style={s.features}>
          {[
            { icon: 'shield-checkmark-outline', text: 'Smart bunk estimation' },
            { icon: 'flash-outline', text: 'Real-time class tracker' },
            { icon: 'analytics-outline', text: '75% compliance alerts' },
          ].map(({ icon, text }) => (
            <View key={text} style={s.featureItem}>
              <Ionicons name={icon as any} size={14} color={C.primary} />
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.formTitle}>Student Login</Text>
          <Text style={s.formSub}>Use your SRMAP portal credentials</Text>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Application Number</Text>
            <View style={[s.inputBox, focused === 'user' && s.inputFocused]}>
              <Ionicons name="id-card-outline" size={16} color={focused === 'user' ? C.primary : C.textDim} />
              <TextInput
                style={s.input}
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. AP22110010000"
                placeholderTextColor={C.textDim}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('user')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Password</Text>
            <View style={[s.inputBox, focused === 'pw' && s.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={16} color={focused === 'pw' ? C.primary : C.textDim} />
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Portal password"
                placeholderTextColor={C.textDim}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                onFocus={() => setFocused('pw')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={16} color={C.textDim} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[s.loginBtn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.loginBtnText}>Login to Portal</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>or</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity
            style={s.guestBtn}
            onPress={handleGuest}
            disabled={guestLoading}
            activeOpacity={0.8}
          >
            {guestLoading ? (
              <ActivityIndicator color={C.primary} />
            ) : (
              <>
                <Ionicons name="person-outline" size={16} color={C.primary} />
                <Text style={s.guestBtnText}>Explore as Guest</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            Your credentials are sent directly to SRM's portal. We don't store passwords.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 60, paddingBottom: 30 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: C.textMuted, marginTop: 4, fontWeight: '600', letterSpacing: 0.5 },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 28 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featureText: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
  },
  formTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  formSub: { fontSize: 12, color: C.textMuted, marginBottom: 22 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.textMuted, marginBottom: 6, letterSpacing: 0.4 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    gap: 10,
    height: 48,
  },
  inputFocused: { borderColor: C.primary },
  input: { flex: 1, color: C.text, fontSize: 14, height: '100%' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 50,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divText: { fontSize: 11, color: C.textDim, fontWeight: '600' },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    height: 48,
  },
  guestBtnText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  disclaimer: { fontSize: 10, color: C.textDim, textAlign: 'center', marginTop: 16, lineHeight: 15 },
});
