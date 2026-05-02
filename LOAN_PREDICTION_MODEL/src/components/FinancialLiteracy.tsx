import { useState, useEffect } from 'react'
import { Menu, MenuItem, HoveredLink } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'
import { supabase } from '../lib/supabase'
import TranslatedText from './ui/TranslatedText'
import { Link, useLocation } from 'react-router-dom'

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface Tip {
  id: number
  title: string
  content: string
  category: string
}

const financialTips: Tip[] = [
  {
    id: 1,
    title: 'Understanding Credit Scores',
    content: 'Your credit score is a crucial factor in loan approval. Learn how to maintain a good score by paying bills on time, keeping credit utilization low, and maintaining a mix of credit types.',
    category: 'credit'
  },
  {
    id: 2,
    title: 'Budgeting Basics',
    content: 'Create a monthly budget to track income and expenses. This helps you understand your financial position and make informed decisions about borrowing.',
    category: 'budgeting'
  },
  {
    id: 3,
    title: 'Loan Types Explained',
    content: 'Different loans serve different purposes. Understand the differences between personal, home, auto, and business loans to choose the right one for your needs.',
    category: 'loans'
  },
  {
    id: 4,
    title: 'Interest Rates',
    content: 'Learn how interest rates work and how they affect your loan payments. Fixed vs. variable rates, APR vs. interest rate, and how to compare offers.',
    category: 'loans'
  },
  {
    id: 5,
    title: 'Emergency Fund',
    content: 'Build an emergency fund with 3-6 months of expenses before taking on debt. This provides a safety net for unexpected financial challenges.',
    category: 'savings'
  }
]

export default function FinancialLiteracy() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [active, setActive] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()
  const categories = ['all', ...new Set(financialTips.map(tip => tip.category))]

  useEffect(() => {
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
  }, [])

  const filteredTips = selectedCategory === 'all'
    ? financialTips
    : financialTips.filter(tip => tip.category === selectedCategory)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isServiceActive = () => {
    return ['/eligibility', '/application', '/literacy'].includes(location.pathname)
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
            className={`text-white hover:opacity-90 transition-colors relative ${isActive('/') ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
              }`}
          >
            <TranslatedText text="Home" />
          </Link>
          <Link
            to="/profile"
            className={`text-white hover:opacity-90 transition-colors relative ${isActive('/profile') ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
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
                Sign out
              </button>
            </div>
          </MenuItem>
        </Menu>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              <TranslatedText text="Financial Literacy Center" />
            </h1>
            <button
              onClick={() => window.open('http://localhost:5175', '_blank')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center space-x-3 animate-gradient-x border border-white/20 backdrop-blur-sm"
            >
              <span className="group-hover:animate-pulse">
                <TranslatedText text="Talk with Amol" />
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <TranslatedText text={category.charAt(0).toUpperCase() + category.slice(1)} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredTips.map(tip => (
              <div
                key={tip.id}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20"
              >
                <h2 className="text-xl font-bold text-white mb-3">
                  <TranslatedText text={tip.title} />
                </h2>
                <p className="text-white/80">
                  <TranslatedText text={tip.content} />
                </p>
                <div className="mt-4">
                  <span className="text-sm text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                    <TranslatedText text={tip.category} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <TranslatedText text="Additional Resources" />
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Financial Planning Tools */}
              <div className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">
                  <TranslatedText text="Financial Planning Tools" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://www.bankbazaar.com/finance-tools.html" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="EMI Calculator & Financial Tools" />
                    </a>
                  </li>
                  <li>
                    <a href="https://cleartax.in/calculators" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-blue-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="Tax Planning Calculators" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Debt Management */}
              <div className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <h3 className="text-xl font-semibold text-purple-400 mb-4">
                  <TranslatedText text="Debt Management" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://www.rbi.org.in/financialeducation" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="RBI Financial Education Guide" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.moneycontrol.com/personal-finance" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="Personal Finance Basics" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Investment Basics */}
              <div className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                <h3 className="text-xl font-semibold text-green-400 mb-4">
                  <TranslatedText text="Investment Basics" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://zerodha.com/varsity" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-green-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="Zerodha Varsity - Free Investment Courses" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.sebi.gov.in/investors" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-green-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="SEBI Investor Resources" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Tax Planning */}
              <div className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                  <TranslatedText text="Tax Planning" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://incometax.gov.in/iec/foportal" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-yellow-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="Income Tax Portal Resources" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.incometaxindia.gov.in/Pages/tax-services/tax-savings.aspx" target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/80 hover:text-yellow-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <TranslatedText text="Tax Saving Guidelines" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 