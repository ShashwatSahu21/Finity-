import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Menu, MenuItem, HoveredLink } from './ui/navbar-menu'
import { ShootingStars } from './ui/shooting-stars'
import { StarsBackground } from './ui/stars-background'
import TranslatedText from './ui/TranslatedText'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

interface ApplicationForm {
  loanName: string
  loanAmount: number
  loanType: string
  purpose: string
  term: number
  mortgageValue: number
  hasSecuritiesAccount: number
  hasFixedDeposit: number
  usesOnlineBanking: number
  monthlyIncome: number
  employmentType: string
  employerName: string
  workExperience: number
  existingEMIs: number
  creditScore: number
  documents: {
    panCard: File | null
    aadharCard: File | null
    bankStatements: File[] | null
    additionalDocs: File[] | null
  }
}

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface DocumentRequirements {
  [key: string]: {
    required: boolean
    description: string
  }
}

const documentRequirements: DocumentRequirements = {
  panCard: {
    required: true,
    description: "PAN Card - Mandatory for all loan applications"
  },
  aadharCard: {
    required: true,
    description: "Aadhar Card - Primary ID proof"
  },
  bankStatements: {
    required: true,
    description: "Last 6 months bank statements"
  },
  additionalDocs: {
    required: false,
    description: "Any additional supporting documents (salary slips, employment proof, address proof etc.)"
  }
}

