# Используем Ubuntu для поддержки как rpm, так и deb пакетов
FROM ubuntu:22.04

# Устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    rpm \
    fakeroot \
    dpkg \
    zip \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxtst6 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Проверяем версии
RUN node --version && npm --version

# Создаем рабочую директорию
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Команда по умолчанию - сборка для Linux
CMD ["npm", "run", "make"]

