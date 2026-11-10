import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProject, getAllProjects, toggleStar, deleteProject } from "../features/project";
import { logout } from "../features/login";
import Login from "../components/Login";
import CreateProjectModal from "../components/CreateProjectModal";
import { useNavigate } from "react-router-dom";
import { setCurrentProject } from '../redux/projectSlice.js';
import { setUserData } from "../redux/userSlice.js";

/* ---------- Theme palettes (same toggle/storage key as the login page) ---------- */
const THEMES = {
  light: {
    page: "bg-slate-50 text-slate-900",
    header: "border-slate-200 bg-white/80",
    sidebar: "border-slate-200 bg-white",
    panel: "border-slate-200 bg-white",
    soft: "bg-slate-100",
    title: "text-slate-900",
    muted: "text-slate-500",
    navIdle: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    navActive: "bg-slate-100 text-slate-900",
    iconBtn: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    menu: "border-slate-200 bg-white shadow-xl shadow-slate-900/10",
    menuItem: "text-slate-700 hover:bg-slate-100",
    card: "border-slate-200 bg-white hover:border-[#2BB5A6]",
    track: "bg-slate-200",
    avatar: "bg-slate-900 text-white",
  },
  dark: {
    page: "bg-[#0A1517] text-white",
    header: "border-white/10 bg-[#0A1517]/80",
    sidebar: "border-white/10 bg-[#0A1517]",
    panel: "border-white/10 bg-[#112123]",
    soft: "bg-white/5",
    title: "text-white",
    muted: "text-slate-400",
    navIdle: "text-slate-400 hover:bg-white/5 hover:text-white",
    navActive: "bg-white/10 text-white",
    iconBtn: "text-slate-300 hover:bg-white/10 hover:text-white",
    menu: "border-white/10 bg-[#112123] shadow-xl shadow-black/40",
    menuItem: "text-slate-200 hover:bg-white/10",
    card: "border-white/10 bg-[#112123] hover:border-[#2BB5A6]",
    track: "bg-white/10",
    avatar: "bg-white text-slate-900",
  },
};