export default function LoanApplication() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState<ApplicationForm>({
    loanName: '',
    loanAmount: 0,
    loanType: '',
    purpose: '',
    term: 12,
    mortgageValue: 0,
    hasSecuritiesAccount: 0,
    hasFixedDeposit: 0,
    usesOnlineBanking: 0,
    monthlyIncome: 0,
    employmentType: '',
    employerName: '',
    workExperience: 0,
    existingEMIs: 0,
    creditScore: 0,
    documents: {
      panCard: null,
      aadharCard: null,
      bankStatements: null,
      additionalDocs: null
    }
  })
  const [submitted, setSubmitted] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isServiceActive = () => {
    return ['/eligibility', '/application', '/literacy'].includes(location.pathname)
  }

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
          
          // Pre-fill form with user profile data
          setFormData(prev => ({
            ...prev,
            monthlyIncome: profile.annual_income ? profile.annual_income / 12 : 0,
            employerName: profile.employer_name || '',
            workExperience: profile.years_of_experience || 0,
            creditScore: profile.credit_score || 0,
            mortgageValue: profile.mortgage_value || 0,
            hasSecuritiesAccount: profile.securities_account ? 1 : 0,
            hasFixedDeposit: profile.cd_account ? 1 : 0,
            usesOnlineBanking: profile.online_banking ? 1 : 0
          }))
        }
      } catch (error: any) {
        console.error('Error loading user data:', error.message)
      }
    }

    loadUserData()
  }, [])

  const handleFileChange = (field: keyof ApplicationForm['documents'], files: FileList | null) => {
    if (!files) return

    if (field === 'bankStatements' || field === 'additionalDocs') {
      // Handle multiple files
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: Array.from(files)
        }
      }))
    } else {
      // Handle single file
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: files[0]
        }
      }))
    }
  }

  const analyzeLoanApplication = async () => {
    try {
      const prompt = `As a loan expert, provide specific guidance for filling out this ${formData.loanType} application:

LOAN APPLICATION DETAILS
-----------------------
Loan Name: ${formData.loanName}
Loan Type: ${formData.loanType}
Amount: ₹${formData.loanAmount.toLocaleString('en-IN')}

Based on the loan name and type provided, please give detailed guidance on:

1. APPLICATION FILLING INSTRUCTIONS
- Step-by-step guide on how to fill each section of the application
- Common mistakes to avoid
- Tips for improving chances of approval
- Specific requirements for this type of loan

2. DOCUMENT CHECKLIST
- List all required documents for this specific loan type
- Format requirements for each document
- Additional documents that could strengthen the application
- How to properly submit each document

3. ELIGIBILITY CRITERIA
- Minimum income requirements
- Credit score requirements
- Work experience needed
- Other specific criteria for this loan type

4. PROCESSING INFORMATION
- Expected processing time
- Key stages in the approval process
- What to expect during verification
- Common reasons for delays or rejection

Please format the response as a JSON object with this structure:
{
  "applicationGuide": {
    "loanType": string,
    "bankRequirements": string[],
    "fillInstructions": string[],
    "commonMistakes": string[],
    "tipsForApproval": string[]
  },
  "documentChecklist": {
    "required": {
      "identity": string[],
      "income": string[],
      "address": string[],
      "loanSpecific": string[]
    },
    "optional": string[],
    "formatRequirements": string[]
  },
  "eligibilityCriteria": {
    "income": string,
    "creditScore": string,
    "experience": string,
    "otherRequirements": string[]
  },
  "processingDetails": {
    "estimatedTime": string,
    "verificationSteps": string[],
    "commonDelays": string[],
    "nextSteps": string[]
  }
}`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze application')
      }

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      setAnalysisResult(analysis)
      return analysis
    } catch (err) {
      console.error('Analysis error:', err)
      throw err
    }
  }

  const validateStep = () => {
    const newErrors: { [key: string]: string } = {}

    switch (step) {
      case 1:
        if (!formData.loanName) {
          newErrors.loanName = 'Loan name is required'
        }
        if (!formData.loanAmount || formData.loanAmount <= 0) {
          newErrors.loanAmount = 'Please enter a valid loan amount'
        }
        if (!formData.loanType) {
          newErrors.loanType = 'Please select a loan type'
        }
        if (!formData.purpose) {
          newErrors.purpose = 'Please provide the purpose of the loan'
        }
        if (!formData.term) {
          newErrors.term = 'Please select a loan term'
        }
        break

      case 2:
        if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
          newErrors.monthlyIncome = 'Please enter a valid monthly income'
        }
        if (!formData.employmentType) {
          newErrors.employmentType = 'Please select your employment type'
        }
        if (!formData.employerName) {
          newErrors.employerName = 'Employer name is required'
        }
        if (!formData.workExperience || formData.workExperience < 0) {
          newErrors.workExperience = 'Please enter valid work experience'
        }
        if (formData.existingEMIs === undefined || formData.existingEMIs < 0) {
          newErrors.existingEMIs = 'Please enter valid EMI amount'
        }
        if (!formData.creditScore || formData.creditScore < 300 || formData.creditScore > 900) {
          newErrors.creditScore = 'Please enter a valid credit score (300-900)'
        }
        break

      case 3:
        // Document validation
        Object.entries(documentRequirements).forEach(([key, { required }]) => {
          if (required && (!formData.documents || !formData.documents[key as keyof ApplicationForm['documents']])) {
            newErrors[`document_${key}`] = `${key} is required`
          }
        })
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) {
      return
    }

    setLoading(true)
    try {
      // Analyze loan application
      const analysisResult = await analyzeLoanApplication()

      // Navigate to results page with analysis data
      navigate('/result', { state: { analysisResult } })
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Error analyzing application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <TranslatedText text="Step 1: Basic Loan Information" />
            </h2>
            {renderField('loanName', 'Loan Name')}
            {renderField('loanAmount', 'Loan Amount (₹)', 'number')}
            {renderField('loanType', 'Loan Type', 'select', [
              { value: '', label: 'Select loan type' },
              { value: 'personal', label: 'Personal Loan' },
              { value: 'home', label: 'Home Loan' },
              { value: 'auto', label: 'Auto Loan' },
              { value: 'business', label: 'Business Loan' },
            ])}
            {renderField('purpose', 'Purpose')}
            {renderField('term', 'Loan Term (months)', 'select', [
              { value: '12', label: '12 months' },
              { value: '24', label: '24 months' },
              { value: '36', label: '36 months' },
              { value: '48', label: '48 months' },
              { value: '60', label: '60 months' },
            ])}
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <TranslatedText text="Step 2: Financial Information" />
            </h2>
            {renderField('monthlyIncome', 'Monthly Income (₹)', 'number')}
            {renderField('employmentType', 'Employment Type', 'select', [
              { value: '', label: 'Select employment type' },
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'self-employed', label: 'Self-employed' },
              { value: 'freelance', label: 'Freelance' },
              { value: 'contract', label: 'Contract' },
              { value: 'intern', label: 'Intern' },
            ])}
            {renderField('employerName', 'Employer Name')}
            {renderField('workExperience', 'Work Experience (years)', 'number')}
            {renderField('existingEMIs', 'Existing EMIs (₹)', 'number')}
            {renderField('creditScore', 'Credit Score', 'number')}
            {renderField('mortgageValue', 'Mortgage Value (₹)', 'number')}
            {renderField('hasSecuritiesAccount', 'Has Securities Account', 'select', [
              { value: '0', label: 'No' },
              { value: '1', label: 'Yes' },
            ])}
            {renderField('hasFixedDeposit', 'Has Fixed Deposit', 'select', [
              { value: '0', label: 'No' },
              { value: '1', label: 'Yes' },
            ])}
            {renderField('usesOnlineBanking', 'Uses Online Banking', 'select', [
              { value: '0', label: 'No' },
              { value: '1', label: 'Yes' },
            ])}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <TranslatedText text="Step 3: Document Upload" />
            </h2>
            {Object.entries(documentRequirements).map(([key, { required, description }]) => (
              <div key={key} className="space-y-1">
                <label className="block text-white mb-2">
                  <TranslatedText text={description} />
                  {required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  multiple={key === 'bankStatements' || key === 'additionalDocs'}
                  onChange={(e) => handleFileChange(key as keyof ApplicationForm['documents'], e.target.files)}
                  className={`w-full p-3 rounded-lg bg-white/5 border ${
                    errors[`document_${key}`]
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-500'
                  } text-white`}
                  required={required}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {renderError(`document_${key}`)}
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <p className="mt-1 text-sm text-red-400">
          {errors[fieldName]}
        </p>
      )
    }
    return null
  }

  const renderField = (
    fieldName: string,
    label: string,
    type: 'text' | 'number' | 'select' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const hasError = !!errors[fieldName]
    const baseClasses = 'w-full p-3 rounded-lg bg-white/5 border transition-colors'
    const classes = `${baseClasses} ${
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-white/10 focus:border-blue-500'
    }`

    return (
      <div className="space-y-1">
        <label className="block text-white mb-2">
          <TranslatedText text={label} />
        </label>
        {type === 'select' && options ? (
          <select
            value={formData[fieldName as keyof typeof formData] as string}
            onChange={(e) =>
              setFormData({
                ...formData,
                [fieldName]: e.target.value,
              })
            }
            className={classes}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formData[fieldName as keyof typeof formData] as string}
            onChange={(e) =>
              setFormData({
                ...formData,
                [fieldName]: type === 'number' ? Number(e.target.value) : e.target.value,
              })
            }
            className={classes}
          />
        )}
        {renderError(fieldName)}
      </div>
    )
  }

  const renderLoadingOverlay = () => {
    if (!loading) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="text-white">
              <TranslatedText text="Processing your application..." />
            </p>
          </div>
        </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">
            <TranslatedText text="Loan Application" />
          </h1>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stepNumber <= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        stepNumber < step ? 'bg-blue-500' : 'bg-white/5'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-white/70">
              <span><TranslatedText text="Basic Information" /></span>
              <span><TranslatedText text="Financial Details" /></span>
              <span><TranslatedText text="Documents" /></span>
            </div>
          </div>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStep()}
              
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <TranslatedText text="Previous" />
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <TranslatedText text="Next" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <TranslatedText text="Submit Application" />
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {analysisResult && (
                <>
                  {/* Application Guide */}
                  <div className="bg-blue-500/20 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-blue-400 mb-4">
                      <TranslatedText text={`How to Apply: ${analysisResult.applicationGuide.loanType}`} />
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Bank Requirements */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Bank Requirements" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.applicationGuide.bankRequirements.map((req: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={req} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Fill Instructions */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="How to Fill the Application" />
                        </h3>
                        <ul className="list-decimal list-inside space-y-2 text-white">
                          {analysisResult.applicationGuide.fillInstructions.map((instruction: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={instruction} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Mistakes */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Common Mistakes to Avoid" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.applicationGuide.commonMistakes.map((mistake: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={mistake} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tips */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Tips for Approval" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.applicationGuide.tipsForApproval.map((tip: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={tip} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Document Checklist */}
                  <div className="bg-purple-500/20 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-purple-400 mb-4">
                      <TranslatedText text="Required Documents" />
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Identity Documents */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Identity Documents" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.required.identity.map((doc: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={doc} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Income Documents */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Income Documents" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.required.income.map((doc: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={doc} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Address Documents */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Address Proof" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.required.address.map((doc: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={doc} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Loan Specific Documents */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Loan Specific Documents" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.required.loanSpecific.map((doc: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={doc} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Optional Documents */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Additional Supporting Documents (Optional)" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.optional.map((doc: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={doc} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Format Requirements */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Document Format Requirements" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.documentChecklist.formatRequirements.map((req: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={req} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Criteria */}
                  <div className="bg-green-500/20 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-green-400 mb-4">
                      <TranslatedText text="Eligibility Criteria" />
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          <TranslatedText text="Income Requirement" />
                        </h3>
                        <p className="text-white">
                          <TranslatedText text={analysisResult.eligibilityCriteria.income} />
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          <TranslatedText text="Credit Score Requirement" />
                        </h3>
                        <p className="text-white">
                          <TranslatedText text={analysisResult.eligibilityCriteria.creditScore} />
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          <TranslatedText text="Experience Requirement" />
                        </h3>
                        <p className="text-white">
                          <TranslatedText text={analysisResult.eligibilityCriteria.experience} />
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          <TranslatedText text="Additional Requirements" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.eligibilityCriteria.otherRequirements.map((req: string, index: number) => (
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
                    <h2 className="text-2xl font-bold text-yellow-400 mb-4">
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
                        <ul className="list-decimal list-inside space-y-2 text-white">
                          {analysisResult.processingDetails.verificationSteps.map((step: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={step} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          <TranslatedText text="Common Reasons for Delay" />
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-white">
                          {analysisResult.processingDetails.commonDelays.map((delay: string, index: number) => (
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
                        <ul className="list-decimal list-inside space-y-2 text-white">
                          {analysisResult.processingDetails.nextSteps.map((step: string, index: number) => (
                            <li key={index}>
                              <TranslatedText text={step} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  setSubmitted(false)
                  setStep(1)
                  setAnalysisResult(null)
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <TranslatedText text="Start New Application" />
              </button>
            </div>
          )}
        </div>
      </main>

      {renderLoadingOverlay()}
    </div>
  )
} 