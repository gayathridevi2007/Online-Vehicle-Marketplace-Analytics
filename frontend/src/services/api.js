const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function request(path, options = {}) {
  const { body, credentials = 'include', method = 'GET' } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new ApiError(
      'invalid_response',
      'The API returned an invalid JSON response.',
      response.status,
    )
  }

  if (!response.ok) {
    const error = payload.error || {}
    throw new ApiError(
      error.code || 'request_failed',
      error.message || 'The API request failed.',
      response.status,
    )
  }

  return payload
}

async function requestMultipart(path, formData, method = 'POST') {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  })
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new ApiError(
      'invalid_response',
      'The API returned an invalid JSON response.',
      response.status,
    )
  }

  if (!response.ok) {
    const error = payload.error || {}
    throw new ApiError(
      error.code || 'request_failed',
      error.message || 'The API request failed.',
      response.status,
    )
  }

  return payload
}

function queryString(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const api = {
  health: () => request('/health'),
  vehicleSummary: () => request('/vehicles/summary'),
  vehicleBrands: () => request('/vehicles/brands'),
  vehicleFuelTypes: () => request('/vehicles/fuel-types'),
  vehiclePriceAnalysis: () => request('/vehicles/price-analysis'),
  vehicleRecords: (filters = {}) =>
    request(`/vehicles/records${queryString(filters)}`),
  vehicleFilterOptions: (brand = '') =>
    request(`/vehicles/filter-options${brand ? `?brand=${encodeURIComponent(brand)}` : ''}`),
  customerCatalogue: (filters = {}) =>
    request(`/vehicles/customer-catalogue${queryString(filters)}`, {
      credentials: 'include',
    }),
  customerMe: () => request('/customer/auth/me', { credentials: 'include' }),
  customerRegister: (body) => request('/customer/auth/register', {
    method: 'POST',
    body,
    credentials: 'include',
  }),
  customerLogin: (body) => request('/customer/auth/login', {
    method: 'POST',
    body,
    credentials: 'include',
  }),
  customerLogout: () => request('/customer/auth/logout', {
    method: 'POST',
    body: {},
    credentials: 'include',
  }),
  customerConfirmPremium: (body) => request('/customer/auth/premium/confirm', {
    method: 'POST',
    body,
    credentials: 'include',
  }),
  marketplaceRoles: () => request('/marketplace/roles', { credentials: 'include' }),
  marketplaceActivateBuyer: () => request('/marketplace/roles/buyer', {
    method: 'POST',
    body: {},
    credentials: 'include',
  }),
  marketplaceListings: (filters = {}) =>
    request(`/marketplace/listings${queryString(filters)}`, {
      credentials: 'include',
    }),
  marketplaceListing: (listingId) =>
    request(`/marketplace/listings/${listingId}`, { credentials: 'include' }),
  marketplaceMyListings: () =>
    request('/marketplace/my-listings', { credentials: 'include' }),
  marketplaceMyPurchases: () =>
    request('/marketplace/my-purchases', { credentials: 'include' }),
  marketplaceCreateListing: (formData) =>
    requestMultipart('/marketplace/listings', formData),
  marketplaceUpdateListing: (listingId, formData) =>
    requestMultipart(`/marketplace/my-listings/${listingId}`, formData, 'PUT'),
  marketplaceWithdrawListing: (listingId) =>
    request(`/marketplace/my-listings/${listingId}/withdraw`, {
      method: 'POST',
      body: {},
      credentials: 'include',
    }),
  marketplacePhotoUrl: (listingId, photoId) =>
    `${API_BASE_URL}/marketplace/listings/${listingId}/photos/${photoId}`,
  marketplacePurchase: (listingId) =>
    request(`/marketplace/listings/${listingId}/purchase`, {
      method: 'POST',
      body: {},
      credentials: 'include',
    }),
  marketplaceModeratorSession: () =>
    request('/marketplace/moderation/session', { credentials: 'include' }),
  marketplaceModeratorLogin: (body) =>
    request('/marketplace/moderation/login', {
      method: 'POST',
      body,
      credentials: 'include',
    }),
  marketplaceModeratorRegister: (body) =>
    request('/marketplace/moderation/register', {
      method: 'POST',
      body,
      credentials: 'include',
    }),
  marketplaceModeratorLogout: () =>
    request('/marketplace/moderation/logout', {
      method: 'POST',
      body: {},
      credentials: 'include',
    }),
  marketplacePendingListings: () =>
    request('/marketplace/moderation/listings/pending', {
      credentials: 'include',
    }),
  marketplaceReviewListing: (listingId, decision, note = '') =>
    request(`/marketplace/moderation/listings/${listingId}/${decision}`, {
      method: 'POST',
      body: { note },
      credentials: 'include',
    }),
  marketplaceVerifySeller: (listingId, note = '') =>
    request(`/marketplace/moderation/listings/${listingId}/verify-seller`, {
      method: 'POST',
      body: { note },
      credentials: 'include',
    }),
  marketplaceOwnershipDocumentUrl: (listingId, documentId) =>
    `${API_BASE_URL}/marketplace/moderation/listings/${listingId}/documents/${documentId}`,
  marketplaceTransactions: () =>
    request('/marketplace/moderation/transactions', { credentials: 'include' }),
  marketplaceModerationListings: (tab = 'all') =>
    request(`/marketplace/moderation/listings?tab=${encodeURIComponent(tab)}`, { credentials: 'include' }),
  marketplaceFlagListing: (listingId, reason = '') =>
    request(`/marketplace/moderation/listings/${listingId}/flag`, {
      method: 'POST',
      body: { reason },
      credentials: 'include',
    }),
  marketplaceSuspendListing: (listingId, reason) =>
    request(`/marketplace/moderation/listings/${listingId}/suspend`, {
      method: 'POST',
      body: { reason },
      credentials: 'include',
    }),
  marketplaceReinstateListing: (listingId, note = '') =>
    request(`/marketplace/moderation/listings/${listingId}/reinstate`, {
      method: 'POST',
      body: { note },
      credentials: 'include',
    }),
  marketplaceSoftRemoveListing: (listingId, reason = '') =>
    request(`/marketplace/moderation/listings/${listingId}/soft-remove`, {
      method: 'POST',
      body: { reason },
      credentials: 'include',
    }),
  marketplaceAuditLogs: () =>
    request('/marketplace/moderation/audit-logs', { credentials: 'include' }),
  marketplaceCreateBooking: (listingId, notes = '') =>
    request('/marketplace/bookings', {
      method: 'POST',
      body: { listing_id: listingId, notes },
      credentials: 'include',
    }),
  marketplaceMyBookings: () =>
    request('/marketplace/bookings/my-bookings', { credentials: 'include' }),
  marketplaceSellerBookings: () =>
    request('/marketplace/bookings/seller-bookings', { credentials: 'include' }),
  marketplaceMembershipStatus: () =>
    request('/marketplace/memberships/status', { credentials: 'include' }),
  marketplacePurchaseMembership: (membershipType) =>
    request('/marketplace/memberships/purchase', {
      method: 'POST',
      body: { membership_type: membershipType },
      credentials: 'include',
    }),
  marketplaceFavourites: () =>
    request('/marketplace/favourites', { credentials: 'include' }),
  marketplaceAddFavourite: (listingId) =>
    request(`/marketplace/favourites/${listingId}`, {
      method: 'POST',
      body: {},
      credentials: 'include',
    }),
  marketplaceRemoveFavourite: (listingId) =>
    request(`/marketplace/favourites/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
}
