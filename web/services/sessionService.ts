// Session service for managing persistent user data with unique tokens

// Safe localStorage wrapper for SSR
const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
  key(index: number): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.key(index)
  },
  get length(): number {
    if (typeof localStorage === 'undefined') return 0
    return localStorage.length
  }
}

export interface SessionData {
  sfrList: any[]
  selectedSfrId: number | null
  nextSfrId: number
  userToken: string
  timestamp: number
}

export interface SarSessionData {
  sarList: any[]
  selectedSarId: number | null
  nextSarId: number
  selectedEal?: string
  userToken: string
  timestamp: number
}

export interface CoverSessionData {
  form: {
    title: string
    version: string
    revision: string
    description: string
    manufacturer: string
    date: string
  }
  uploadedImagePath: string | null
  uploadedImageData: string | null
  userToken: string
  timestamp: number
}

export interface STReferenceSessionData {
  stTitle: string
  stVersion: string
  stDate: string
  author: string
  userToken: string
  timestamp: number
}

export interface TOEReferenceSessionData {
  toeName: string
  toeVersion: string
  toeIdentification: string
  toeType: string
  userToken: string
  timestamp: number
}

export interface TOEOverviewSessionData {
  toeOverview: string
  toeType: string
  toeUsage: string
  toeMajorSecurityFeatures: string
  nonToeHardwareSoftwareFirmware: string
  userToken: string
  timestamp: number
}

export interface TOEDescriptionSessionData {
  toeDescription: string
  toePhysicalScope: string
  toeLogicalScope: string
  userToken: string
  timestamp: number
}

export interface ConformanceClaimsSessionData {
  ccConformance: string
  ppClaims: string
  additionalNotes: string
  userToken: string
  timestamp: number
}

export interface TssSessionData {
  summaryHtml: string
  userToken: string
  timestamp: number
}

export interface SpdEntry {
  id: number
  title: string
  description: string
}

export interface SpdSessionData {
  items: SpdEntry[]
  nextId: number
  userToken: string
  timestamp: number
}

export type AssumptionsSessionData = SpdSessionData
export type ThreatsSessionData = SpdSessionData
export type OspSessionData = SpdSessionData

export interface SecurityObjectiveEntry {
  id: number
  title: string
  description: string
}

export interface SecurityObjectivesSessionData {
  items: SecurityObjectiveEntry[]
  nextId: number
  userToken: string
  timestamp: number
}

export interface SecurityObjectiveMatrixSessionData {
  selectedCells: string[]
  userToken: string
  timestamp: number
}

export interface SecurityObjectiveRationaleSessionData {
  assumptionRationales: Record<string, string>
  threatRationales: Record<string, string>
  ospRationales: Record<string, string>
  userToken: string
  timestamp: number
}

class SessionService {
  private readonly STORAGE_KEY = 'cratool_session'
  private readonly SAR_STORAGE_KEY = 'cratool_sar_session'
  private readonly COVER_STORAGE_KEY = 'cratool_cover_session'
  private readonly ST_REF_STORAGE_KEY = 'cratool_stref_session'
  private readonly TOE_REF_STORAGE_KEY = 'cratool_toeref_session'
  private readonly TOE_OVERVIEW_STORAGE_KEY = 'cratool_toeoverview_session'
  private readonly TOE_DESC_STORAGE_KEY = 'cratool_toedesc_session'
  private readonly CONFORMANCE_CLAIMS_STORAGE_KEY = 'cratool_conformance_session'
  private readonly ASSUMPTIONS_STORAGE_KEY = 'cratool_assumptions_session'
  private readonly THREATS_STORAGE_KEY = 'cratool_threats_session'
  private readonly OSP_STORAGE_KEY = 'cratool_osp_session'
  private readonly SO_TOE_STORAGE_KEY = 'cratool_so_toe_session'
  private readonly SO_OE_STORAGE_KEY = 'cratool_so_oe_session'
  private readonly SO_MATRIX_STORAGE_KEY = 'cratool_so_matrix_session'
  private readonly SO_RATIONALE_STORAGE_KEY = 'cratool_so_rationale_session'
  private readonly TSS_STORAGE_KEY = 'cratool_tss_session'
  private readonly TOKEN_KEY = 'cratool_user_token'
  private userToken: string

