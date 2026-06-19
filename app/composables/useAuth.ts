import {
  type AuthUser,
  setTokens,
  saveUser,
  loadUser,
  getRefreshToken,
  clearAuth,
  isLoggedIn as hasToken,
} from "~/utils/auth";

interface VerifyOtpResult {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Auth holati + oqimi (OTP). Telefon raqami sahifalar orasida shu yerda saqlanadi.
export function useAuth() {
  const { post, patch, get, errorMessage } = useApi();

  // Reactive holat (SSR xavfsiz)
  const user = useState<AuthUser | null>("auth_user", () => null);
  const pendingPhone = useState<string>("auth_pending_phone", () => "");

  // Klientda boshlang'ich holatni localStorage'dan tiklash
  if (import.meta.client && !user.value) {
    user.value = loadUser();
  }

  async function sendOtp(phone: string) {
    pendingPhone.value = phone;
    return post("/auth/send-otp", { phone });
  }

  async function verifyOtp(code: string): Promise<VerifyOtpResult> {
    const result = await post<VerifyOtpResult>("/auth/verify-otp", {
      phone: pendingPhone.value,
      code,
    });
    setTokens(result.accessToken, result.refreshToken);
    saveUser(result.user);
    user.value = result.user;
    return result;
  }

  async function completeProfile(fullName: string) {
    const updated = await post<AuthUser>("/auth/complete-profile", { fullName });
    const merged = { ...(user.value as AuthUser), ...updated };
    saveUser(merged);
    user.value = merged;
    return merged;
  }

  async function updateProfile(fullName?: string, language?: string) {
    const updated = await patch<AuthUser>("/auth/me", { fullName, language });
    const merged = { ...(user.value as AuthUser), ...updated };
    saveUser(merged);
    user.value = merged;
    return merged;
  }

  async function fetchMe() {
    const me = await get<AuthUser>("/users/me");
    saveUser(me);
    user.value = me;
    return me;
  }

  async function logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await post("/auth/logout", { refreshToken });
    } catch {
      // logout xatosini e'tiborsiz qoldiramiz
    } finally {
      clearAuth();
      user.value = null;
      await navigateTo("/auth/LoginPage");
    }
  }

  const isLoggedIn = computed(() => Boolean(user.value) || hasToken());

  return {
    user,
    pendingPhone,
    isLoggedIn,
    sendOtp,
    verifyOtp,
    completeProfile,
    updateProfile,
    fetchMe,
    logout,
    errorMessage,
  };
}
