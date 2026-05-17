import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Printer, Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../lib/auth-context';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      setTimeout(() => {
        navigate('/');
      }, 100);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-[#F8FCFC] to-[#E6F1F0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#00736D]/5 to-[#80B9B6]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-[#002E2C]/5 to-[#00736D]/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00736D] to-[#002E2C] rounded-3xl mb-6 shadow-2xl shadow-[#00736D]/30 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00736D] to-[#002E2C] rounded-3xl blur opacity-50"></div>
            <Printer className="w-10 h-10 text-white relative z-10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-5 h-5 text-[#80B9B6]" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#002E2C] via-[#00736D] to-[#002E2C] bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-[#00736D]/80 text-lg">Sign in to continue your journey</p>
        </motion.div>

        {/* Login Card - Modern Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="p-8 sm:p-10 bg-white/80 backdrop-blur-xl border-[#80B9B6]/20 shadow-2xl shadow-[#00736D]/10 relative overflow-hidden">
            {/* Decorative Corner Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E6F1F0] to-transparent rounded-bl-full opacity-50"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/50 rounded-xl flex items-start gap-3 backdrop-blur-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2.5"
              >
                <Label htmlFor="email" className="text-sm font-bold text-[#002E2C] tracking-wide uppercase text-xs">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80B9B6] transition-colors group-focus-within:text-[#00736D]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl bg-white/50 backdrop-blur-sm transition-all text-[#002E2C] font-medium"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2.5"
              >
                <Label htmlFor="password" className="text-sm font-bold text-[#002E2C] tracking-wide uppercase text-xs">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80B9B6] transition-colors group-focus-within:text-[#00736D]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl bg-white/50 backdrop-blur-sm transition-all text-[#002E2C] font-medium"
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#00736D] via-[#00736D] to-[#002E2C] hover:shadow-2xl hover:shadow-[#00736D]/30 hover:-translate-y-0.5 text-white font-bold text-base rounded-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    animate={{ x: loading ? [0, 100, 0] : 0 }}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Signing In...
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#E6F1F0]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/80 text-[#80B9B6] font-semibold text-sm backdrop-blur-sm">OR</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-[#002E2C]/70"
            >
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-bold text-[#00736D] hover:text-[#002E2C] transition-colors relative group"
              >
                Create Account
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00736D] transition-all group-hover:w-full"></span>
              </Link>
            </motion.p>
          </Card>
        </motion.div>

       
      </motion.div>
    </div>
  );
}