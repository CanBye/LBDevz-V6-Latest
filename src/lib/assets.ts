/**
 * Statik dosya yolları — dosyaları `public/assets/` altına koy.
 *
 * Örnek:
 *   public/assets/logo/logo.png      →  assets.logo
 *   public/assets/hero/banner.jpg    →  assets.hero.banner
 *   public/assets/images/team.jpg    →  "/assets/images/team.jpg"
 */
export const assets = {
  logo: {
    main: "/assets/logo/logo.png",
    light: "/assets/logo/logo-light.png",
    dark: "/assets/logo/logo-dark.png",
    icon: "/assets/logo/icon.png",
    clastie: "/assets/logo/clastie.png",
  },
  hero: {
    background: "/assets/hero/background.jpg",
    showcase: "/assets/hero/showcase.png",
  },
  images: {
    products: {
      essentialPlugin: "/assets/images/products/essential-plugin.webp",
      fivemEconomy: "/assets/images/products/fivem-economy.webp",
      discordTicket: "/assets/images/products/discord-ticket.webp",
      customLauncher: "/assets/images/products/custom-launcher.webp",
    },
  },
  icons: {
    face: "/assets/icons/face.png",
    plugin: "/assets/icons/bea.gif",
    pluginPaketi: "/assets/icons/10484-healthboost.png",
    webSite: "/assets/icons/8454-website.png",
    skript: "/assets/icons/3421-powershell.png",
    fivemScript: "/assets/icons/37199-fivem.png",
    client: "/assets/icons/93448-pc.png",
    launcher: "/assets/icons/45761-spinningcat.gif",
    discordBot: "/assets/icons/544377-discordearlysupporterbadge.png",
    minecraftSymbol: "/assets/icons/Minecraft-Symbol.png",
    discordBrand: "/assets/icons/discord_PNG3.png",
    upside: "/assets/icons/upside.png",
    smiling: "/assets/icons/smiling.png",
    github: "/assets/icons/88455-github.png",
    codin: "/assets/icons/22755-codin.gif",
    flagTR: "/assets/icons/turkey.png",
    flagUS: "/assets/icons/flag-united-states_1f1fa-1f1f8.png",
    flagGB: "/assets/icons/flag-united-kingdom.png",
    flagCH: "/assets/icons/flag-switzerland.png",
  },
} as const;
