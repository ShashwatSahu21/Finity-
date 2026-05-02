import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Menu, MenuItem, HoveredLink, NavButton } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'
import TranslatedText from './ui/TranslatedText'
import { Link } from 'react-router-dom'
import { useTranslation } from '../contexts/TranslationContext'
import { translateToEnglish, detectLanguage } from '../lib/sarvamTranslate'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen w-screen bg-neutral-900 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-blue-500 border-t-transparent"></div>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Good night'
}

function TranslatedTextArea({ value, onChange, rows, required }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows: number
  required: boolean
}) {
  const { currentLanguage } = useTranslation()

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        className="w-full p-4 text-lg rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        placeholder="Tell me what you'd like to do..."
      />
      <div className="sr-only">
        <TranslatedText text="Tell me what you'd like to do..." />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInput, setUserInput] = useState('')
  const [intent, setIntent] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname === path
  }

  const isServiceActive = () => {
    return ['/eligibility', '/application', '/literacy'].includes(location.pathname)
  }

  useEffect(() => {
    async function loadUserData() {
      try {
        setError(null)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        if (authUser) {
          // First try to get the profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
            
          if (profileError) throw profileError
          setUser(profile)
        }
      } catch (error: any) {
        setError(error.message)
      } finally {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      }
    }

    loadUserData()
  }, [])

  const analyzeIntent = (input: string) => {
    const lowerInput = input.toLowerCase()
    
    // Specific loan type patterns
    const loanTypePatterns = [
      'home loan', 'car loan', 'personal loan', 'business loan',
      'education loan', 'student loan', 'vehicle loan', 'auto loan',
      'mortgage', 'housing loan', 'property loan'
    ]

    // General loan query patterns
    const generalLoanPatterns = [
      'loan', 'borrow money', 'borrowing', 'need money',
      'financial help', 'monetary help', 'credit', 'finance',
      'money lender', 'lending'
    ]
    
    // Eligibility-related patterns
    const eligibilityPatterns = [
      'check', 'eligible', 'qualify', 'affect my eligibility',
      'income history', 'job switch', 'employment history',
      'work history', 'will that affect', 'can i get',
      'am i eligible', 'salary', 'fixed', 'irregular income',
      'self-employed', 'type of loan', 'suit me',
      'missed payment', 'credit score', 'hurt my chances',
      'rejected', 'improving my chances', 'documents',
      'salary slips', 'bank statements', 'ITR'
    ]

    // Application-related patterns
    const applicationPatterns = [
      'apply', 'application', 'submit', 'start application',
      'PAN card', 'ID proofs', 'KYC', 'form', 'step-by-step',
      'fastest way', 'urgent', 'stuck', 'documents', 'process',
      'want to apply', 'need to apply', 'how to apply'
    ]

    // Financial literacy patterns
    const literacyPatterns = [
      'learn', 'tips', 'guide', 'how to',
      'explain', 'understand', 'EMI', 'calculations',
      'credit score', 'debt-to-income', 'saving money',
      'invest', 'emergencies', 'financial situation',
      'help understanding', 'explain all', 'tell me about',
      'what is', 'how does', 'information', 'details',
      'know more', 'interest rate', 'terms', 'conditions'
    ]

    // Check if input contains just a loan type without specific action
    const hasOnlyLoanType = loanTypePatterns.some(pattern => 
      lowerInput.includes(pattern)
    ) && !eligibilityPatterns.some(pattern => 
      lowerInput.includes(pattern)
    ) && !applicationPatterns.some(pattern => 
      lowerInput.includes(pattern)
    )

    // Check if input is a general loan query
    const isGeneralLoanQuery = generalLoanPatterns.some(pattern => 
      lowerInput.includes(pattern)
    ) && !eligibilityPatterns.some(pattern => 
      lowerInput.includes(pattern)
    ) && !applicationPatterns.some(pattern => 
      lowerInput.includes(pattern)
    )

    // Count matches for each category
    const eligibilityMatches = eligibilityPatterns.filter(pattern => 
      lowerInput.includes(pattern)
    ).length

    const applicationMatches = applicationPatterns.filter(pattern => 
      lowerInput.includes(pattern)
    ).length

    const literacyMatches = literacyPatterns.filter(pattern => 
      lowerInput.includes(pattern)
    ).length

    // If it's just a loan type query or general loan query without specific action,
    // direct to financial literacy
    if (hasOnlyLoanType || isGeneralLoanQuery) {
      return 'literacy'
    }

    // Handle mixed intents with new priority
    if (eligibilityMatches > 0 && applicationMatches > 0) {
      // If both eligibility and application are mentioned, prioritize eligibility
      return 'eligibility'
    } else if (eligibilityMatches > 0 && literacyMatches > 0) {
      // If both eligibility and literacy are mentioned, prioritize eligibility
      return 'eligibility'
    } else if (applicationMatches > 0 && literacyMatches > 0) {
      // If both application and literacy are mentioned, prioritize application
      return 'application'
    }

    // Handle single intents
    if (eligibilityMatches > 0) {
      return 'eligibility'
    } else if (applicationMatches > 0) {
      return 'application'
    } else if (literacyMatches > 0) {
      return 'literacy'
    }
    
    // If no clear intent is found, direct to financial literacy
    if (lowerInput.trim().length > 0) {
      return 'literacy'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim()) {
      return
    }

    setIsProcessing(true)
    try {
      // Detect the language of the input
      const detectedLanguage = detectLanguage(userInput)
      
      // If not English, translate to English
      let processedInput = userInput
      if (detectedLanguage !== 'en-IN') {
        try {
          const translatedText = await translateToEnglish(userInput, detectedLanguage)
          processedInput = translatedText
          
          // Show translation success message
          toast.success('Successfully processed your request', {
            duration: 3000,
            position: 'top-right'
          })
        } catch (error) {
          console.error('Translation error:', error)
          toast.error('Could not process your language, but will try to understand', {
            duration: 3000,
            position: 'top-right'
          })
        }
      }

      // Analyze intent with the processed (translated if necessary) input
      const detectedIntent = analyzeIntent(processedInput)
      setIntent(detectedIntent)
      
      if (detectedIntent) {
        switch (detectedIntent) {
          case 'eligibility':
            navigate('/eligibility')
            break
          case 'application':
            navigate('/application')
            break
          case 'literacy':
            // Add a small delay for better UX
            setTimeout(() => {
              navigate('/literacy')
            }, 100)
            break
        }
      } else {
        toast.error('Could not understand your request. Please try again.', {
          duration: 3000,
          position: 'top-right'
        })
      }
    } catch (error) {
      console.error('Error processing request:', error)
      toast.error('An error occurred. Please try again.', {
        duration: 3000,
        position: 'top-right'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 relative overflow-hidden">
      <StarsBackground />
      <ShootingStars />
      
      {/* Navigation Bar */}
      <div className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50">
        <Menu setActive={setActive}>
          <Link 
            to="/" 
            className={`text-white hover:opacity-90 transition-colors relative ${
              isActive('/') ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
            }`}
          >
            <TranslatedText text="Home" />
          </Link>
          <Link 
            to="/profile" 
            className={`text-white hover:opacity-90 transition-colors relative ${
              isActive('/profile') ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
            }`}
          >
            <TranslatedText text="Profile" />
          </Link>
          <MenuItem 
            setActive={setActive} 
            active={active} 
            item="Services"
            isItemActive={isServiceActive()}
          >
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink to="/eligibility">Check Eligibility</HoveredLink>
              <HoveredLink to="/application">Apply for Loan</HoveredLink>
              <HoveredLink to="/literacy">Financial Education</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Account">
            <div className="flex flex-col space-y-4 text-sm">
              <div className="text-neutral-300 px-2">
                <div className="font-medium text-white">{user?.full_name}</div>
                <p className="text-xs">{user?.email}</p>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-left px-2 text-neutral-300 hover:text-white"
              >
                <TranslatedText text="Sign out" />
              </button>
            </div>
          </MenuItem>
        </Menu>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text leading-tight py-1">
            <TranslatedText text={getGreeting()} /> <TranslatedText text={`, ${user?.full_name}!`} />
          </h1>
          <p className="text-neutral-400 mt-3 text-lg">
            <TranslatedText text="Welcome back to your financial dashboard" />
          </p>
        </div>

        {/* Intent Input Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 mb-8 mt-12">
          <h2 className="text-2xl font-bold text-white mb-8">
            <TranslatedText text="How can I help you today?" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TranslatedTextArea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              required={true}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 text-lg rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                isProcessing 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span><TranslatedText text="Processing..." /></span>
                </div>
              ) : (
                <TranslatedText text="Get Started" />
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
} 