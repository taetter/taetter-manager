import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import TenantsPage from "./pages/admin/Tenants";
import TenantForm from "./pages/admin/TenantForm";
import TenantEdit from "./pages/admin/TenantEdit";
import PatientsModule from "./pages/modules/patients";
import TenantDashboard from "./pages/tenant/Dashboard";
import TenantPatients from "./pages/tenant/Patients";
import PatientForm from "./pages/tenant/PatientForm";
import PatientDetails from "./pages/tenant/PatientDetails";
import EditPatient from "./pages/tenant/EditPatient";
import ImportPatients from "./pages/tenant/ImportPatients";
import PatientLogin from "./pages/patient/Login";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientChangePassword from "./pages/patient/ChangePassword";
import TenantSettings from "./pages/tenant/Settings";
import Profile from "./pages/tenant/Profile";
import { PatientAuthProvider } from "./contexts/PatientAuthContext";
import { EmployeeAuthProvider } from "./contexts/EmployeeAuthContext";
import { SelectPatient } from "./pages/application/SelectPatient";
import { SelectVaccines } from "./pages/application/SelectVaccines";
import { ConfirmApplication } from "./pages/application/ConfirmApplication";
import { Payment } from "./pages/application/Payment";
import { Complete } from "./pages/application/Complete";
import BudgetQuote from "./pages/application/BudgetQuote";
import ApplicationHome from "./pages/application/ApplicationHome";
import FinalizeApplication from "./pages/application/FinalizeApplication";
import StockDashboard from "./pages/stock/StockDashboard";
import Units from "./pages/stock/Units";
import Refrigerators from "./pages/stock/Refrigerators";
import Vaccines from "./pages/stock/Vaccines";
import Budgets from "./pages/stock/Budgets";
import NewBudget from "./pages/stock/NewBudget";
import FinancialDashboard from "./pages/financial/FinancialDashboard";
import SchedulingDashboard from "./pages/scheduling/SchedulingDashboard";
import PriceTables from "./pages/financial/PriceTables";
import Transactions from "./pages/financial/Transactions";
import Reconciliation from "./pages/financial/Reconciliation";
import Installments from "./pages/financial/Installments";
import IndicatorsDashboard from "./pages/indicators/IndicatorsDashboard";
import BIDashboard from "./pages/bi/BIDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import QualityDashboard from "./pages/quality/QualityDashboard";
import POPs from "./pages/quality/POPs";
import RegulatoryDocs from "./pages/quality/RegulatoryDocs";
import Audits from "./pages/quality/Audits";
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import IntegrationsDashboard from "./pages/integrations/IntegrationsDashboard";
import Payslips from "./pages/employee/Payslips";
import TenantLogin from "./pages/tenant/TenantLogin";
import CreateSuperAdmin from "./pages/CreateSuperAdmin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/create-super-admin"} component={CreateSuperAdmin} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/tenants"} component={TenantsPage} />
      <Route path={"/admin/tenants/new"} component={TenantForm} />
      <Route path={"/admin/tenants/:id/edit"} component={TenantEdit} />
      <Route path={"/modules/patients"} component={PatientsModule} />
      
      {/* Tenant routes */}
      <Route path={"/tenant/login"} component={TenantLogin} />
      <Route path={"/tenant/:id/dashboard"} component={TenantDashboard} />
      <Route path={"/tenant/:id/scheduling"} component={SchedulingDashboard} />
      <Route path={"/tenant/:id/patients"} component={TenantPatients} />
      <Route path={"/tenant/:id/patients/new"} component={PatientForm} />
      <Route path={"/tenant/:id/patients/import"} component={ImportPatients} />
      <Route path={"/tenant/:id/patients/:patientId"} component={PatientDetails} />
      <Route path={"/tenant/:id/patients/:patientId/edit"} component={EditPatient} />
      <Route path={"/tenant/:id/settings"} component={TenantSettings} />
      <Route path={"/tenant/:id/profile"} component={Profile} />
      
      {/* Application module routes */}
      <Route path={"/tenant/:id/application"} component={ApplicationHome} />
      <Route path={"/tenant/:tenantId/application/budget"} component={BudgetQuote} />
      <Route path={"/tenant/:id/application/select-patient"} component={SelectPatient} />
      <Route path={"/tenant/:id/application/select-vaccines"} component={SelectVaccines} />
      <Route path={"/tenant/:id/application/confirm"} component={ConfirmApplication} />
      <Route path={"/tenant/:id/application/payment"} component={Payment} />
      <Route path={"/tenant/:id/application/finalize"} component={FinalizeApplication} />
      <Route path={"/tenant/:id/application/complete"} component={Complete} />
      
      {/* Stock module routes */}
      <Route path={"/tenant/:id/stock"} component={StockDashboard} />
      <Route path={"/tenant/:id/stock/units"} component={Units} />
      <Route path={"/tenant/:id/stock/refrigerators"} component={Refrigerators} />
      <Route path={"/tenant/:id/stock/vaccines"} component={Vaccines} />
      <Route path={"/tenant/:id/stock/budgets"} component={Budgets} />
      <Route path={"/tenant/:id/stock/budgets/new"} component={NewBudget} />
      
      {/* Financial module routes */}
      <Route path={"/tenant/:id/financial"} component={FinancialDashboard} />
      <Route path={"/tenant/:id/financial/dashboard"} component={FinancialDashboard} />
      <Route path={"/tenant/:id/financial/transactions"} component={Transactions} />
      <Route path={"/tenant/:id/financial/reconciliation"} component={Reconciliation} />
      <Route path={"/tenant/:id/financial/installments"} component={Installments} />
      <Route path={"/tenant/:id/financial/prices"} component={PriceTables} />
      
      {/* Indicators module routes */}
      <Route path={"/tenant/:id/indicators"} component={IndicatorsDashboard} />
      
      {/* B.I. module routes */}
      <Route path={"/tenant/:id/bi"} component={BIDashboard} />
      
      {/* Quality module routes */}
      <Route path={"/tenant/:id/quality"} component={QualityDashboard} />
      <Route path={"/tenant/:id/quality/pops"} component={POPs} />
      <Route path={"/tenant/:id/quality/regulatory"} component={RegulatoryDocs} />
      <Route path={"/tenant/:id/quality/audits"} component={Audits} />
      
      {/* HR module routes */}
      <Route path={"/tenant/:id/hr"} component={HRDashboard} />
      <Route path="/tenant/:id/hr/employees" component={Employees} />
      
      {/* Integrations Routes */}
      <Route path="/tenant/:id/integrations" component={IntegrationsDashboard} />
      
      {/* Patient Portal routes */}
      <Route path={"/patient/:tenantId/login"} component={PatientLogin} />
      <Route path={"/patient/:tenantId/change-password"} component={PatientChangePassword} />
      <Route path={"/patient/:tenantId/dashboard"} component={PatientDashboard} />
      
      {/* Employee Portal (ADC) routes */}
      <Route path={"/employee/:tenantId/login"} component={EmployeeLogin} />
      <Route path={"/employee/:tenantId/dashboard"} component={EmployeeDashboard} />
      <Route path={"/employee/:tenantId/payslips"} component={Payslips} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <PatientAuthProvider>
          <EmployeeAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </EmployeeAuthProvider>
        </PatientAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
