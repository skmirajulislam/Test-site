'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Hotel, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Invalid response from server' }))
        throw new Error(data.error || `Login failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timeout. Please check your connection and try again.')
        } else {
          setError(error.message || 'An error occurred. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto w-full sm:max-w-md">
          {/* Logo and Header */}
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 sm:p-4 rounded-2xl shadow-lg">
                <Hotel className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Admin Portal
            </h2>
            <p className="text-gray-400 text-base sm:text-lg px-4">
              Sign in to access the admin dashboard
            </p>
            <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2">
              <Shield className="h-4 w-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-gray-400">Secure Access</span>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto w-full sm:max-w-md animate-fade-in-up delay-300 px-4 sm:px-0">
          <div className="bg-white/10 backdrop-blur-lg py-6 px-4 sm:py-8 sm:px-6 shadow-2xl rounded-2xl border border-white/20">
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-xl backdrop-blur-sm animate-fade-in-up">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm break-words">{error}</span>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="animate-fade-in-up delay-500">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-200 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm placeholder-gray-400 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="animate-fade-in-up delay-700">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-12 py-2.5 sm:py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm placeholder-gray-400 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in-up delay-900">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      <span className="text-sm sm:text-base">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm sm:text-base">Sign in to Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Website Link */}
            <div className="mt-6 sm:mt-8 animate-fade-in-up delay-1000">
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors duration-200 group"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span>Back to website</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Security Notice */}
          <div className="mt-4 sm:mt-6 text-center animate-fade-in-up delay-1200">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
              <p className="text-xs text-gray-400">
                🔒 This is a secure admin area. All login attempts are monitored and logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
