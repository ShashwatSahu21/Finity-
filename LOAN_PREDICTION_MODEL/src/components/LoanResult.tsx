import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import TranslatedText from './ui/TranslatedText'
import { StarsBackground } from './ui/stars-background'
import { ShootingStars } from './ui/shooting-stars'
import { Menu, MenuItem, HoveredLink } from './ui/navbar-menu'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface LoanAnalysisResult {
  applicationGuide: {
    loanType: string
    bankRequirements: string[]
    fillInstructions: string[]
    commonMistakes: string[]
    tipsForApproval: string[]
  }
  documentChecklist: {
    required: {
      identity: string[]
      income: string[]
      address: string[]
      loanSpecific: string[]
    }
    optional: string[]
    formatRequirements: string[]
  }
  eligibilityCriteria: {
    income: string
    creditScore: string
    experience: string
    otherRequirements: string[]
  }
  processingDetails: {
    estimatedTime: string
    verificationSteps: string[]
    commonDelays: string[]
    nextSteps: string[]
  }
}

export default function LoanResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const [analysisResult, setAnalysisResult] = useState<LoanAnalysisResult | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!location.state?.analysisResult) {
      navigate('/application')
      return
    }
    setAnalysisResult(location.state.analysisResult)

    // Load user data
    async function loadUserData() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
            
          if (profileError) throw profileError
          setUser(profile)
        }
      } catch (error: any) {
        console.error('Error loading user data:', error.message)
      }
    }

    loadUserData()
  }, [location.state, navigate])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isServiceActive = () => {
    return ['/eligibility', '/application', '/literacy'].includes(location.pathname)
  }

  if (!analysisResult) return null

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
              <HoveredLink to="/eligibility">
                <TranslatedText text="Check Eligibility" />
              </HoveredLink>
              <HoveredLink to="/application">
                <TranslatedText text="Apply for Loan" />
              </HoveredLink>
              <HoveredLink to="/literacy">
                <TranslatedText text="Financial Education" />
              </HoveredLink>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">
            <TranslatedText text={`Application Guide: ${analysisResult.applicationGuide.loanType}`} />
          </h1>

          <div className="space-y-8">
            {/* Application Guide */}
            <div className="bg-blue-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">
                <TranslatedText text="How to Apply" />
              </h2>

              {/* Bank Requirements */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Bank Requirements" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.applicationGuide.bankRequirements.map((req, index) => (
                    <li key={index}>
                      <TranslatedText text={req} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Instructions */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Step-by-Step Instructions" />
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-white">
                  {analysisResult.applicationGuide.fillInstructions.map((instruction, index) => (
                    <li key={index}>
                      <TranslatedText text={instruction} />
                    </li>
                  ))}
                </ol>
              </div>

              {/* Common Mistakes */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Common Mistakes to Avoid" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.applicationGuide.commonMistakes.map((mistake, index) => (
                    <li key={index}>
                      <TranslatedText text={mistake} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Tips for Approval" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.applicationGuide.tipsForApproval.map((tip, index) => (
                    <li key={index}>
                      <TranslatedText text={tip} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Document Requirements */}
            <div className="bg-purple-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">
                <TranslatedText text="Required Documents" />
              </h2>

              {/* Identity Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Identity Documents" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.required.identity.map((doc, index) => (
                    <li key={index}>
                      <TranslatedText text={doc} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Income Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Income Documents" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.required.income.map((doc, index) => (
                    <li key={index}>
                      <TranslatedText text={doc} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Address Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Address Proof" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.required.address.map((doc, index) => (
                    <li key={index}>
                      <TranslatedText text={doc} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Loan Specific Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Loan Specific Documents" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.required.loanSpecific.map((doc, index) => (
                    <li key={index}>
                      <TranslatedText text={doc} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optional Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Additional Supporting Documents (Optional)" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.optional.map((doc, index) => (
                    <li key={index}>
                      <TranslatedText text={doc} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Format Requirements */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text="Document Format Requirements" />
                </h3>
                <ul className="list-disc list-inside space-y-2 text-white">
                  {analysisResult.documentChecklist.formatRequirements.map((req, index) => (
                    <li key={index}>
                      <TranslatedText text={req} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-green-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-6">
                <TranslatedText text="Eligibility Criteria" />
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Income Requirement" />
                  </h3>
                  <p className="text-white">
                    <TranslatedText text={analysisResult.eligibilityCriteria.income} />
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Credit Score Requirement" />
                  </h3>
                  <p className="text-white">
                    <TranslatedText text={analysisResult.eligibilityCriteria.creditScore} />
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Experience Requirement" />
                  </h3>
                  <p className="text-white">
                    <TranslatedText text={analysisResult.eligibilityCriteria.experience} />
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Additional Requirements" />
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-white">
                    {analysisResult.eligibilityCriteria.otherRequirements.map((req, index) => (
                      <li key={index}>
                        <TranslatedText text={req} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Processing Details */}
            <div className="bg-yellow-500/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                <TranslatedText text="Processing Information" />
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Estimated Processing Time" />
                  </h3>
                  <p className="text-white">
                    <TranslatedText text={analysisResult.processingDetails.estimatedTime} />
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Verification Steps" />
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-white">
                    {analysisResult.processingDetails.verificationSteps.map((step, index) => (
                      <li key={index}>
                        <TranslatedText text={step} />
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Common Reasons for Delay" />
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-white">
                    {analysisResult.processingDetails.commonDelays.map((delay, index) => (
                      <li key={index}>
                        <TranslatedText text={delay} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <TranslatedText text="Next Steps" />
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-white">
                    {analysisResult.processingDetails.nextSteps.map((step, index) => (
                      <li key={index}>
                        <TranslatedText text={step} />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate('/application')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <TranslatedText text="Start New Application" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <TranslatedText text="Back to Home" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 