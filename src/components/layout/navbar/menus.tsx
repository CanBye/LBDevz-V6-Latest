"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell, FileText, HelpCircle, Info, LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  dropdownItem,
  dropdownLabel,
  dropdownPanel,
  dropdownSeparator,
} from "@/components/layout/navbar/dropdown-theme";

const iconBtn = "size-12 text-white/80 hover:bg-white/10 hover:text-white";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-12 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
      onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
      title={language === "tr" ? "English" : "Türkçe"}
    >
      <span className="flex items-center justify-center rounded-full border-2 border-white/20 hover:border-white/40 transition-colors p-[2px] shadow-[0_0_8px_rgba(255,255,255,0.06)]">
        {language === "tr" ? (
          <Icon icon="circle-flags:tr" width={26} height={26} />
        ) : (
          <Icon icon="circle-flags:gb" width={26} height={26} />
        )}
      </span>
    </Button>
  );
}

export function InfoMenu() {
  const { t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={iconBtn}>
          <Info className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanel, "w-56")}>
        <DropdownMenuLabel className={dropdownLabel}>Information</DropdownMenuLabel>
        <DropdownMenuSeparator className={dropdownSeparator} />
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/sozlesmeler">
            <FileText className="mr-2 h-4 w-4 text-white/50" />
            {t("tickets")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/#discord">
            <HelpCircle className="mr-2 h-4 w-4 text-white/50" />
            Discord {t("destek")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NotifItem {
  id: string;
  title: string;
  body: string | null;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationMenu() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/dashboard/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifs(d.notifications ?? []);
        setUnread(d.unreadCount ?? 0);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  function handleOpen(val: boolean) {
    setOpen(val);
    if (val && unread > 0) {
      fetch("/api/dashboard/notifications", { method: "PATCH" })
        .then(() => {
          setUnread(0);
          setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        })
        .catch(() => {});
    }
  }

  if (!isLoggedIn) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(iconBtn, "relative")}>
          <Bell className="size-6" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanel, "w-80")}>
        <DropdownMenuLabel className={cn(dropdownLabel, "text-sm flex items-center justify-between")}>
          <span>Bildirimler</span>
          {unread > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400">
              {unread} yeni
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={dropdownSeparator} />
        {notifs.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-white/30">
            Yeni bildirim yok
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {notifs.slice(0, 8).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(dropdownItem, "flex-col items-start gap-0.5 py-2.5", !n.read && "bg-white/[0.02]")}
                asChild={!!n.link}
              >
                {n.link ? (
                  <Link href={n.link}>
                    <div className="flex items-center gap-1.5 w-full">
                      {!n.read && <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />}
                      <p className="text-xs font-semibold text-white/80 truncate">{n.title}</p>
                    </div>
                    {n.body && <p className="text-[10px] text-white/40 line-clamp-2 mt-0.5">{n.body}</p>}
                  </Link>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 w-full">
                      {!n.read && <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />}
                      <p className="text-xs font-semibold text-white/80 truncate">{n.title}</p>
                    </div>
                    {n.body && <p className="text-[10px] text-white/40 line-clamp-2 mt-0.5">{n.body}</p>}
                  </>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className={dropdownSeparator} />
        <DropdownMenuItem className={cn(dropdownItem, "justify-center text-center text-white/50")} asChild>
          <Link href="/dashboard">Tüm bildirimleri gör</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [balance, setBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<{ name: string; color: string } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => {
          setBalance(d.balance ?? 0);
          setIsAdmin(!!d.isAdmin);
          setRole(d.role ?? null);
        })
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="size-10 rounded-full border border-white/10 bg-white/5 animate-pulse" />
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-white/[0.12] px-4 text-sm text-white/70 hover:bg-white/10 hover:text-white" asChild>
        <Link href="/giris">
          <LogInIcon className="size-4" />
          {t("login")}
        </Link>
      </Button>
    );
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-12 text-white/80 hover:bg-white/10 hover:text-white rounded-full px-3 gap-2.5 flex items-center bg-transparent transition-colors">
          {balance !== null && (
            <span className="hidden text-xs font-semibold text-white/60 sm:block">
              {balance} ₺
            </span>
          )}
          <div className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(dropdownPanel, "w-56")}>
        <DropdownMenuLabel className={dropdownLabel}>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">{session?.user?.name ?? "Kullanıcı"}</p>
            {role && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: role.color + "22", color: role.color, border: `1px solid ${role.color}44` }}
              >
                {role.name}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 truncate">{session?.user?.email}</p>
          {balance !== null && (
            <p className="mt-1 text-xs font-bold text-white/60">{balance} ₺ {t("credits")}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={dropdownSeparator} />
        {isAdmin && (
          <>
            <DropdownMenuItem className={cn(dropdownItem, "text-indigo-400 hover:text-indigo-300")} asChild>
              <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4 text-indigo-400/70" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={dropdownSeparator} />
          </>
        )}
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4 text-white/50" />
            {t("dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/dashboard/profil">
            <Settings className="mr-2 h-4 w-4 text-white/50" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/dashboard/kredi">
            <Settings className="mr-2 h-4 w-4 text-white/50" />
            {t("buyCredits")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItem} asChild>
          <Link href="/dashboard/basvurularim">
            <Settings className="mr-2 h-4 w-4 text-white/50" />
            Başvurularım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={dropdownSeparator} />
        <DropdownMenuItem
          className={cn(dropdownItem, "text-white/60 cursor-pointer")}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4 text-white/50" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LogInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
