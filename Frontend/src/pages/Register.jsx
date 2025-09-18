import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const { confirmPassword, ...userData } = data
    const result = await registerUser(userData)
    if (result.success) {
      navigate('/login')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header con animación */}
          <div className="text-center relative">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/20">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent mb-3">
              Únete a nosotros
            </h2>
            <p className="text-lg text-gray-600/80 font-medium">
              Únete a Universia
            </p>
          </div>

          {/* Glass Form Container */}
          <div className="relative">
            {/* Fondo con efectos */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-50/60 rounded-3xl blur-3xl"></div>
            <div className="absolute inset-0 bg-white/30 rounded-3xl"></div>
            
            {/* Contenido del formulario */}
            <div className="relative backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-10 shadow-2xl">
              <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Mail className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl text-gray-800 placeholder-gray-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl font-medium ${
                        errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''
                      }`}
                      placeholder="tu@email.com"
                      {...register('email', {
                        required: 'El email es obligatorio',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500 font-medium ml-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`block w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl text-gray-800 placeholder-gray-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl font-medium ${
                        errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''
                      }`}
                      placeholder="Tu contraseña"
                      {...register('password', {
                        required: 'La contraseña es obligatoria',
                        minLength: {
                          value: 6,
                          message: 'La contraseña debe tener al menos 6 caracteres'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:scale-110 transition-transform duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-blue-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-blue-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 font-medium ml-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="group">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`block w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl text-gray-800 placeholder-gray-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl font-medium ${
                        errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : ''
                      }`}
                      placeholder="Confirma tu contraseña"
                      {...register('confirmPassword', {
                        required: 'Debes confirmar tu contraseña',
                        validate: value => value === password || 'Las contraseñas no coinciden'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:scale-110 transition-transform duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-blue-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-blue-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear cuenta
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </div>
                </button>

                {/* Link a login */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 font-medium">
                    ¿Ya tienes cuenta?{' '}
                    <Link 
                      to="/login" 
                      className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}