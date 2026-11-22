import { lazy, Suspense } from 'react'
import PortalChoiceLanding from './pages/PortalChoiceLanding.jsx'
import BuyerMarketplacePage from './pages/BuyerMarketplacePage.jsx'
import BuyerAuthPage from './pages/BuyerAuthPage.jsx'
import SellerAuthPage from './pages/SellerAuthPage.jsx'
import SellerDashboardPage from './pages/SellerDashboardPage.jsx'
import CompareVehiclesPage from './pages/CompareVehiclesPage.jsx'
import BuyerFavouritesPage from './pages/BuyerFavouritesPage.jsx'
import BuyerBookingsPage from './pages/BuyerBookingsPage.jsx'
import BuyerMembershipPage from './pages/BuyerMembershipPage.jsx'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import AdminPortalGuard from './components/AdminPortalGuard.jsx'
import { AdminPortalAuthProvider } from './context/AdminPortalAuthProvider.jsx'
import { MODULES } from './navigation.js'
import CustomerMarketplacePage from './pages/CustomerMarketplacePage.jsx'
import ModulePage from './pages/ModulePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import { LoadingState } from './components/FeedbackStates.jsx'
import CustomerAuthProvider from './context/CustomerAuthProvider.jsx'
import CustomerAccountPage from './pages/CustomerAccountPage.jsx'
import AdminPortalLoginPage from './pages/AdminPortalLoginPage.jsx'
import CustomerListingFormPage from './pages/CustomerListingFormPage.jsx'
import MarketplaceReviewPage from './pages/MarketplaceReviewPage.jsx'
import MyListingsPage from './pages/MyListingsPage.jsx'
import PurchaseHistoryPage from './pages/PurchaseHistoryPage.jsx'
import PremiumPage from './pages/PremiumPage.jsx'

const EtlPage = lazy(() => import('./pages/EtlPage.jsx'))
const WarehouseArchitecturePage = lazy(() => import('./pages/WarehouseArchitecturePage.jsx'))
const OlapCubePage = lazy(() => import('./pages/OlapCubePage.jsx'))
const StarSchemaPage = lazy(() => import('./pages/StarSchemaPage.jsx'))
const SnowflakeSchemaPage = lazy(() => import('./pages/SnowflakeSchemaPage.jsx'))
const StarVsSnowflakePage = lazy(() => import('./pages/StarVsSnowflakePage.jsx'))
const PatternMiningPage = lazy(() => import('./pages/PatternMiningPage.jsx'))
const VehicleAnalyticsPage = lazy(() => import('./pages/VehicleAnalyticsPage.jsx'))

function App() {
  return (
    <AdminPortalAuthProvider>
      <CustomerAuthProvider>
        <Routes>
          <Route path="/" element={<PortalChoiceLanding />} />
          <Route path="/register" element={<CustomerAccountPage mode="register" />} />
          <Route path="/login" element={<CustomerAccountPage mode="login" />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/sell-car" element={<CustomerListingFormPage />} />
          <Route path="/sell-car/:listingId" element={<CustomerListingFormPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/my-purchases" element={<PurchaseHistoryPage />} />
          <Route path="/admin-login" element={<AdminPortalLoginPage />} />
          <Route path="/buyer" element={<BuyerMarketplacePage />} />
      <Route path="/buyer/login" element={<BuyerAuthPage mode="login" />} />
      <Route path="/buyer/register" element={<BuyerAuthPage mode="register" />} />
      <Route path="/buyer/compare" element={<CompareVehiclesPage />} />
      <Route path="/buyer/favourites" element={<BuyerFavouritesPage />} />
      <Route path="/buyer/bookings" element={<BuyerBookingsPage />} />
      <Route path="/buyer/membership" element={<BuyerMembershipPage />} />
      <Route path="/seller" element={<SellerDashboardPage />} />
      <Route path="/seller/login" element={<SellerAuthPage mode="login" />} />
      <Route path="/seller/register" element={<SellerAuthPage mode="register" />} />
      <Route element={<AdminPortalGuard />}>
            <Route path="/marketplace-review" element={<MarketplaceReviewPage />} />
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<OverviewPage />} />
              {MODULES.map((module) => (
                <Route
                  key={module.path}
                  path={module.path}
                  element={
                    module.path === '/etl'
                      ? (
                        <Suspense fallback={<LoadingState message="Loading ETL explorer…" />}>
                          <EtlPage />
                        </Suspense>
                      )
                      : module.path === '/warehouse'
                        ? (
                          <Suspense fallback={<LoadingState message="Loading warehouse architecture…" />}>
                            <WarehouseArchitecturePage />
                          </Suspense>
                        )
                        : module.path === '/olap-cube'
                      ? (
                        <Suspense fallback={<LoadingState message="Loading interactive cube…" />}>
                          <OlapCubePage />
                        </Suspense>
                      )
                      : module.path === '/star-schema'
                        ? (
                          <Suspense fallback={<LoadingState message="Loading Star Schema…" />}>
                            <StarSchemaPage />
                          </Suspense>
                        )
                        : module.path === '/snowflake-schema'
                          ? (
                            <Suspense fallback={<LoadingState message="Loading Snowflake Schema…" />}>
                              <SnowflakeSchemaPage />
                            </Suspense>
                          )
                          : module.path === '/comparison'
                            ? (
                              <Suspense fallback={<LoadingState message="Loading schema comparison…" />}>
                                <StarVsSnowflakePage />
                              </Suspense>
                            )
                            : module.path === '/pattern-mining'
                              ? (
                                <Suspense fallback={<LoadingState message="Loading graph preview…" />}>
                                  <PatternMiningPage />
                                </Suspense>
                              )
                              : module.path === '/vehicle-analytics'
                                ? (
                                  <Suspense fallback={<LoadingState message="Loading vehicle analytics…" />}>
                                    <VehicleAnalyticsPage />
                                  </Suspense>
                                )
                                : <ModulePage module={module} />
                  }
                />
              ))}
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CustomerAuthProvider>
    </AdminPortalAuthProvider>
  )
}

export default App
