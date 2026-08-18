import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Agenda from "@/pages/Agenda";
import Announcements from "@/pages/Announcements";
import Admin from "@/pages/Admin";
import Connections from "@/pages/Connections";
import CommunityHub from "@/pages/CommunityHub";
import Profile from "@/pages/Profile";
import EbdCheckin from "@/pages/EbdCheckin";
import Ebd from "@/pages/Ebd";
import Gallery from "@/pages/Gallery";
import Home from "@/pages/Home";
import Journey from "@/pages/Journey";
import NotFound from "@/pages/NotFound";
import Palavra from "@/pages/Palavra";
import Devotional from "@/pages/Devotional";
import Pastor from "@/pages/Pastor";
import Prayer from "@/pages/Prayer";
import Plans from "@/pages/Plans";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/planos" component={Plans} /><Route path="/jornada" component={Journey} /><Route path="/agenda" component={Agenda} /><Route path="/avisos" component={Announcements} /><Route path="/palavra" component={Palavra} /><Route path="/devocional" component={Devotional} /><Route path="/oracao" component={Prayer} /><Route path="/conexoes" component={Connections} /><Route path="/igreja" component={CommunityHub} /><Route path="/perfil" component={Profile} /><Route path="/galeria" component={Gallery} /><Route path="/ebd" component={Ebd} /><Route path="/ebd/check-in" component={EbdCheckin} /><Route path="/pastor" component={Pastor} /><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}
function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-center" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
