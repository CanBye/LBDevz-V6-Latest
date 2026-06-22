"use client";

import { BookOpenIcon, InfoIcon, LifeBuoyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  dropdownDesc,
  dropdownIcon,
  dropdownLink,
  dropdownPanel,
  dropdownSeparator,
} from "@/components/layout/navbar/dropdown-theme";
import { InfoMenu, NotificationMenu, UserMenu, LanguageSwitcher } from "@/components/layout/navbar/menus";
import { useLanguage } from "@/lib/language-context";

const navTrigger =
  "h-14 bg-transparent px-5 py-2.5 text-lg font-medium text-white/70 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white";

const navLink =
  "text-lg text-white/70 hover:text-white py-2.5 px-4 font-medium bg-transparent hover:bg-white/10 rounded-md";

type NavLink =
  | { href: string; label: string }
  | {
      label: string;
      submenu: true;
      type: "description";
      items: { href: string; label: string; description: string }[];
    }
  | {
      label: string;
      submenu: true;
      type: "simple";
      items: { href: string; label: string }[];
    }
  | {
      label: string;
      submenu: true;
      type: "icon";
      items: {
        href: string;
        label: string;
        icon: "BookOpenIcon" | "LifeBuoyIcon" | "InfoIcon";
      }[];
    };

export function MiniNavbar() {
  const { t } = useLanguage();

  const navigationLinks: NavLink[] = [
    { href: "/", label: t("home") },
    { href: "#neden-biz", label: t("about") },
    { href: "/magaza", label: "Mağaza" },
    { href: "/blog", label: "Blog" },
    { href: "/forum", label: "Forum" },
    { href: "#discord", label: t("discord") },
  ];

  return (
    <header className="absolute top-10 left-1/2 z-20 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 py-3 text-white">
      <div className="flex items-center justify-between gap-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-12 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className={cn(dropdownPanel, "w-72 p-2 md:hidden")}
            >
              <nav className="flex w-full flex-col">
                {navigationLinks.map((link, index) => (
                  <div key={index} className="w-full">
                    {"submenu" in link ? (
                      <>
                        <div className="px-2 py-1.5 text-xs font-medium text-white/50">
                          {link.label}
                        </div>
                        <ul>
                          {link.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <a
                                href={item.href}
                                className="block rounded-md px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        className="block rounded-md px-4 py-3 text-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {link.label}
                      </a>
                    )}
                    {index < navigationLinks.length - 1 &&
                      ((!("submenu" in link) &&
                        "submenu" in navigationLinks[index + 1]) ||
                        ("submenu" in link &&
                          !("submenu" in navigationLinks[index + 1])) ||
                        ("submenu" in link &&
                          "submenu" in navigationLinks[index + 1] &&
                          link.type !==
                            (navigationLinks[index + 1] as Extract<
                              NavLink,
                              { submenu: true }
                            >).type)) && (
                        <div role="separator" className={cn("-mx-1 my-1 h-px w-full", dropdownSeparator)} />
                      )}
                  </div>
                ))}
              </nav>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center shrink-0">
              <img src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={44} height={44} className="rounded-xl" />
            </a>

            <div className="max-md:hidden">
              <NavigationMenu className="text-lg">
                <NavigationMenuList className="gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      {"submenu" in link ? (
                        <>
                          <NavigationMenuTrigger className={navTrigger}>
                            {link.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul
                              className={cn(
                                "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
                                link.type === "description" && "md:grid-cols-1"
                              )}
                            >
                              {link.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <NavigationMenuLink asChild>
                                    <a href={item.href} className={cn(dropdownLink, "space-y-1")}>
                                      {link.type === "icon" && "icon" in item && (
                                        <div className="flex items-center gap-2">
                                          {item.icon === "BookOpenIcon" && (
                                            <BookOpenIcon size={16} className={dropdownIcon} aria-hidden="true" />
                                          )}
                                          {item.icon === "LifeBuoyIcon" && (
                                            <LifeBuoyIcon size={16} className={dropdownIcon} aria-hidden="true" />
                                          )}
                                          {item.icon === "InfoIcon" && (
                                            <InfoIcon size={16} className={dropdownIcon} aria-hidden="true" />
                                          )}
                                          <div className="text-sm font-medium leading-none text-white">
                                            {item.label}
                                          </div>
                                        </div>
                                      )}
                                      {link.type === "description" && "description" in item && (
                                        <>
                                          <div className="text-sm font-medium leading-none text-white">
                                            {item.label}
                                          </div>
                                          <p className={dropdownDesc}>{item.description}</p>
                                        </>
                                      )}
                                      {link.type === "simple" && (
                                        <div className="text-sm font-medium leading-none text-white">
                                          {item.label}
                                        </div>
                                      )}
                                    </a>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <a href={link.href} className={navLink}>
                            {link.label}
                          </a>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <InfoMenu />
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