  constructor() {
    this.userToken = this.getOrCreateUserToken()
  }

  /**
   * Generate or retrieve a unique user token
   */
  private getOrCreateUserToken(): string {
    let token = safeLocalStorage.getItem(this.TOKEN_KEY)

    if (!token) {
      // Generate a unique token using timestamp and random string
      token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      safeLocalStorage.setItem(this.TOKEN_KEY, token)
    }

    return token
  }

  private getNamespacedKey(baseKey: string): string {
    return `${baseKey}_${this.userToken}`
  }

  /**
   * Get the current user token
   */
  getUserToken(): string {
    return this.userToken
  }

  /**
   * Save Technical Requirement data to session storage
   */
  saveSfrData(sfrList: any[], selectedSfrId: number | null, nextSfrId: number): void {
    const sessionData: SessionData = {
      sfrList,
      selectedSfrId,
      nextSfrId,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Technical Requirement data to session:', error)
    }
  }

  /**
   * Load Technical Requirement data from session storage
   */
  loadSfrData(): SessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: SessionData = JSON.parse(data)

      // Validate that the token matches
      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Technical Requirement data from session:', error)
      return null
    }
  }

  /**
   * Clear all Technical Requirement session data for the current user
   */
  clearSfrData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Technical Requirement data from session:', error)
    }
  }

  /**
   * Clear all Technical Requirement session data for all users (nuclear option)
   */
  clearAllSfrData(): void {
    this.clearAllByPrefix(this.STORAGE_KEY)
  }

  /**
   * Check if there's existing Technical Requirement session data
   */
  hasSessionData(): boolean {
    const storageKey = this.getNamespacedKey(this.STORAGE_KEY)
    return safeLocalStorage.getItem(storageKey) !== null
  }

  /**
   * Save Assurance Requirement data to session storage
   */
  saveSarData(sarList: any[], selectedSarId: number | null, nextSarId: number, selectedEal: string): void {
    const sessionData: SarSessionData = {
      sarList,
      selectedSarId,
      nextSarId,
      selectedEal,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.SAR_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Assurance Requirement data to session:', error)
    }
  }

  /**
   * Load Assurance Requirement data from session storage
   */
  loadSarData(): SarSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.SAR_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: SarSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Assurance Requirement data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Assurance Requirement data from session:', error)
      return null
    }
  }

  /**
   * Clear all Assurance Requirement session data for the current user
   */
  clearSarData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.SAR_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Assurance Requirement data from session:', error)
    }
  }

  /**
   * Clear all Assurance Requirement session data for all users
   */
  clearAllSarData(): void {
    this.clearAllByPrefix(this.SAR_STORAGE_KEY)
  }

  /**
   * Check if there's existing Assurance Requirement session data
   */
  hasSarSessionData(): boolean {
    const storageKey = this.getNamespacedKey(this.SAR_STORAGE_KEY)
    return safeLocalStorage.getItem(storageKey) !== null
  }

  private saveSpdSectionData(baseKey: string, items: SpdEntry[], nextId: number): void {
    const sessionData: SpdSessionData = {
      items,
      nextId,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(baseKey)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error(`Error saving ${baseKey} data to session:`, error)
    }
  }

  private loadSpdSectionData(baseKey: string): SpdSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(baseKey)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: SpdSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn(`Session token mismatch, ignoring stored ${baseKey} data`)
        return null
      }

      sessionData.items = sessionData.items || []
      sessionData.nextId = typeof sessionData.nextId === 'number' ? sessionData.nextId : sessionData.items.length + 1

      return sessionData
    } catch (error) {
      console.error(`Error loading ${baseKey} data from session:`, error)
      return null
    }
  }

  private clearSpdSectionData(baseKey: string): void {
    try {
      const storageKey = this.getNamespacedKey(baseKey)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error(`Error clearing ${baseKey} data from session:`, error)
    }
  }

  /**
   * Get Technical Requirement session info for debugging
   */
  getSessionInfo(): { userToken: string; hasData: boolean; timestamp?: number } {
    const data = this.loadSfrData()
    return {
      userToken: this.userToken,
      hasData: this.hasSessionData(),
      timestamp: data?.timestamp
    }
  }

  /**
   * Get Assurance Requirement session info for debugging
   */
  getSarSessionInfo(): { userToken: string; hasData: boolean; timestamp?: number } {
    const data = this.loadSarData()
    return {
      userToken: this.userToken,
      hasData: this.hasSarSessionData(),
      timestamp: data?.timestamp
    }
  }

  private clearAllByPrefix(baseKey: string): void {
    try {
      const keysToRemove: string[] = []
      const prefix = `${baseKey}_`
      for (let i = 0; i < safeLocalStorage.length; i++) {
        const key = safeLocalStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => safeLocalStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing session data by prefix:', error)
    }
  }

  /**
   * Save Cover data to session storage
   */
  saveCoverData(form: any, uploadedImagePath: string | null, uploadedImageData: string | null = null): void {
    const sessionData: CoverSessionData = {
      form,
      uploadedImagePath,
      uploadedImageData,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.COVER_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Cover data to session:', error)
    }
  }

  /**
   * Load Cover data from session storage
   */
  loadCoverData(): CoverSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.COVER_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: CoverSessionData = {
        uploadedImageData: null,
        ...JSON.parse(data),
      }

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Cover data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Cover data from session:', error)
      return null
    }
  }

  /**
   * Clear Cover session data
   */
  clearCoverData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.COVER_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Cover data from session:', error)
    }
  }

  /**
   * Save ST Reference data to session storage
   */
  saveSTReferenceData(data: Omit<STReferenceSessionData, 'userToken' | 'timestamp'>): void {
    const sessionData: STReferenceSessionData = {
      ...data,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.ST_REF_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving ST Reference data to session:', error)
    }
  }

  /**
   * Load ST Reference data from session storage
   */
  loadSTReferenceData(): STReferenceSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.ST_REF_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: STReferenceSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored ST Reference data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading ST Reference data from session:', error)
      return null
    }
  }

  /**
   * Save Product Reference data to session storage
   */
  saveTOEReferenceData(data: Omit<TOEReferenceSessionData, 'userToken' | 'timestamp'>): void {
    const sessionData: TOEReferenceSessionData = {
      ...data,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.TOE_REF_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Product Reference data to session:', error)
    }
  }

  /**
   * Load Product Reference data from session storage
   */
  loadTOEReferenceData(): TOEReferenceSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.TOE_REF_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: TOEReferenceSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Product Reference data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Product Reference data from session:', error)
      return null
    }
  }

  /**
   * Save Product Overview data to session storage
   */
  saveTOEOverviewData(data: Omit<TOEOverviewSessionData, 'userToken' | 'timestamp'>): void {
    const sessionData: TOEOverviewSessionData = {
      ...data,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.TOE_OVERVIEW_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Product Overview data to session:', error)
    }
  }

  /**
   * Load Product Overview data from session storage
   */
  loadTOEOverviewData(): TOEOverviewSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.TOE_OVERVIEW_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: TOEOverviewSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Product Overview data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Product Overview data from session:', error)
      return null
    }
  }

  /**
   * Save Product Description data to session storage
   */
  saveTOEDescriptionData(data: Omit<TOEDescriptionSessionData, 'userToken' | 'timestamp'>): void {
    const sessionData: TOEDescriptionSessionData = {
      ...data,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.TOE_DESC_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Product Description data to session:', error)
    }
  }

  /**
   * Load Product Description data from session storage
   */
  loadTOEDescriptionData(): TOEDescriptionSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.TOE_DESC_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: TOEDescriptionSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Product Description data')
        return null
      }

      sessionData.toeDescription = sessionData.toeDescription || ''
      sessionData.toePhysicalScope = sessionData.toePhysicalScope || ''
      sessionData.toeLogicalScope = sessionData.toeLogicalScope || ''

      return sessionData
    } catch (error) {
      console.error('Error loading Product Description data from session:', error)
      return null
    }
  }

  saveAssumptionsData(items: SpdEntry[], nextId: number): void {
    this.saveSpdSectionData(this.ASSUMPTIONS_STORAGE_KEY, items, nextId)
  }

  loadAssumptionsData(): AssumptionsSessionData | null {
    return this.loadSpdSectionData(this.ASSUMPTIONS_STORAGE_KEY)
  }

  clearAssumptionsData(): void {
    this.clearSpdSectionData(this.ASSUMPTIONS_STORAGE_KEY)
  }

  saveThreatsData(items: SpdEntry[], nextId: number): void {
    this.saveSpdSectionData(this.THREATS_STORAGE_KEY, items, nextId)
  }

  loadThreatsData(): ThreatsSessionData | null {
    return this.loadSpdSectionData(this.THREATS_STORAGE_KEY)
  }

  clearThreatsData(): void {
    this.clearSpdSectionData(this.THREATS_STORAGE_KEY)
  }

  saveOspData(items: SpdEntry[], nextId: number): void {
    this.saveSpdSectionData(this.OSP_STORAGE_KEY, items, nextId)
  }

  loadOspData(): OspSessionData | null {
    return this.loadSpdSectionData(this.OSP_STORAGE_KEY)
  }

  clearOspData(): void {
    this.clearSpdSectionData(this.OSP_STORAGE_KEY)
  }

  saveSecurityObjectiveToeData(items: SecurityObjectiveEntry[], nextId: number): void {
    this.saveSpdSectionData(this.SO_TOE_STORAGE_KEY, items as unknown as SpdEntry[], nextId)
  }

  loadSecurityObjectiveToeData(): SecurityObjectivesSessionData | null {
    const data = this.loadSpdSectionData(this.SO_TOE_STORAGE_KEY)
    if (!data) {
      return null
    }

    return {
      ...data,
      items: (data.items || []) as SecurityObjectiveEntry[],
    }
  }

  clearSecurityObjectiveToeData(): void {
    this.clearSpdSectionData(this.SO_TOE_STORAGE_KEY)
  }

  saveSecurityObjectiveOeData(items: SecurityObjectiveEntry[], nextId: number): void {
    this.saveSpdSectionData(this.SO_OE_STORAGE_KEY, items as unknown as SpdEntry[], nextId)
  }

  loadSecurityObjectiveOeData(): SecurityObjectivesSessionData | null {
    const data = this.loadSpdSectionData(this.SO_OE_STORAGE_KEY)
    if (!data) {
      return null
    }

    return {
      ...data,
      items: (data.items || []) as SecurityObjectiveEntry[],
    }
  }

  clearSecurityObjectiveOeData(): void {
    this.clearSpdSectionData(this.SO_OE_STORAGE_KEY)
  }

  saveSecurityObjectiveMatrixData(selectedCells: string[]): void {
    const sessionData: SecurityObjectiveMatrixSessionData = {
      selectedCells,
      userToken: this.userToken,
      timestamp: Date.now(),
    }

    try {
      const storageKey = this.getNamespacedKey(this.SO_MATRIX_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Security Objectives matrix data to session:', error)
    }
  }

  loadSecurityObjectiveMatrixData(): SecurityObjectiveMatrixSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.SO_MATRIX_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: SecurityObjectiveMatrixSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Security Objectives matrix data')
        return null
      }

      sessionData.selectedCells = Array.isArray(sessionData.selectedCells)
        ? sessionData.selectedCells
        : []

      return sessionData
    } catch (error) {
      console.error('Error loading Security Objectives matrix data from session:', error)
      return null
    }
  }

  clearSecurityObjectiveMatrixData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.SO_MATRIX_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Security Objectives matrix data from session:', error)
    }
  }

  saveSecurityObjectiveRationaleData(
    assumptionRationales: Record<string, string>,
    threatRationales: Record<string, string>,
    ospRationales: Record<string, string>,
  ): void {
    const sessionData: SecurityObjectiveRationaleSessionData = {
      assumptionRationales,
      threatRationales,
      ospRationales,
      userToken: this.userToken,
      timestamp: Date.now(),
    }

    try {
      const storageKey = this.getNamespacedKey(this.SO_RATIONALE_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Security Objectives rationale data to session:', error)
    }
  }

  loadSecurityObjectiveRationaleData(): SecurityObjectiveRationaleSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.SO_RATIONALE_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: SecurityObjectiveRationaleSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Security Objectives rationale data')
        return null
      }

      sessionData.assumptionRationales = sessionData.assumptionRationales || {}
      sessionData.threatRationales = sessionData.threatRationales || {}
      sessionData.ospRationales = sessionData.ospRationales || {}

      return sessionData
    } catch (error) {
      console.error('Error loading Security Objectives rationale data from session:', error)
      return null
    }
  }

  clearSecurityObjectiveRationaleData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.SO_RATIONALE_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Security Objectives rationale data from session:', error)
    }
  }

  /**
   * Save Conformance Claims data to session storage
   */
  saveConformanceClaimsData(data: Omit<ConformanceClaimsSessionData, 'userToken' | 'timestamp'>): void {
    const sessionData: ConformanceClaimsSessionData = {
      ...data,
      userToken: this.userToken,
      timestamp: Date.now()
    }

    try {
      const storageKey = this.getNamespacedKey(this.CONFORMANCE_CLAIMS_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Conformance Claims data to session:', error)
    }
  }

  /**
   * Load Conformance Claims data from session storage
   */
  loadConformanceClaimsData(): ConformanceClaimsSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.CONFORMANCE_CLAIMS_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: ConformanceClaimsSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Conformance Claims data')
        return null
      }

      return sessionData
    } catch (error) {
      console.error('Error loading Conformance Claims data from session:', error)
      return null
    }
  }

  /**
   * Clear Conformance Claims session data
   */
  clearConformanceClaimsData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.CONFORMANCE_CLAIMS_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Conformance Claims data from session:', error)
    }
  }

  saveTssData(summaryHtml: string): void {
    const sessionData: TssSessionData = {
      summaryHtml,
      userToken: this.userToken,
      timestamp: Date.now(),
    }

    try {
      const storageKey = this.getNamespacedKey(this.TSS_STORAGE_KEY)
      safeLocalStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving Product Summary Specification data to session:', error)
    }
  }

  loadTssData(): TssSessionData | null {
    try {
      const storageKey = this.getNamespacedKey(this.TSS_STORAGE_KEY)
      const data = safeLocalStorage.getItem(storageKey)

      if (!data) {
        return null
      }

      const sessionData: TssSessionData = JSON.parse(data)

      if (sessionData.userToken !== this.userToken) {
        console.warn('Session token mismatch, ignoring stored Product Summary Specification data')
        return null
      }

      sessionData.summaryHtml = sessionData.summaryHtml || ''

      return sessionData
    } catch (error) {
      console.error('Error loading Product Summary Specification data from session:', error)
      return null
    }
  }

  clearTssData(): void {
    try {
      const storageKey = this.getNamespacedKey(this.TSS_STORAGE_KEY)
      safeLocalStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing Product Summary Specification data from session:', error)
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService()
