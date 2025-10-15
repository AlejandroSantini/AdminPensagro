import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import PublicRoute from "../components/guards/PublicRoute";
import AuthPage from "../pages/auth/Auth";
import DashboardPage from "../pages/dashboard/Dashboard";
import Sales from "../pages/sales/Sales";
import SaleForm from "../pages/sales/components/SaleForm";
import Users from "../pages/users/Users";
import Products from "../pages/products/Products";
import Blog from "../pages/blog/Blog";
import BusinessSettings from "../pages/businessSettings/BusinessSettings";
import Layout from "../components/layout/Layout";
import ProductForm from "../pages/products/components/ProductsTab/ProductForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/iniciar-sesion" 
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } 
      />
      
      <Route element={<Layout />}>
        <Route 
          path="/inicio" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas" 
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas/nueva" 
          element={
            <ProtectedRoute>
              <SaleForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas/:id" 
          element={
            <ProtectedRoute>
              <SaleForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clientes" 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/productos" 
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/productos/nuevo" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/productos/:id" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blog" 
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuracion-negocio" 
          element={
            <ProtectedRoute>
              <BusinessSettings />
            </ProtectedRoute>
          } 
        />
      </Route>
    <Route path="/" element={<Navigate to="/inicio" replace />} />
    <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}