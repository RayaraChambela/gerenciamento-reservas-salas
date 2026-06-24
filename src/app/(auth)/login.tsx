import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const rawScheme = useColorScheme();
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Cabeçalho com ícone */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>🏢</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Reserva de Salas</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            Gerencie espaços com facilidade
          </Text>
        </View>

        {/* Card do formulário */}
        <View style={[styles.card, {
          backgroundColor: isDark ? colors.backgroundElement : '#fff',
          shadowColor: isDark ? 'transparent' : '#000',
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Entrar</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>E-mail</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDark ? colors.background : '#F5F7FA',
                color: colors.text,
                borderColor: isDark ? '#333' : '#E0E4EA',
              }]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Senha</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDark ? colors.background : '#F5F7FA',
                color: colors.text,
                borderColor: isDark ? '#333' : '#E0E4EA',
              }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Não tem conta?{' '}
          </Text>
          <Link href="/(auth)/register">
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  iconText: { fontSize: 36 },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1976D2',
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, color: '#1976D2', fontWeight: '600' },
});
