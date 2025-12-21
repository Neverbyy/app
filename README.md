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