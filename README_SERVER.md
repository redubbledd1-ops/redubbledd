# 🚀 Local Development Server Setup

## ⚠️ Waarom je een server nodig hebt

Ruffle (Flash emulator) werkt **NIET** met `file://` protocol vanwege browser security.

❌ **Dit werkt NIET:**
```
file:///C:/Users/Admin/Desktop/WebsiteFrank/index.html
```

✅ **Dit werkt WEL:**
```
http://localhost:8000
```

---

## 🔧 Optie 1: Python (Makkelijkste)

### Stap 1: Open PowerShell/Command Prompt
```
cd C:\Users\Admin\Desktop\WebsiteFrank
```

### Stap 2: Start de server
```
python -m http.server 8000
```

### Stap 3: Open je browser
```
http://localhost:8000
```

**Klaar!** Je site draait nu via HTTP en Ruffle werkt.

---

## 🔧 Optie 2: Node.js

### Stap 1: Open PowerShell/Command Prompt
```
cd C:\Users\Admin\Desktop\WebsiteFrank
```

### Stap 2: Start de server
```
node server.js
```

### Stap 3: Open je browser
```
http://localhost:8000
```

---

## 🔧 Optie 3: VS Code Live Server (Snelste)

### Stap 1: Installeer extensie
- Open VS Code
- Ga naar Extensions (Ctrl+Shift+X)
- Zoek: "Live Server"
- Installeer van Ritwick Dey

### Stap 2: Start server
- Rechtsklik op `index.html`
- Selecteer: "Open with Live Server"
- Browser opent automatisch op `http://localhost:5500`

---

## ✅ Checklist

- [ ] Je ziet `http://` in de URL (niet `file://`)
- [ ] Games laden zonder errors
- [ ] Ruffle emulator werkt
- [ ] FrankyBird en Shooter zijn speelbaar

---

## 🐛 Troubleshooting

### "Games laden niet"
- Zorg dat je via `http://` surft
- Check de browser console (F12) op errors
- Controleer dat `/Games/` map bestaat

### "Port 8000 is al in gebruik"
```
python -m http.server 8001
```
Dan ga je naar: `http://localhost:8001`

### "Python niet gevonden"
- Installeer Python van python.org
- Of gebruik Node.js optie

---

## 📝 Voor productie (Nginx/Proxmox)

Zorg dat je site via je domein/server IP wordt geserveerd:
```
http://jouwdomein.nl
http://192.168.1.100
```

Niet via `file://` protocol!
