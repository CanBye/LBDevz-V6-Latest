import paramiko, os, sys
from pathlib import Path

HOST = "154.193.185.11"; USER = "can"; PASSWORD = os.environ["SSH_PASS"]
SUDO = f"echo {PASSWORD} | sudo -S"; APP = "/var/www/lbdevz"
ROOT = Path(r"c:\Users\CanBye\Desktop\LBDev-V6-Latest")

FILES = [
    "src/components/ui/cosmic-parallax-bg.tsx",
    "src/components/sections/hero/hero-section.tsx",
    "src/app/globals.css",
]

def run(c, cmd, timeout=900):
    print(f"\n>>> {cmd[:100]}")
    _, o, _ = c.exec_command(cmd, get_pty=True, timeout=timeout)
    out = o.read().decode(errors="replace")
    code = o.channel.recv_exit_status()
    sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
    print(f"[exit {code}]"); return code

c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, password=PASSWORD, timeout=20, allow_agent=False, look_for_keys=False)
sftp = c.open_sftp()
for rel in FILES:
    tmp = f"/tmp/lbdevz_{rel.replace('/','_')}"
    sftp.put(str(ROOT / rel), tmp)
    run(c, f"{SUDO} mv {tmp} {APP}/{rel}")
sftp.close()
run(c, f"{SUDO} bash -lc 'cd {APP} && npm run build'", 900)
run(c, f"{SUDO} pm2 restart lbdevz")
run(c, "sleep 5")
run(c, "curl -s http://127.0.0.1:3006/api/health")
c.close()