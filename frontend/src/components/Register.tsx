import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Chrome, User, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/services/api'

interface RegisterProps {
  onRegisterSuccess: (user: any) => void
  onSwitchToLogin: () => void
}

export default function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        register_number: rollNumber.trim(),
        password,
        confirm_password: confirmPassword,
      })

      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      onRegisterSuccess(response.data.user)
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 relative z-10">
        {/* Left Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">MentorAI</h1>
              <p className="text-slate-400 text-sm">Your AI Academic Mentor</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Start Your Learning Journey Today
              </h2>
              <p className="text-lg text-slate-400">
                Join thousands of students using AI to achieve their academic goals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Personalized</h3>
                <p className="text-sm text-slate-400">Tailored to your learning style</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Smart Analytics</h3>
                <p className="text-sm text-slate-400">Track your progress in real-time</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-slate-400">Join MentorAI and start learning smarter</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="text-sm font-medium text-slate-300">
                  Roll Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="e.g., 24CY001"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Create Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 4 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                disabled={loading || !rollNumber || !password || !confirmPassword}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-900/50 text-slate-400">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Sign up with Google
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>© 2026 MentorAI. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
