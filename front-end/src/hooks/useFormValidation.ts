import { useState, useCallback } from 'react'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const validateEmail = useCallback((email: string): ValidationError | null => {
    if (!email.trim()) {
      return { field: 'email', message: 'El email es obligatorio' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { field: 'email', message: 'Ingresa un email válido' }
    }

    // Validación adicional para dominios comunes
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'icloud.com'
    ]
    const domain = email.split('@')[1]?.toLowerCase()
    if (
      domain &&
      !commonDomains.includes(domain) &&
      !domain.includes('.edu') &&
      !domain.includes('.ac.')
    ) {
      // Permitir dominios educativos y académicos
      console.warn('Email con dominio no común:', domain)
    }

    return null
  }, [])

  const validatePassword = useCallback(
    (password: string): ValidationError | null => {
      if (!password) {
        return { field: 'password', message: 'La contraseña es obligatoria' }
      }

      if (password.length < 8) {
        return {
          field: 'password',
          message: 'La contraseña debe tener al menos 8 caracteres'
        }
      }

      // Verificar complejidad
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        password
      )

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return {
          field: 'password',
          message: 'La contraseña debe incluir mayúsculas, minúsculas y números'
        }
      }

      if (!hasSpecialChar) {
        console.warn(
          'Contraseña sin caracteres especiales - se recomienda incluirlos'
        )
      }

      return null
    },
    []
  )

  const validateName = useCallback((name: string): ValidationError | null => {
    if (!name.trim()) {
      return { field: 'name', message: 'El nombre es obligatorio' }
    }

    if (name.trim().length < 2) {
      return {
        field: 'name',
        message: 'El nombre debe tener al menos 2 caracteres'
      }
    }

    if (name.trim().length > 100) {
      return {
        field: 'name',
        message: 'El nombre no puede exceder 100 caracteres'
      }
    }

    // Verificar que no contenga solo números o caracteres especiales
    if (/^\d+$/.test(name.trim())) {
      return {
        field: 'name',
        message: 'El nombre no puede contener solo números'
      }
    }

    if (/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      return { field: 'name', message: 'El nombre debe contener letras' }
    }

    return null
  }, [])

  const validatePhone = useCallback((phone: string): ValidationError | null => {
    if (!phone.trim()) {
      // Teléfono es opcional
      return null
    }

    // Remover espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s()-]/g, '')

    // Verificar formato colombiano o internacional
    const phoneRegex = /^(\+57|57)?[3][0-9]{9}$|^(\+?1)?[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
      return {
        field: 'phone',
        message:
          'Ingresa un número de teléfono válido (Colombia: +57 XXX XXX XXXX)'
      }
    }

    return null
  }, [])

  const validateOTP = useCallback((otp: string): ValidationError | null => {
    if (!otp.trim()) {
      return { field: 'otp', message: 'El código OTP es obligatorio' }
    }

    if (!/^\d{6}$/.test(otp)) {
      return {
        field: 'otp',
        message: 'El código OTP debe tener exactamente 6 dígitos'
      }
    }

    return null
  }, [])

  const validateLoginForm = useCallback(
    (email: string, password: string): ValidationResult => {
      const validationErrors: ValidationError[] = []

      const emailError = validateEmail(email)
      if (emailError) validationErrors.push(emailError)

      if (!password.trim()) {
        validationErrors.push({
          field: 'password',
          message: 'La contraseña es obligatoria'
        })
      }

      setErrors(validationErrors)
      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors
      }
    },
    [validateEmail]
  )

  const validateRegisterForm = useCallback(
    (
      name: string,
      email: string,
      phone: string,
      password: string
    ): ValidationResult => {
      const validationErrors: ValidationError[] = []

      const nameError = validateName(name)
      if (nameError) validationErrors.push(nameError)

      const emailError = validateEmail(email)
      if (emailError) validationErrors.push(emailError)

      const phoneError = validatePhone(phone)
      if (phoneError) validationErrors.push(phoneError)

      const passwordError = validatePassword(password)
      if (passwordError) validationErrors.push(passwordError)

      setErrors(validationErrors)
      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors
      }
    },
    [validateName, validateEmail, validatePhone, validatePassword]
  )

  const validateOTPForm = useCallback(
    (otp: string): ValidationResult => {
      const validationErrors: ValidationError[] = []

      const otpError = validateOTP(otp)
      if (otpError) validationErrors.push(otpError)

      setErrors(validationErrors)
      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors
      }
    },
    [validateOTP]
  )

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors.find((error) => error.field === field)?.message
    },
    [errors]
  )

  return {
    errors,
    validateEmail,
    validatePassword,
    validateName,
    validatePhone,
    validateOTP,
    validateLoginForm,
    validateRegisterForm,
    validateOTPForm,
    clearErrors,
    getFieldError
  }
}
