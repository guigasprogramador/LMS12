
import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";
import { adaptSupabaseUser } from "@/utils/userAdapter";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAdmin: () => false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para garantir que o papel de admin esteja definido no JWT
  const ensureAdminRole = async (currentUser: User | null) => {
    if (!currentUser) return;

    // Verifica se o usuário é admin com base no email
    if (currentUser.email === "guigasprogramador@gmail.com" || 
        currentUser.email === "admin@example.com") {
      console.log("Definindo papel de admin para", currentUser.email);
      try {
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        // Recarrega a sessão para obter o token JWT atualizado
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (data.session) {
          setUser(adaptSupabaseUser(data.session.user));
        }
        console.log("Papel de admin definido com sucesso no JWT");
      } catch (error) {
        console.error("Erro ao definir papel de admin:", error);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const adaptedUser = adaptSupabaseUser(session?.user ?? null);
        setUser(adaptedUser);
        
        // Verifica e atualiza o papel de admin quando o estado de autenticação muda
        if (session && adaptedUser) {
          setTimeout(() => {
            ensureAdminRole(adaptedUser);
          }, 0);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const adaptedUser = adaptSupabaseUser(session?.user ?? null);
      setUser(adaptedUser);
      
      // Verifica e atualiza o papel de admin na inicialização
      if (session && adaptedUser) {
        ensureAdminRole(adaptedUser);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = (): boolean => {
    if (!user) return false;
    
    console.log("Verificando permissões de admin para usuário:", user);
    console.log("Role do usuário:", user.role);
    console.log("Email do usuário:", user.email);
    
    // Check for admin role in user metadata
    if (user.role === "admin") {
      console.log("Usuário é admin por papel (role)");
      return true;
    }
    
    // Caso especial para o usuário com email específico
    if (user.email === "guigasprogramador@gmail.com") {
      console.log("Usuário é admin por email específico");
      return true;
    }
    
    // Fallback para o teste
    if (user.email === "admin@example.com") {
      console.log("Usuário é admin pelo email de teste");
      return true;
    }
    
    console.log("Usuário NÃO é admin");
    return false;
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Tentando login com:", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log("Login bem-sucedido");
      
      // Após o login bem-sucedido, verifica se o usuário é admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const adaptedUser = adaptSupabaseUser(user);
        await ensureAdminRole(adaptedUser);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("Tentando registrar com:", email, name);
      
      // Register the user com o papel padrão de 'student'
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student', // Define o papel padrão como 'student'
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Se for um email de administrador, atualize o papel para 'admin'
      if (email === 'admin@example.com' || email === 'guigasprogramador@gmail.com') {
        console.log("Definindo usuário como admin:", email);
        if (data.user) {
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
        }
      }
      
      console.log("Registro bem-sucedido");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Erro ao registrar: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Erro ao sair: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
