import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Récupérer le rôle de l'utilisateur
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          // Rediriger vers le portail approprié selon le rôle
          if (profile?.role) {
            switch (profile.role) {
              case 'Infirmier':
              case 'Infirmière':
              case 'Cadre de santé':
                navigate('/nurse-portal');
                break;
              case 'Chef Cuisinier':
              case 'Aide Cuisinier':
              case 'Super Admin':
                navigate('/cook-portal');
                break;
              default:
                // Pour les autres rôles, rediriger vers la page d'accueil
                navigate('/');
            }
          } else {
            // Si pas de profil, rediriger vers la page d'accueil
            navigate('/');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          // En cas d'erreur, rediriger vers la page d'accueil
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Connexion à RepasCDL</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Login;