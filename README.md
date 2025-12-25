# sofi-app-desktop

Repo for desktop sofi application

## Сборка установщиков

### Windows

Для сборки установщика для Windows выполните:

```bash
npm run make
```

Готовый установщик будет находиться в:
```
out/make/squirrel.windows/x64/sofi-agent-1.0.0 Setup.exe
```

### macOS

**Важно:** Сборка для macOS должна выполняться на компьютере с macOS. Собрать macOS-версию на Windows невозможно.

#### Требования

1. Компьютер с macOS
2. Установленный Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

#### Сборка

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Выполните сборку:
   ```bash
   npm run make
   ```

3. Готовый ZIP-архив будет находиться в:
   ```
   out/make/zip/darwin/x64/sofi-agent-darwin-x64-1.0.0.zip
   ```

#### Установка на Mac

1. Распакуйте ZIP-архив
2. Перетащите приложение `sofi-agent.app` в папку `Applications`
3. При первом запуске macOS может показать предупреждение о безопасности — разрешите запуск в настройках безопасности

#### Примечания

- Для распространения через App Store или вне App Store потребуется кодовая подпись (code signing)
- Для создания DMG-образа можно использовать дополнительные инструменты или настроить MakerDMG в `forge.config.ts`

### Linux

#### Вариант 1: ZIP архив (можно собрать на любой платформе)

Для сборки ZIP-архива для Linux выполните:

```bash
npm run make -- --platform=linux
```

Готовый ZIP-архив будет находиться в:
```
out/make/zip/linux/x64/sofi-agent-linux-x64-1.0.0.zip
```

**Установка и запуск:**

1. Откройте терминал (Ctrl + Alt + T)
2. Перейдите в папку со скачанным архивом:
   ```bash
   cd ~/Downloads
   ```
3. Распакуйте архив в отдельную папку:
   ```bash
   unzip sofi-agent-linux-x64-1.0.0.zip -d sofi-agent
   ```
4. Перейдите в созданную папку:
   ```bash
   cd sofi-agent
   ```
5. Сделайте файл исполняемым:
   ```bash
   chmod +x sofi-agent
   ```
6. Запустите приложение:
   ```bash
   ./sofi-agent
   ```

**Примечание:** ZIP-архив не устанавливает приложение в систему. Для полноценной установки с ярлыком в меню используйте DEB или RPM пакеты.

#### Вариант 2: DEB и RPM пакеты (требуется Linux система)

**Важно:** Сборка DEB и RPM пакетов возможна только на Linux системе. На Windows можно собрать только ZIP-архив.

##### Требования

1. Компьютер с Linux (Ubuntu/Debian для DEB, Fedora/RHEL для RPM)
2. Установленные зависимости:
   ```bash
   # Для DEB пакетов (Ubuntu/Debian)
   sudo apt-get install -y dpkg-dev fakeroot
   
   # Для RPM пакетов (Fedora/RHEL)
   sudo dnf install -y rpm-build
   ```

##### Сборка

1. Установите зависимости проекта:
   ```bash
   npm install
   ```

2. Выполните сборку:
   ```bash
   npm run make
   ```

3. Готовые пакеты будут находиться в:
   ```
   out/make/deb/x64/sofi-agent_1.0.0_amd64.deb
   out/make/rpm/x64/sofi-agent-1.0.0-1.x86_64.rpm
   ```

##### Установка

**DEB пакет (Ubuntu/Debian):**
```bash
sudo dpkg -i sofi-agent_1.0.0_amd64.deb
```

**RPM пакет (Fedora/RHEL):**
```bash
sudo rpm -i sofi-agent-1.0.0-1.x86_64.rpm
```

#### Альтернативные способы сборки DEB/RPM на Windows

##### Вариант A: Docker

1. Создайте Dockerfile для сборки:
   ```dockerfile
   FROM node:18
   RUN apt-get update && apt-get install -y dpkg-dev fakeroot
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN npm run make
   ```

2. Запустите сборку:
   ```bash
   docker build -t sofi-agent-builder .
   docker run -v ${PWD}/out:/app/out sofi-agent-builder
   ```

##### Вариант B: GitHub Actions / CI/CD

Настройте автоматическую сборку в CI/CD системе, которая будет запускаться на Linux runner'ах.