const PRIMARY_BTN =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#2BB5A6] px-4 py-2.5 text-sm font-semibold text-[#06201D] transition hover:bg-[#35c9b9] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2BB5A6]/40 active:translate-y-px";

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("kiln-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    try {
      localStorage.setItem("kiln-theme", theme);
    } catch {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
);
const FolderIcon = (p) => <Icon {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></Icon>;
const FolderOpenIcon = (p) => <Icon {...p}><path d="M3 18V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2" /><path d="M3 18l2.4-7a2 2 0 011.900-1.400H21a1 1 0 01.950 1.300L19.500 17a2 2 0 01-1.900 1.400H3z" /></Icon>;
const StarIcon = ({ filled, ...p }) => <Icon {...p} fill={filled ? "currentColor" : "none"}><path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9L12 3z" /></Icon>;
const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const BoltIcon = (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Icon>;
const SparkIcon = (p) => <Icon {...p}><path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3zM19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8L19 16z" /></Icon>;
const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></Icon>;
const MoonIcon = (p) => <Icon {...p}><path d="M21 12.800A9 9 0 1111.200 3a7 7 0 009.800 9.800z" /></Icon>;
const ChevronIcon = (p) => <Icon size={16} {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const MenuIcon = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
const LogoutIcon = (p) => <Icon size={18} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Icon>;
const TrashIcon = (p) => <Icon {...p}><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" /></Icon>;

function KilnLogo({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Kiln logo">
      <rect width="32" height="32" rx="9" fill="#0E1F22" />
      <path d="M12 9l-6 7 6 7M20 9l6 7-6 7" fill="none" stroke="#2BB5A6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10c2 2.5 3 4 3 6a3 3 0 11-6 0c0-1 .4-1.8 1.2-2.6.2 1 .8 1.4 1.3 1.4-.2-1.8.1-3.4.5-4.8z" fill="#FF9F43" />
    </svg>
  );
}

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "U";

/**
 * Props:
 *  - user: { name, email, avatar }
 *  - credits / maxCredits: numbers for the AI credits meter
 *  - projects: [{ id, name, description, updatedAt, starred }]
 *  - onNewProject, onOpenProject(project), onToggleStar(project), onUpgrade, onLogout
 */
export default function Dashboard({
  credits = 100,
  maxCredits = 100,
  onNewProject,
  onUpgrade,
  onLogout,
}) {
  
  const user = useSelector((state) => state.user.userData);
  const projectData = useSelector((state) => state.project.projectData);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [createNewProject, setCreateNewProject] = useState(false);

  useEffect(() => {
    setProjects(projectData);
  }, [projectData])


  
  const [mode, toggleTheme] = useTheme();
  const t = THEMES[mode];
  const [tab, setTab] = useState("projects");
  const [visible, setVisible] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const firstName = (user?.name || "there").split(" ")[0];
  const pct = Math.max(0, Math.min(100, (credits / maxCredits) * 100));

  const onClose = ()=>{
    setCreateNewProject(false);
  }

  useEffect(() => {
    const vis = tab === "starred" ? projects.filter((p) => p.starred) : projects;
    setVisible(vis)
  }, [projects,tab])

  // useEffect(() => {
  //   const vis = tab === "starred" ? projects.filter((p) => p.starred) : projects;
  //   setVisible(vis)
  // }, [])
  

  const onCreate = async(name, description)=>{
    try{
      const project = await createProject(name, description);
      let projectData = [...projects];
      projectData.push(project);
      setProjects(projectData);
    }
    catch(err){
      console.log(err.message);
    }
  }

  const onToggleStar = async(projectId)=>{
    try{
      let projectData = projects;
      projectData = projects.filter((p)=>{
        if(p._id == projectId)
          p.starred = !p.starred;
        return p;
      })

      setProjects(projectData);
      await toggleStar(projectId);
    }catch(err){
      console.log(err.message);
    }
  }

  const onDelete = async (projectId) => {
  if (!window.confirm("Delete this project? This cannot be undone.")) return;
  try {
    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
  } catch (err) {
    console.log(err.message);
  }
};

const handleLogOut = async()=>{
  await logout();
  dispatch(setUserData(null));
}

  const onOpenProject = (p)=>{
    dispatch(setCurrentProject(p));
    navigate(`/project/${p._id}`);
  }

  const navItem = (id, label, Ico) => (
    <button
      type="button"
      onClick={() => { setTab(id); setDrawerOpen(false); }}
      aria-current={tab === id ? "page" : undefined}
      className={`cursor-pointer flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${tab === id ? t.navActive : t.navIdle}`}
    >
      <Ico size={20} /> {label}
    </button>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-5 p-4">
      <div>
        <p className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider ${t.muted}`}>Main</p>
        <nav className="space-y-1">
          {navItem("projects", "Projects", FolderIcon)}
          {navItem("starred", "Starred", StarIcon)}
        </nav>
      </div>

      <div className="mt-auto space-y-3">
        {/* AI credits */}
        <div className={`rounded-2xl border p-4 ${t.panel}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[#2BB5A6] ${t.soft}`}>
                <SparkIcon size={16} />
              </span>
              <span className={`text-sm ${t.muted}`}>AI Credits</span>
            </div>
            <span className="text-lg font-bold">{credits}</span>
          </div>
          <div className={`mt-3 h-2 overflow-hidden rounded-full ${t.track}`} role="progressbar" aria-valuenow={credits} aria-valuemin={0} aria-valuemax={maxCredits}>
            <div className="h-full rounded-full bg-linear-to-r from-[#2BB5A6] to-[#FF9F43] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className={`mt-2 text-xs ${t.muted}`}>{credits} credits remaining</p>
        </div>

        {/* Upgrade */}
        <div className={`rounded-2xl border p-4 ${t.panel}`}>
          <p className="text-sm font-semibold">Upgrade Plan</p>
          <p className={`mt-1 text-xs ${t.muted}`}>Upgrade to Pro for more credits.</p>
          <button type="button" onClick={onUpgrade} className={`${PRIMARY_BTN} mt-3 w-full`}>
            <BoltIcon size={16} /> Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );

  if(!user){
    return <Login/>
  }

  return (
    <div className={`relative flex h-screen flex-col transition-colors duration-300 ${t.page}`}>
      {/* Header */}
      <header className={`z-30 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${t.header}`}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className={`rounded-lg p-2 md:hidden ${t.iconBtn}`}>
            <MenuIcon />
          </button>
          <KilnLogo />
          <span className="text-xl font-bold tracking-tight">Kiln</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`cursor-pointer flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${t.iconBtn}`}
          >
            {mode === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className="relative cursor-pointer" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`cursor-pointer flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${t.iconBtn}`}
            >
              {user?.avatar ? (
                <img src={user?.avatar} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${t?.avatar}`}>{initials(user?.name)}</span>
              )}
              <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
              <ChevronIcon />
            </button>

            {menuOpen && (
              <div role="menu" className={`cursor-pointer absolute right-0 mt-2 w-56 rounded-xl border p-1.5 ${t.menu}`}>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user.email}</p>
                  {user.email && <p className={`truncate text-xs ${t.muted}`}>{user.email}</p>}
                </div>
                <button type="button" role="menuitem" onClick={handleLogOut} className={`cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${t.menuItem}`}>
                  <LogoutIcon className="text-red-700"/> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className={`hidden w-64 shrink-0 border-r md:block ${t.sidebar}`}>{sidebar}</aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
            <aside className={`absolute inset-y-0 left-0 w-72 border-r ${t.sidebar}`}>{sidebar}</aside>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
          <div className=" mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, {firstName} <span aria-hidden="true">👋</span>
                </h1>
                <p className={`mt-1.5 ${t.muted}`}>Ready to build something amazing today?</p>
              </div>
              <button type="button" onClick={()=>setCreateNewProject(!createNewProject)} className={PRIMARY_BTN}>
                <PlusIcon size={18} /> New Project
              </button>
            </div>

            <h2 className="mb-4 mt-10 text-lg font-semibold">
              {tab === "starred" ? "Starred Projects" : "Recent Projects"}
            </h2>

            {visible.length === 0 ? (
              <div className={`flex flex-col items-center rounded-2xl border px-6 py-16 text-center ${t.panel}`}>
                <span className={`flex h-16 w-16 items-center justify-center rounded-full ${t.soft}`}>
                  <FolderOpenIcon size={28} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">
                  {tab === "starred" ? "No starred projects" : "No projects yet"}
                </h3>
                <p className={`mt-2 max-w-xs text-sm ${t.muted}`}>
                  {tab === "starred"
                    ? "Star a project to find it here quickly."
                    : "Create your first project and start building something amazing!"}
                </p>
                {tab === "projects" && (
                  <button type="button" onClick={()=>setCreateNewProject(!createNewProject)} className={`${PRIMARY_BTN} mt-6`}>
                    <PlusIcon size={18} /> Create Project
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.isArray(visible) && visible?.map((p) => (
                  <li key={p._id} className="relative">
                    <button
                      type="button"
                      onClick={() => onOpenProject?.(p)}
                      className={`cursor-pointer block h-full w-full rounded-2xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${t.card}`}
                    >
                      <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-[#2BB5A6] ${t.soft}`}>
                        <FolderIcon size={20} />
                      </span>
                      <p className="truncate pr-16 font-semibold">{p.name}</p>
                      {p.description && <p className={`mt-1 line-clamp-2 text-sm ${t.muted}`}>{p.description}</p>}
                      {p.updatedAt && <p className={`mt-3 text-xs ${t.muted}`}>Updated {String(new Date(p.updatedAt))}</p>}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStar?.(p._id)}
                      aria-label={p.starred ? "Remove from starred" : "Add to starred"}
                      aria-pressed={!!p.starred}
                      className={`absolute right-3 top-3 rounded-lg p-2 transition ${p.starred ? "text-[#FF9F43]" : t.muted} hover:text-[#FF9F43]`}
                    >
                      <StarIcon filled={p.starred} size={18} className='cursor-pointer'/>
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDelete(p._id)}
                      aria-label="Delete project"
                      className={`absolute right-11 top-3 cursor-pointer rounded-lg p-2 transition ${t.muted} hover:text-red-500`}
                      >
                        <TrashIcon size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>
        </main>
        </div>
        {createNewProject && <CreateProjectModal open={createNewProject} onClose={onClose} onCreate={onCreate} />}
      </div>
  );
}
