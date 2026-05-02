import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'
import LoanEligibility from './components/LoanEligibility'
import LoanApplication from './components/LoanApplication'
import LoanResult from './components/LoanResult'
import FinancialLiteracy from './components/FinancialLiteracy'
import Profile from './components/Profile'
import { ShootingStars } from './components/ui/shooting-stars'
import { StarsBackground } from './components/ui/stars-background'
import { supabase } from './lib/supabase'
import { TranslationProvider, useTranslation } from './contexts/TranslationContext'
import TranslatedText from './components/ui/TranslatedText'
import { Toaster } from 'react-hot-toast'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { currentLanguage } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 relative overflow-hidden">
      <StarsBackground />
      <ShootingStars />
      <div className="w-full h-screen flex items-center justify-center relative z-10">
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/20">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              <TranslatedText text="Welcome Back" />
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-2">
              <TranslatedText text="Sign in to your account" />
            </p>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <TranslatedText text={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                <TranslatedText text="Email Address" />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                placeholder={currentLanguage === 'en-IN' ? "Enter your email" : ""}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                <TranslatedText text="Password" />
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                placeholder={currentLanguage === 'en-IN' ? "Enter your password" : ""}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-200">
                  <TranslatedText text="Remember me" />
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 mt-2 sm:mt-0"
              >
                <TranslatedText text="Forgot password?" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TranslatedText text={loading ? 'Signing in...' : 'Sign in'} />
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-gray-300 mt-6">
            <TranslatedText text="Don't have an account?" />{' '}
            <a
              href="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              <TranslatedText text="Sign up" />
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <TranslationProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/eligibility" element={session ? <LoanEligibility /> : <Navigate to="/login" />} />
          <Route path="/application" element={session ? <LoanApplication /> : <Navigate to="/login" />} />
          <Route path="/result" element={session ? <LoanResult /> : <Navigate to="/login" />} />
          <Route path="/literacy" element={session ? <FinancialLiteracy /> : <Navigate to="/login" />} />
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </TranslationProvider>
  )
}

export default App
