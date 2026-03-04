# New Social

A small social network prototype built with **React + TypeScript + Firebase**.  
Прототип социальной сети, созданный на **React + TypeScript + Firebase**.

---

# 🇬🇧 English

## About the Project

**New Social** is a social media prototype that includes authentication, feed, friends system and media content.  
The project was created as a portfolio project to demonstrate frontend architecture and Firebase integration.

## Features

- User authentication (Firebase Auth)
- Social feed
- Friends system
- Notifications
- Media upload (Firebase Storage)
- Responsive UI
- Animations with Framer Motion

## Tech Stack

- React 18
- TypeScript
- Firebase (Auth, Firestore, Storage)
- TailwindCSS
- Styled Components
- React Router
- Framer Motion

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/new-social.git
```

Install dependencies:

```bash
npm install
```

Create `.env` from example:

```bash
cp .env.example .env
```

Fill in your Firebase configuration.

Run the project:

```bash
npm start
```

Open:

```
http://localhost:3000
```

---

## Firebase Setup

1. Create a project in **Firebase Console**
2. Enable **Authentication (Email/Password)**
3. Create **Firestore Database**
4. Enable **Storage** (optional)
5. Copy config values to `.env`

---

## Project Structure

```
src/
  components/
  contexts/
  services/
  assets/
  firebaseConfig.ts
```

---

## Portfolio Improvements

This repository was prepared for portfolio usage:

- Removed `.firebase` cache
- Converted files to **UTF‑8**
- Moved Firebase config to **environment variables**
- Cleaned unnecessary console logs
- Improved `.gitignore`

---

# 🇷🇺 Русская версия

## О проекте

**New Social** — это прототип социальной сети, созданный для портфолио.  
Проект демонстрирует работу с **React, TypeScript и Firebase**.

## Возможности

- Авторизация пользователей (Firebase Auth)
- Лента постов
- Система друзей
- Уведомления
- Загрузка медиа (Firebase Storage)
- Адаптивный интерфейс
- Анимации (Framer Motion)

## Технологии

- React 18
- TypeScript
- Firebase (Auth, Firestore, Storage)
- TailwindCSS
- Styled Components
- React Router
- Framer Motion

## Установка

Клонировать репозиторий:

```bash
git clone https://github.com/YOUR_USERNAME/new-social.git
```

Установить зависимости:

```bash
npm install
```

Создать `.env` файл:

```bash
cp .env.example .env
```

Добавить настройки Firebase.

Запустить проект:

```bash
npm start
```

Открыть:

```
http://localhost:3000
```

---

## Скриншоты

Добавь сюда скриншоты проекта:

```
screenshots/feed.png
screenshots/profile.png
screenshots/chat.png
```

Пример:

```markdown
![Feed](screenshots/feed.png)
```

---

## License

MIT
