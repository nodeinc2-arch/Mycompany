'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Language } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({ language: 'en', setLanguage: () => {} })

function writeCookie(lang: Language) {
  document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

function readCookieLang(): Language | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|fr)(?:;|$)/)
  return (match?.[1] as Language | undefined) ?? null
}

function detectBrowserLang(): Language {
  const tag = (navigator.language || '').toLowerCase()
  return tag.startsWith('fr') ? 'fr' : 'en'
}

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: {
  children: ReactNode
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  useEffect(() => {
    const cookieLang = readCookieLang()
    if (cookieLang) return

    const detected = detectBrowserLang()
    if (detected !== language) {
      setLanguageState(detected)
      document.documentElement.lang = detected === 'fr' ? 'fr-CA' : 'en-CA'
    }
    writeCookie(detected)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    writeCookie(lang)
    document.documentElement.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
